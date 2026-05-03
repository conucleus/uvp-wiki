# Semantics, Hook Core, and Compiler

The semantics and compiler components turn a Zhixu definition into a reproducible, attestable, registerable on-chain plan. They sit before the state machine and are a prerequisite for protocol trustworthiness.

## Component Chain

```text
Zhixu YAML/JSON
  -> hook-core parses receiveSignals
  -> compiler builds HookPlanArtifact
  -> compiler builds OnchainHookPlanArtifact
  -> compiler emits Solidity registerPlan args
  -> trust domain attests planId / planHash
```

## Component Responsibilities

| Component | What it owns | Adjacent boundary |
| --- | --- | --- |
| hook-core | `source::condition` parsing, AST, dependency extraction, positive anchor rules. | Solidity ABI, wallet authorization, and Product task language are handled by later layers. |
| compiler | Zhixu input schema, HookPlan, OnchainHookPlan, registerPlan args, canonical hash. | Order participant selection, supplier trust judgment, linked order registration, and payment/escrow logic are handled by product, registry, or periphery. |
| artifact/hash | stable boundaries for `planId`, `planHash`, `hookId`, `sourceId`, `signalId`, and `signalKey`. | Store draft state and Product DB primary keys belong to the read model. |

## Read These First

| Page | Purpose |
| --- | --- |
| [Hook Core and Compiler](../concepts/architecture/components/compiler-hook-core.md) | boundary between hook-core and compiler responsibilities. |
| [Artifacts and Hashes](../concepts/artifacts-and-hashes.md) | HookPlanArtifact, OnchainHookPlanArtifact, and public hash boundaries. |
| [Compiler Input](../concepts/artifacts/compiler-input.md) | which Zhixu fields are included in the deterministic artifact. |
| [Canonical Hash](../concepts/artifacts/canonical-hashes.md) | stable IDs such as planId, planHash, hookId, and signalKey. |
| [Solidity Registration Arguments](../concepts/artifacts/solidity-registration.md) | how compact hooks, dependency indexes, and selector bindings enter `registerPlan`. |

## Key Boundaries

- Hook Core is platform-neutral semantics and does not include Solidity ABI.
- The compiler does not choose order participants, does not create wallet authorization, and does not decide whether a supplier is trusted.
- Artifacts are engineering and audit materials; ordinary users see Product DTOs, Store operators see proof panels, and protocol engineers read on-chain artifacts.
- Canonical hash, artifact schema, and registerPlan args are public interfaces and must be treated as such when changed, per [Public Interfaces](../reference/public-interfaces.md).
- `supplierType=zhixu` `signalMap` compiles the mapping semantics of a local Plan; the runtime linked-order lifecycle is organized by Store/Product/adapter and can be written on chain through `DockedOrderLinked`, `DockedSignalMapped`, and `DockedSignalSubmitted`.
- `fileResources` are stage resource handles; production resource access policy evolves through resource manifests/patches, while plaintext files stay off chain.

## Semantics That Must Be Preserved

- `stage.trigger` must reference a `receiveSignals` key that already exists in that stage.
- A receive hook emits `HookReady` when `trigger=true` and it becomes Ready.
- A `signalMap` hook currently has `trigger=false`.
- A `signalMap` with `supplierType=zhixu` must include both `str` and `cmp`, and the same map must reference the same source.
- Hook expressions are evaluated under monotonic existence logic: `A` means the signal has appeared, `~A` means the signal has not yet appeared; once a signal appears, it does not disappear.
- Hook expressions must have a positive anchor; a pure absence condition cannot become a progressable hook.
