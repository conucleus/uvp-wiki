# Artifacts and Hashes

The compiler turns a Zhixu definition into two kinds of artifacts: a human-readable `HookPlanArtifact`, and an `OnchainHookPlanArtifact` that the contract can register. Every step uses deterministic encoding and stable hashes to avoid “the same workflow producing different plans on different machines”.

## Subpages

| Subpage | Description |
| --- | --- |
| [Compiler Input](artifacts/compiler-input.md) | Which `ZhixuDefinition` fields enter protocol artifacts, and which invalid shapes the compiler rejects. |
| [Canonical Hash](artifacts/canonical-hashes.md) | How stable hashes such as `planId`, `planHash`, `hookId`, and `signalKey` are computed. |
| [On-chain Registration Parameters](artifacts/solidity-registration.md) | How the on-chain artifact is compressed into `registerPlan` parameters. |

## Two Artifact Layers

| Artifact | Purpose |
| --- | --- |
| `HookPlanArtifact` | Platform-neutral, retaining stage names, hook expressions, AST, dependencies, routes, and readable labels. |
| `OnchainHookPlanArtifact` | EVM-oriented, using `bytes32` IDs, stack instructions, dependency indexes, and selector bindings. |

The contract ultimately checks the on-chain plan hash. `ZhixuTrustRegistry` attests `(domainId, planId, planHash)`, and `UVPStateMachine.registerPlan()` then checks whether that attestation is valid.

## Public Interface Awareness

ABI, event topics, EIP-712 typed data, the canonical hash domain, and the artifact schema are all public protocol interfaces. When these change, they should be treated as protocol version changes.

## Artifact Readers

Artifacts let machines and reviewers reproduce a plan. Ordinary users see Product DTOs; Store operators can see the proof panel; protocol engineers read the HookPlan, on-chain artifact, and Solidity args.

This division avoids two mistakes:

- Treating Store metadata as chain truth.
- Exposing protocol fields like `hookId`, `sourceId`, and `signalId` to ordinary participants.
