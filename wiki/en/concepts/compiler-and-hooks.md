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
- Supporting `&`, `|`, `~`, delay, and the empty-header wrappers `::OUTSIDE@(…)`, `::MERGE@(…)`, `::ANCHOR@(task.stage.signal)`; bare `OUTSIDE` / `ANCHOR` have been removed, and `OUTSOURCE` is fully retired (parse-time error).
- Stage `externalSignals` are kept by the compiler as direct input contracts for backend/executor and are never compiled into Hooks.
- Interpreting `~A` as "the A signal has not yet appeared in the current order's event set". Once a signal appears it never disappears, so this is monotonic existence logic.
- Extracting positive, negative, and timer dependencies.
- Providing a local evaluator shared by the compiler and the reference runtime.

Hook Core output remains platform-neutral semantics with no Solidity ABI.

## Compiler

`uvp-protocol/packages/compiler` is responsible for:

- Loading YAML/JSON Zhixu.
- Validating stages, triggers, receiveSignals, selectedStages, and executor reachability.
- Generating the `OnchainHookPlanArtifact`.
- Generating Solidity `registerPlan` parameters.
- Computing `planId`, `planHash`, and hook/stage/source/signal/dependency/route ids.

## Component Responsibilities

| Component | Responsible for | Adjacent boundary |
| --- | --- | --- |
| uvp-core | Normative implementation of the Hook DSL, AST, evaluation, dependency extraction, positive anchors, and canonical semantic version. | Solidity ABI, wallet authorization, and Product task language are handled by later layers. |
| hook-core | TypeScript adapter over uvp-core semantics plus version assertions; introduces no separate semantics. | Must not fork parsing/evaluation rules away from uvp-core. |
| compiler | Order input schema, OnchainHookPlan, registerPlan args, canonical hash; calls uvp-core semantics, with HookPlan only as internal IR. | Order participant selection, supplier identity judgment, linked-order registration, and payment/escrow logic belong to products, registries, or periphery. |
| artifact/hash | The stable boundary of `planId`, `planHash`, `hookId`, `sourceId`, `signalId`, `signalKey`. | Store draft state and Product DB primary keys are read models. |

## Compiler Input/Output Boundary

The compiler's output is deterministic plan artifacts and registration parameters. Order participants, wallet authorization, contract deployment, supplier identity, escrow, or funding are handled by later Product, registry, deployment, or periphery layers. The compiler answers exactly one question: can this static Zhixu be deterministically compiled into an EVM-registrable plan.

## Why It Is Architecture-Critical

The compiler's determinism guarantees every party derives the same plan hash. Contracts register compact hooks, the publisher signs the plan hash, and Product DTOs show tasks for that Plan. Only because hashes and schema are reproducible is the whole pipeline auditable.

## Compile-Time Semantics That Must Hold

All of the following are compile-time rules, not runtime rules; for runtime evaluation see [Hook Evaluation](state-machine/evaluation.md).

- `stage.trigger` must reference an existing `externalSignals` or `receiveSignals` key of the same stage.
- `externalSignals` are the direct input contract of backend/executor and are not compiled into hooks; only `receiveSignals` produce hooks.
- A receive hook only emits `HookReady` when Ready if its `trigger=true`.
- `signalMap` hooks currently have `trigger=false`.
- The `signalMap` of `supplierType=zhixu` must include `str` and `cmp`, and the same map must reference a single source.
- Hook expressions evaluate under monotonic existence logic: `A` means the signal has appeared, `~A` means it has not yet appeared; once a signal appears it never disappears.
- Hook expressions must have a positive anchor; a pure-absence condition cannot become an advancing hook.
