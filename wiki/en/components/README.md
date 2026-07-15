# Core Components

Core components explain how UVP is implemented. They turn core concepts from Zhixu text into deterministic artifacts, on-chain state, replayable events, Product DTOs, and release evidence.

```text
hook-core
  -> compiler
  -> OnchainHookPlanArtifact / registerPlan args
  -> protocol-bindings
  -> UVP contracts / registries
  -> statemachine replay
  -> rebuildable service layer / chain-services
  -> Product DTO / Store / Order App / executor-kit
  -> uvp-deploy release evidence
```

## Component Page Structure

Core component pages are organized around four things:

- Explain its upstream and downstream position in the component chain.
- Explain its public interfaces, such as ABI, EIP-712, hashes, DTOs, CLI, or release manifests.
- Explain its responsibility boundary, so Store metadata, Product DB, periphery adapters, or relayers are not written as sources of truth.
- Give a code-reading entry point so engineers can move from the docs into the concrete module.

## Component Chain

| Component group | Read first | Coverage |
| --- | --- | --- |
| Component chain and module boundaries | [Component Chain and Module Boundaries](architecture.md) | Module boundaries, dependency direction, source of truth, path from local to on-chain. |
| Semantics, Hook Core, and Compiler | [Semantics, Hook Core, and Compiler](semantics-and-compiler.md) | hook-core, compiler, OnchainHookPlan, canonical hash, registerPlan args. |
| On-chain execution, State Machine, and Replay | [On-chain Execution, State Machine, and Replay](onchain-runtime.md) | contracts, registries, state machine, stage overlay, timers, event replay. |
| Rebuildable service layer | [Rebuildable Service Layer: Chain Services](chain-services.md) | Forkable off-chain execution software: indexer, projection, relayer boundary, proof verifier, Product/Store API, notifications, storage/runtime profile. |
| Protocol bindings and public interfaces | [Protocol Bindings and Public Interfaces](services-and-interfaces.md) | protocol-bindings, Product DTO, Product API, Store API, executor-kit consumption, and public interface drift. |
| Deployment and evidence | [Deployment and Evidence](deploy-release.md) | uvp-deploy, Anvil/Base Sepolia, manifests, release evidence, staging gates. |

## Why There Are Other Core Components

`UVPStateMachine` is the core source of truth for on-chain facts, but core components also include the compiler, protocol-bindings, replay oracle, chain-services, and deploy/release evidence. The compiler makes Store or external institution-backed plan hashes reproducible; protocol-bindings freeze Product submit and stage patch typed data; the replay oracle proves that projections can be rebuilt; deploy/release evidence supports Base Sepolia claims. That is why the state machine lives under “Core Components / On-chain Execution and Replay,” while the core concept pages only explain objects such as Signal, Hook, and Order.

## Impact Surface of Changes

- If you change the Hook DSL or compiler artifacts: update hook-core, compiler tests, canonical hashes, contracts registration, statemachine replay, and docs.
- If you change ABI, events, EIP-712, or selector binding: update protocol-bindings, chain-services, executor-kit, deploy scripts, fixtures, and [Public Interfaces](../reference/public-interfaces.md).
- If you change Product DTO or API: update product-dto, chain-services, Store, Order App, executor-kit Product API mode, and browser/API tests.
- If you change deploy/release gates: update `uvp-deploy/deploy/releases/`, staging docs, status docs, and release claim language.
- If you change resource overlay: update contract events, protocol-bindings typed data, chain-services replay, Product resource DTO, Store resource view, and [File Resources](../concepts/core/file-resources.md).
- If you change docked Zhixu semantics: update compiler `supplierType=zhixu`, Store docking sandbox, executor-kit/Product API flow, periphery demos, and [Zhixu as Executor](../execution/zhixu-as-executor.md).

## Related Entry Points

- [Module Map](../reference/module-map.md)
- [Architecture](../concepts/architecture.md)
- [Data Flow and Source of Truth](../concepts/architecture/flow-and-truth.md)
- [Local to On-chain Path](../concepts/architecture/lifecycle.md)
- [Contracts and Events](../reference/contracts-and-events.md)
- [Rebuildable Service Layer: Chain Services](chain-services.md)
