---
title: Zhixu DSL
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Zhixu DSL

> Prerequisite reading: [Core Concepts](../README.md)
`Zhixu` is the pinyin for "order". In this repository, a Zhixu is the reusable coordination rulebook designed by a nucleus: it uses a DSL to declare one class of reusable production relations — which stages exist, which source causal chain each stage sits on, which signals it receives, which signals it emits, whether it carries a birth entry (`trigger: true` on a `sendSignals` entry), who the default executor is (a static plain executor, or a dock executor declared with `supplierType: dock` and selected at runtime), which stages may choose executors for other stages, which resources are required, and which static Docks the counterparty must declare for cross-order collaboration.

The code entry point is `ZhixuDefinition` in `uvp-protocol/packages/compiler/src/types/index.ts`. An Order is one runtime instance of this rulebook after it has been compiled and registered. Field and semantic authority is the language-layer manual `uvp-core/docs/zhixu-dsl-grammar.md`; this page is only a conceptual entry point.

## Who Uses It

Nuclei and order designers write the Zhixu DSL; the compiler compiles it into on-chain artifacts; Store, publishers, and registrars review, publish, and use it to create orders. Ordinary participants usually consume it only indirectly through Product/Store projections.

## What It Produces

A Zhixu compiles into deterministic hook plan and on-chain artifacts (`uvp.hookPlan.v1` / `uvp.onchainHookPlan.v1`); after registration via `commitPlan` + `finalizePlan` it becomes a Plan that can create Orders, and the same Plan can run many Orders. Cross-order A→B emission conditions live in a separate `kind: Dock` document compiled to `uvp.dock.v1`, not inside `Zhixu.spec`.

## Where Authority Comes From

The DSL text itself is only a design draft. Definition identity is a content-derived uid `zx-<32hex>` (canonical JSON with `metadata.name`/`metadata.annotations` stripped, hashed under domain `uvp:definition-uid:v2`); Plan identity is decided by compiled artifact hashes and on-chain registration; order runtime facts come from `UVPStateMachine` events. The field descriptions on this page stay in sync with the language-layer manual and compiler type definitions.

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
  nucleation:
    id: procurement-nucleus
  stages:
    - name: intake
      source: customer
      sendSignals: [{name: requested, trigger: true}, {name: str}, {name: cmp}, {name: err}]
      executor:
        supplierType: organization
        supplierID: "{{ .intake_executor_uid }}"
    - name: supplier_sourcing
      source: supply
      receiveSignals:
        SCOPE_READY: customer::intake.cmp
      sendSignals: [{name: str}, {name: cmp}, {name: err}]
      executor:
        supplierType: dock
```

This example shows three things: `intake` declares `requested` as a birth signal — an empty-`orderId` submission that hits it creates the order and writes the first fact; `supplier_sourcing` waits for in-order facts through `receiveSignals`; and `supplier_sourcing` is a dock stage — its executor is selected once at runtime, and the cross-order A→B emission conditions are declared by a separate `kind: Dock` document:

```yaml
apiVersion: uvp/v0
kind: Dock
metadata:
  name: sourcing_service
spec:
  from:
    zhixu: zx-9c41f0d27a3e5b86c4d1af0b7e285c36   # content-derived uid of a published definition
    source: supply
  to:
    zhixu: zx-2f7a1c9b4e6d8053a1c2b3d4e5f60718
    stage: supplier_sourcing
  signalMap:
    cmp: "supply::supplier_sourcing.str"
