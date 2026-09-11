---
title: Zhixu DSL
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Zhixu DSL

> Prerequisite reading: [Core Concepts](../README.md)
`Zhixu` is the pinyin for "order". In this repository, a Zhixu is the reusable coordination rulebook designed by a nucleus. It uses a DSL to declare one class of reusable production relations: which task patterns exist, which stages each task has, which source causal chain each stage sits on, which signals it receives, which signals it emits, whether facts mint orders, who the default executor is, which stages may choose executors for other stages, which resources are required, and (optionally) which dock interface is published.

The code entry point is `ZhixuDefinition` in `uvp-protocol/packages/compiler/src/types/index.ts`. An Order is one runtime instance of this rulebook after it has been compiled and registered.

## Who Uses It

Nuclei and order designers write the Zhixu DSL; the compiler compiles it into on-chain artifacts; Store, publishers, and registrars review, publish, and use it to create orders. Ordinary participants usually consume it only indirectly through Product/Store projections.

## What It Produces

A Zhixu compiles into deterministic HookPlanArtifact and OnchainHookPlanArtifact artifacts; after registration via `commitPlan` + `finalizePlan` it becomes a Plan that can create Orders; the same Plan can run many Orders.

## Where Authority Comes From

The DSL text itself is only a design draft. Plan identity is decided by compiled artifact hashes and on-chain registration; order runtime facts come from `UVPStateMachine` events. The field descriptions on this page stay in sync with the compiler type definitions.

## Minimal Skeleton

```yaml
apiVersion: uvp/v0
kind: Zhixu
metadata:
  name: cross-border-procurement
spec:
  platform:
    type: blockchain
    provider: eth
    network: base
    version: 0.1.3 <!-- illustrative value; defer to the compiler's current version -->
  nucleation:
    id: procurement-nucleus
  taskPatterns:
    - name: master
      stages:
        - name: intake
          source: customer
          mint: per-fact
          receiveSignals:
            REQUESTED: "::ANCHOR(@customer::request.submit.requested)"
          sendSignals: [str, cmp, err]
          executor:
            supplierType: organization
            supplierID: "{{ .intake_executor_uid }}"
        - name: supplier_sourcing
          source: supply
          receiveSignals:
            SCOPE_READY: customer::master.intake.cmp
          sendSignals: [str, cmp, err]
          executor:
            supplierType: zhixu
            zhixuExecutorConfig:
              target:
                zhixu: supplier-sourcing
              interface: sourcing_service
              order:
                mode: new
              inputMap:
                SCOPE_READY: intake   # the key must be a receiveSignals channel declared by this stage (D005); the value is the target interface's input port name
              signalMap:
                str: start
                cmp: complete
                err: failed
```

This example shows three things: a `mint: per-fact` stage subscribes to an `ANCHOR(@...)` fact and deterministically mints at most one order per fact; a normal stage advances through `receiveSignals`; and a delegated stage docks another Zhixu as its execution interface with target-port `inputMap`/`signalMap` entries. After proof validation and authorized submitter mapping, the linked order's output drives the local order forward. For the protocol semantics of `signalMap` and its runtime docking, see [Zhixu as Executor](../apps/zhixu-as-executor.md) and [Executor](executor.md).

## Top-Level Fields

