---
title: Compiler and Hook Core
type: explanation
audience: 工程贡献者
status: verified
---

# Compiler and Hook Core

The Compiler and Hook Core are the entry point through which protocol semantics pass before reaching chain. They do not handle order execution, databases, funding, or frontend UI; their only job is turning DSL into deterministic semantic artifacts.

## Hook Core

`uvp-protocol/packages/hook-core` is responsible for:

- Parsing `source::condition`.
- Supporting `&`, `|`, `~`, and delay; Hook expressions are interpreted only over the current order's fact set; cross-order facts enter as in-order facts emitted by a static Dock's binding before a hook consumes them.
- Generating receive Hooks from stage `receiveSignals` and synthesizing one order-trigger Hook per `sendSignals` entry marked `trigger: true`.
- Interpreting `~A` as "the A signal has not yet appeared in the current order's event set". Once a signal appears it never disappears, so this is monotonic existence logic.
- Extracting positive, negative, and timer dependencies.
- Providing a local evaluator shared by the compiler and the reference runtime.

Hook Core output remains platform-neutral semantics with no Solidity ABI.

## Compiler

`uvp-protocol/packages/compiler` is responsible for:

- Loading YAML/JSON Zhixu.
- Validating stages, `receiveSignals`, `sendSignals[].trigger` entries, static-executor constraints, `selectedStages`, executor reachability, and `fileWriters` references.
- Consuming uvp-core's analyze wire `uvp.zhixuAnalysis.v1`, synthesizing birth hooks from each stage's normalized birth signal names, and generating the `OnchainHookPlanArtifact` (including the derived `triggers[]` enumeration); a separate `kind: Dock` document goes through `analyzeDock` into `uvp.dock.v1`.
- Generating Solidity `commitPlan`/`finalizePlan` parameters.
- Computing `planId`, `planHash`, and hook/stage/source/signal/dependency/route ids.

## Component Responsibilities

| Component | Responsible for | Adjacent boundary |
| --- | --- | --- |
| uvp-core | Normative implementation of the Hook DSL, AST, evaluation, dependency extraction, positive anchors, and canonical semantic version. | Solidity ABI, wallet authorization, and Product task language are handled by later layers. |
| hook-core | TypeScript adapter over uvp-core semantics plus version assertions; introduces no separate semantics. | Must not fork parsing/evaluation rules away from uvp-core. |
| compiler | Order input schema, OnchainHookPlan, commitPlan/finalizePlan args, canonical hash; calls uvp-core semantics, with HookPlan only as internal IR. | Order participant selection, supplier identity judgment, runtime Dock selection/binding, and payment/settlement-custody logic belong to products, registries, deployment tooling, or periphery. |
| artifact/hash | The stable boundary of `planId`, `planHash`, `hookId`, `sourceId`, `signalId`, `signalKey`. | Store draft state and Product DB primary keys are read models. |

## Compiler Input/Output Boundary

The compiler's output is deterministic plan artifacts and registration parameters. Order participants, wallet authorization, contract deployment, supplier identity, settlement custody, or funding are handled by later Product, registry, deployment, or periphery layers. The compiler answers exactly one question: can this static Zhixu be deterministically compiled into an EVM-registrable plan.

## Why It Is Architecture-Critical

The compiler's determinism guarantees every party derives the same plan hash. Contracts register compact hooks, the publisher signs the plan hash, and Product DTOs show tasks for that Plan. Only because hashes and schema are reproducible is the whole pipeline auditable.

## Compile-Time Semantics That Must Hold

All of the following are compile-time rules, not runtime rules; for runtime evaluation see [Hook Evaluation](state-machine/evaluation.md).

- `receiveSignals` keys are receive-hook names for the stage and values are their canonical expressions; `sendSignals` entries marked `trigger: true` are synthesized into order-trigger hooks after analyze normalization.
- An Order entry is explicit in `orderTriggerKind` (closed set `none` / `trigger`); whether Ready is externally emitted is a separate `emitReady` boolean; dock stages are distinguished by the `HOOK_FLAG_DOCK_EXECUTOR` marker.
- Each birth signal synthesizes one order-trigger hook (single `SIGNAL` instruction, `emitReady=true`, registering the `ORDER_TRIGGER_MINT` bit); a stage/plan may declare several birth signals, and birth selects one explicitly via `triggerHookId` + `triggerStageId`.
- A stage with `supplierType: dock` is carried by another Zhixu: the B side publishes a separate `kind: Dock` document (`spec.from` / `spec.to` / `spec.signalMap`) whose `signalMap` values are Hook-DSL emission-admission expressions with header source fixed to `spec.from.source`; `analyzeDock` compiles that document into `uvp.dock.v1`. The attach stage declares only `supplierType: dock` (the B side needs no `supplierID`); the executor is selected once on the order via `selectStageDockExecutor`, and the binding is carried by the `dock_link` file entry plus `pokeDockBinding`'s A/B time-window emission.
- Hook expressions evaluate under monotonic existence logic: `A` means the signal has appeared, `~A` means it has not yet appeared; once a signal appears it never disappears.
- Hook expressions must have a positive anchor; a pure-absence condition cannot become an advancing hook.