```

Dock declaration and runtime binding semantics are covered in [Executor](executor.md) and language-manual §7; Dock does not create orders.

## Top-Level Fields

| Field | Meaning |
| --- | --- |
| `apiVersion` | DSL version, currently `uvp/v0`. |
| `kind` | The DSL top-level object is `Zhixu`; the cross-order declaration is a sibling `kind: Dock` (a separate document, above). |
| `metadata.name` | Required slug (`^[a-z][a-z0-9_-]{0,99}$`); it is display-only, neither an identity nor an addressing key — cross-order references always use the content-derived uid (`spec.from.zhixu` / `spec.to.zhixu`). |
| `metadata.uid` | Not a DSL field: any occurrence is loudly rejected as an unknown field. The DSL shell carries no derived identity. |
| `metadata.labels` | Business classification, industry, demo tags; part of the definition content, participating in content-derived identity. |
| `metadata.annotations` | Free-form annotations; never part of identity or hash derivation (Zhixu has no native version semantics; the `version` key gets no special treatment). |
| `spec.platform` | Track declaration: the EVM track uses `type=blockchain`, `provider=eth`, optionally `network=base`. |
| `spec.nucleation.id` | Identifier of the initiating nucleus, designer, or organizational domain of the order. See [Nucleus / 凝结核](nucleation.md). |
| `spec.stages` | Stage list; stage names are globally unique within the Zhixu. |

## Stage Fields

| Field | Meaning |
| --- | --- |
| `name` | Stage name; it is the `stageIdentifier` itself, globally unique within the Zhixu. |
| `source` | The causal chain this stage's signals belong to (a Zhixu-local namespace that several stages may share); user roles are interpreted separately by Product/authorization. |
| `sendSignals` | Outbound signal declarations; entries are objects `{name, validWhen?, trigger?}`: `name` is required and must be unique after normalization; `validWhen` is the emission admission declaration (a list of expressions, see [Signal](signal.md)); an entry marked `trigger: true` is a birth signal. |
| `receiveSignals` | In-order hooks: channel name → Hook DSL expression, evaluated only in this order's context. |
| `executor` | Executor declaration: plain (`individual`/`organization` + `supplierID`) or `supplierType: dock` (selected at runtime). |
| `selectedStages` | Which target stages this stage may choose/bind executors for. |
| `fileResources` | Off-chain resource handles such as stage protocols, evidence requirements, or resource manifests. See [File Resources](file-resources.md). |
| `fileWriters` | Cross-stage file-write allowlist: which stages may write this stage's file map (self is implicitly writable and never self-referenced). |

The compiler uses a stage's `name` directly as the `stageIdentifier`. For example, `supplier_sourcing` is hashed into the on-chain `stageId`.

## Birth Signals

The birth entry is declared by `trigger: true` on a `sendSignals` entry; there is no stage-level entry field:

```yaml
sendSignals: [{name: requested, trigger: true}, {name: str}, {name: cmp}, {name: err}]
```

- A birth entry must belong to the stage's `sendSignals` and be unique within the stage; the birth set is fixed at compile time and enters the plan commitment and the on-chain artifacts.
- A stage may declare several birth signals; a plan may have several birth stages; a birth stage need not be the first stage.
- A birth stage must be carried by a static plain executor (`individual`/`organization` + `supplierID`); birth rights never drift with dock bindings or runtime patches.
- Empty order id + birth signal: the signal's `validWhen` is evaluated in the empty-order context first (no facts/files — negative conditions true, existence/delay conditions false); on success the order id is derived from the birth fact, the order is created, and the signal is written as the first fact. Re-delivery of the same birth fact is idempotent. An empty order id with a non-birth signal is rejected by name; a birth signal with an order id is an ordinary in-order fact.
- The chain track has three runtime birth channels: outside-trigger open submission, order-link derived creation, and governance fork `forkOrder` (see [Order](order.md)). Dock carries emission through a binding on an existing order and does not create orders.

## `receiveSignals` and In-order Fact Connections

Each `receiveSignals` value is an in-order Hook of the form `{source}::{condition}`, evaluated in the order context and able to reference any declared signal of any stage within the same Zhixu. It expresses "whether some fact already happened in this order", not a cross-order subscription:

```yaml
receiveSignals:
  SCOPE_READY: customer::intake.cmp
```

Cross-order collaboration has no Hook-DSL subscription form: the B side publishes a separate `kind: Dock` document declaring A→B emission conditions, the target stage declares `executor.supplierType: dock`, and after a binding is established on the attach stage, dock emission writes the B output as an in-order fact.

## `selectedStages`

`selectedStages` grants a stage the executor-patch capability over target stages. In a customs-closure loop, for example, the buyer's submission stage may designate a specific executor for `complete`. The compiler turns this relation into a selector binding, and the contract checks the stage-to-target binding during an executor patch.

```yaml
selectedStages:
  - complete
```

Only stages with a selector binding may change the executor of the corresponding target stage; the patch target must hit the Plan-committed executor candidate set, and birth stages and dock stages do not use the general executor patch.

## `executor`

`executor` points at the default capability subject:

| `supplierType` | Meaning |
| --- | --- |
| `individual` | Individual executor. |
| `organization` | Organization, enterprise system, service provider, or team. |
| `dock` | A dock executor carried by another Zhixu: the definition declares only the type, and the executor identity is selected once by the order on the attach stage at runtime and then pinned. |

`supplierID` applies only to `individual`/`organization` executors (required). With `supplierType: dock` there is no `supplierID`; the stage must declare its binding face through `receiveSignals`, and it enters neither plan-level executor routes nor the candidate set. Selection and binding are covered in [Executor](executor.md).

## `fileResources` and `fileWriters`

`fileResources` record stage protocols, evidence requirements, acceptance criteria, or resource handles. A stage can point to off-chain protocol files or object-storage resources; `fileType` values are the closed set `local` / `http` / `txcloud` / `plain_text` (see [File Resources](file-resources.md)):

```yaml
fileResources:
  sourcing_contract:
    fileType: http
    httpFile:
      url: "https://example.com/protocols/supplier-sourcing-v1.json"
```

These business files never go on chain. On chain only content hashes, handles, and stage file patch events are recorded; runtime rewrites are carried by `UVPFileResourceModule` (`key -> (contentHash, handle)`), authorized through the `fileWriters` allowlist.

## Difference Between Zhixu, Plan, and Order

| Concept | Static/Dynamic | Meaning |
| --- | --- | --- |
| Nucleus / 凝结核 | Organizational subject | The order organizer who initiates, designs, and maintains a Zhixu; `nucleation` is the field and nucleation context. |
| Zhixu (order) | Static DSL | Reusable coordination rulebook. |
| Plan | Chain-target artifact | The artifact, hashes, and registration parameters a Zhixu compiles to for EVM. |
| Order | Dynamic instance | One run of a Plan, containing signals, hook runtime, stage executor patch, stage file patch, dock binding, and proof. |

One Zhixu can compile into multiple Plans for different platforms or versions; the same Plan can produce multiple Orders.
