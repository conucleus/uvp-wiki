# Zhixu DSL

`Zhixu` is the transliteration of the underlying Chinese coordination term. In this repository, Zhixu is the reusable coordination rulebook designed by a Nucleus. It uses a DSL to declare a reusable production relationship: which task patterns exist, which stages each task has, which source causal chain each stage belongs to, what signals it receives, what signals it emits, who the default Supplier is, which stages can choose an executor for other stages, and which resources are required.

The code entry point is `ZhixuDefinition` in `uvp-protocol/packages/compiler/src/types/index.ts`. An Order is one runtime instance of this rulebook after compilation and registration.

## Minimal Skeleton

```yaml
apiVersion: uvp/v0
kind: Zhixu
metadata:
  name: cross-border-procurement
  uid: zhixu-cross-border-procurement-v1
  annotations:
    version: "1"
spec:
  platform:
    type: blockchain
    provider: eth
    network: base
    version: 0.1.3
  nucleation:
    id: procurement-nucleus
  taskPatterns:
    - name: master
      stages:
        - name: supplier_sourcing
          source: supply
          trigger: ["SCOPE_READY"]
          receiveSignals:
            SCOPE_READY: solution::master.technical_scope.cmp
          sendSignals: [str, cmp, err]
          executor:
            supplierType: zhixu
            supplierID: "{{ .supplier_sourcing_zhixu_uid }}"
            zhixuExecutorConfig:
              signalMap:
                str: sourcing::source.start.str
                cmp: sourcing::source.close.cmp
                err: sourcing::source.close.err
```

This says: the local Zhixu stage `master.supplier_sourcing` is triggered by `solution::master.technical_scope.cmp`; that stage uses another `supplier-sourcing` Zhixu as its execution interface; the `sourcing::source.close.cmp` signal in the linked Zhixu, after proof validation and authorized submitter mapping, drives the local Zhixu forward. See [Zhixu as Executor](../../execution/zhixu-as-executor.md).

## Top-Level Fields

| Field | Meaning |
| --- | --- |
| `apiVersion` | DSL version, currently `uvp/v0`. |
| `kind` | The current DSL top-level object is always `Zhixu`. |
| `metadata.name` | Human-readable name, also part of the plan identity. |
| `metadata.uid` | Stable Zhixu ID. Falls back to the name when absent. |
| `metadata.labels` | Business category, industry, and demo labels. On-chain authorization is controlled by order authorization and overlays. |
| `metadata.annotations.version` | Plan version. Version changes flow into `planId`. |
| `spec.platform` | Target platform. The EVM track uses `type=blockchain`, `provider=eth`, and may set `network=base`. If `network` is absent, the current mainnet/default path is preserved. |
| `spec.nucleation.id` | Identifier for the originating Nucleus, designer, or organizing domain of the Zhixu. See [Nucleus / Nucleation](nucleation.md). |
| `spec.taskPatterns` | List of task patterns, each of which contains stages. |

## Stage Fields

| Field | Meaning |
| --- | --- |
| `name` | Stage name. Combined with the task pattern name to form `stageIdentifier`. |
| `source` | The causal chain this stage’s signals belong to; user roles are interpreted separately by Product and authorization. |
| `trigger` | Which hooks emit `HookReady` after becoming ready, thereby producing actionable tasks. See [Trigger](trigger.md). |
| `receiveSignals` | Mapping from hook key to a Hook DSL expression. |
| `sendSignals` | Signal names that may be emitted after the stage completes. |
| `executor` | Default executor configuration, pointing to a Supplier or another Zhixu. |
| `selectedStages` | Which target stages this stage can choose an executor for. |
| `fileResources` | Off-chain resource handles for stage protocol files, evidence requirements, and resource lists. See [File Resources](file-resources.md). |

The compiler turns `taskPattern.name + "." + stage.name` into `stageIdentifier`. For example, `master.supplier_sourcing` becomes the on-chain `stageId` hash.

## `trigger` and `receiveSignals`

`receiveSignals` defines the hook conditions, and `trigger` decides which hooks become Product tasks. The two must align:

```yaml
trigger:
  - SCOPE_READY
receiveSignals:
  SCOPE_READY: solution::master.technical_scope.cmp
```

If a `trigger` refers to a key that does not exist, the compiler raises an error. Only hooks marked by the stage `trigger` emit `HookReady` when they first become ready; other hooks can be used for internal dependencies, `signalMap`, or observation.

## `selectedStages`

`selectedStages` is the executor patch capability from one stage to a target stage. For example, in a customs flow, the buyer-submitted stage can specify a concrete executor for `customs-complete`. The compiler turns this relationship into selector bindings, and the contract checks that stage-to-target binding during executor patching.

```yaml
selectedStages:
  - customs-complete
```

Only stages that have a selector binding may choose an executor for the corresponding target stage.

## `executor`

`executor` points to the default capability subject:

| `supplierType` | Meaning |
| --- | --- |
| `individual` | An individual executor. |
| `organization` | An organization, enterprise system, service provider, or team. |
| `zhixu` | Another Zhixu acting as the execution interface. |

`supplierID` is the Supplier or peer Zhixu identifier resolved from Store, governance, or deployment materials. The active executor wallet in an Order is determined by order registration authorization or by the runtime `StageExecutorPatchApplied` event.

## `fileResources`

`fileResources` records stage protocol files, evidence requirements, acceptance criteria, or resource handles. A stage may point to off-chain protocol files, manifest URIs, or object storage resources, together with hashes:

```yaml
fileResources:
  sourcing_contract:
    fileType: manifest
    resourceRole: stage_protocol
    resourceType: document
    mediaType: application/json
    manifest:
      manifestURI: "urn:uvp:resource-manifest:supplier-sourcing:v1"
      manifestHash: "0x3002..."
      policyHash: "0x7120..."
      visibility: protected
```

These business files do not go on chain. On chain only records hashes, URIs, or resource patch events.

## Zhixu, Plan, and Order

| Concept | Static / Dynamic | Meaning |
| --- | --- | --- |
| Nucleus | Organizing subject | The organizer that originates, designs, and maintains a Zhixu; `nucleation` remains the field/context name. |
| Zhixu | Static DSL | A reusable coordination rulebook. |
| Plan | Chain-targeted artifact | The artifact, hash, and registration parameters compiled from a Zhixu for EVM. |
| Order | Dynamic instance | One runtime of a Plan, including signals, hook runtime, stage overlay, and proof. |

A single Zhixu can compile into multiple Plans for different platforms or versions; a single Plan can produce multiple Orders.