| Field | Meaning |
| --- | --- |
| `apiVersion` | DSL version, currently `uvp/v0`. |
| `kind` | The DSL top-level object is fixed to `Zhixu`. |
| `metadata.name` | Required slug (`^[a-z][a-z0-9_-]{0,99}$`); the key for referencing target definitions inside the DSL (`target.zhixu` is the target's `metadata.name`). Resolving the name to an entity is each track's authority: the cloud track looks it up by unique registered name, the chain track's publication surface resolves it to the content-derived identity. |
| `metadata.uid` | Not a DSL field: any occurrence is loudly rejected as an unknown field. The DSL shell carries no derived identity; identity schemes are track-split (chain track content-derived, cloud track database-authoritative). |
| `metadata.labels` | Business classification, industry, demo tags; part of the definition content (the chain track's identity derivation includes labels — a chain-track internal; the cloud track stores them as content only). On-chain permissions are decided by order authorization and overlays. |
| `metadata.annotations` | Free-form annotations; never part of identity or hash derivation (Zhixu has no native version semantics; the `version` key gets no special treatment). |
| `spec.platform` | Target platform. The EVM track uses `type=blockchain`, `provider=eth`, optionally `network=base`. Omitting `network` keeps the current mainnet default path. |
| `spec.nucleation.id` | Identifier of the initiating nucleus, designer, or organizational domain of the order. See [Nucleus / 凝结核](nucleation.md). |
| `spec.taskPatterns` | Task pattern list containing stages. |

## Stage Fields

| Field | Meaning |
| --- | --- |
| `name` | Stage name. Combined with the task pattern name into `stageIdentifier`. |
| `source` | The causal chain this stage's signals belong to; user roles are interpreted separately by Product/authorization. |
| `mint` | Optional birth policy; the only value is `per-fact`, which mints at most one order per subscribed fact. |
| `receiveSignals` | Mapping from hook key to Hook DSL expression. |
| `sendSignals` | Signal names the stage may emit after completion. |
| `executor` | Default executor configuration pointing to a supplier or another Zhixu. |
| `selectedStages` | Which target stages this stage may choose executors for. |
| `fileResources` | Off-chain resource handles such as stage protocols, evidence requirements, or resource manifests. See [File Resources](file-resources.md). |

The compiler turns `taskPattern.name + "." + stage.name` into `stageIdentifier`. For example, `master.supplier_sourcing` is hashed into the on-chain `stageId`.

## `receiveSignals` and `mint`

`receiveSignals` define Hook conditions. A normal expression is evaluated in the current order context; a cross-source subscription uses the empty-header `::ANCHOR(@source::task.stage.signal)` form and is delivered event by event by the routing layer. Whether a stage is a birth stage is determined only by `mint: per-fact`, not by `trigger` or `externalSignals` declarations:

```yaml
mint: per-fact
receiveSignals:
  REQUESTED: "::ANCHOR(@customer::request.submit.requested)"
```

`mint` accepts only `per-fact`; a birth stage must contain at least one `ANCHOR(@...)` subscription and use a static individual/organization executor. The compiler rejects self-loops and unbounded cross-source re-mint cycles. A stage without `mint` may use a normal `source::condition` hook or an `ANCHOR(@...)` channel listener; its order identity comes from existing order routing or an executor's self-reported order. The retired `trigger`, `externalSignals`, and wrapper forms other than the subscription (`::OUTSIDE@`, the old `::ANCHOR@(…)`) are rejected explicitly.

## `selectedStages`

`selectedStages` grants a stage the executor-patch capability over target stages. In a customs-closure loop, for example, the buyer's submission stage may designate a specific executor for `customs.complete`. The compiler turns this relation into a selector binding, and the contract checks the stage-to-target binding during an executor patch.

```yaml
selectedStages:
  - customs.complete
```

Only stages with a selector binding may change the executor of the corresponding target stage.

## `executor`

`executor` points at the default capability subject:

| `supplierType` | Meaning |
| --- | --- |
| `individual` | Individual executor. |
| `organization` | Organization, enterprise system, service provider, or team. |
| `zhixu` | Another Zhixu docked as the execution interface; its reference is in `zhixuExecutorConfig.target`. |

`supplierID` is allowed only for `individual`/`organization` executors. For `supplierType=zhixu`, `supplierID` is forbidden and `zhixuExecutorConfig` is required. That config declares the target definition reference (`target.zhixu`, the target definition's `metadata.name`, or `null` for runtime selection), the target interface name (`interface`), the order mode (`order.mode` ∈ {new, existing}), and the `inputMap`/`signalMap` from local channels/signals to target interface ports (at least one non-empty map; `mode=new` carries exactly one input binding). Resolving the name to target definition/artifact/interface entities is each track's authority: the core linker looks names up in the `uvp.dock.resolution.v2` manifest's name directory, the chain track's publication surface embeds the definition in full in that manifest and the TS compiler recomputes the content-derived identity as a content-addressing check (chain-track internal), and the cloud track looks the unique name up in its database. The active executor wallet in an order is decided by order registration authorization or the `StageExecutorPatchApplied` runtime event.

## `fileResources`

`fileResources` record stage protocols, evidence requirements, acceptance criteria, or resource handles. A stage can point to off-chain protocol files or object-storage resources; `fileType` values are the closed set `local` / `http` / `txcloud` / `plain_text` (see [File Resources](file-resources.md)):

```yaml
fileResources:
  sourcing_contract:
    fileType: http
    httpFile:
      url: "https://example.com/protocols/supplier-sourcing-v1.json"
```

These business files never go on chain. Only hashes, URIs, or resource patch events are recorded on chain.

## Difference Between Zhixu, Plan, and Order

| Concept | Static/Dynamic | Meaning |
| --- | --- | --- |
| Nucleus / 凝结核 | Organizational subject | The order organizer who initiates, designs, and maintains a Zhixu; `nucleation` is the field and nucleation context. |
| Zhixu (order) | Static DSL | Reusable coordination rulebook. |
| Plan | Chain-target artifact | The artifact, hashes, and registration parameters a Zhixu compiles to for EVM. |
| Order | Dynamic instance | One run of a Plan, containing signals, hook runtime, stage overlays, and proof. |

One Zhixu can compile into multiple Plans for different platforms or versions; the same Plan can produce multiple Orders.
