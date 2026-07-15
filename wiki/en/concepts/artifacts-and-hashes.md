# Artifacts and Hashes

The compiler turns a Zhixu definition directly into an EVM `OnchainHookPlanArtifact` and `registerPlan` arguments. The old platform-neutral HookPlan shape is compiler-internal IR. Every step uses deterministic encoding and stable hashes to avoid “the same workflow producing different plans on different machines”.

## Subpages

| Subpage | Description |
| --- | --- |
| [Compiler Input](artifacts/compiler-input.md) | Which `ZhixuDefinition` fields enter protocol artifacts, and which invalid shapes the compiler rejects. |
| [Canonical Hash](artifacts/canonical-hashes.md) | How stable hashes such as `planId`, `planHash`, `hookId`, and `signalKey` are computed. |
| [On-chain Registration Parameters](artifacts/solidity-registration.md) | How the on-chain artifact is compressed into `registerPlan` parameters. |

## Public Artifacts

| Artifact | Purpose |
| --- | --- |
| `OnchainHookPlanArtifact` | EVM-oriented, using `bytes32` IDs, stack instructions, dependency indexes, and selector bindings. |
| `registerPlan` args | Solidity registration arguments deterministically compressed from the on-chain artifact. |

`UVPStateMachine.commitPlan()` derives and stores the Plan hash from hooks and metadata commitments for replay and Order binding. The publisher signature proves publication origin; Identity Registry does not publish Plans.

## Public Interface Awareness

ABI, event topics, EIP-712 typed data, the canonical hash domain, and the artifact schema are all public protocol interfaces. When these change, they should be treated as protocol version changes.

## Artifact Readers

Artifacts let machines and reviewers reproduce a plan. Ordinary users see Product DTOs; Store operators can see the proof panel; protocol engineers read the HookPlan, on-chain artifact, and Solidity args.

This division avoids two mistakes:

- Treating Store metadata as chain truth.
- Exposing protocol fields like `hookId`, `sourceId`, and `signalId` to ordinary participants.
