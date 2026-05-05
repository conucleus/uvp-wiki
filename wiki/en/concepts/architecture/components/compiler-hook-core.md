# Compiler and Hook Core

Compiler and Hook Core are the entry point where protocol semantics enter the chain. They do not handle order runtime, databases, funding, or frontend UI. They only turn the DSL into deterministic semantic artifacts.

## Hook Core

`uvp-protocol/packages/hook-core` is responsible for:

- Parsing `source::condition`.
- Supporting `&`, `|`, `~`, `delay`, `OUTSIDE`, and `OUTSOURCE`.
- Interpreting `~A` as “A signal has not yet appeared in the current order event set”. Once a signal appears, it does not disappear, so this is monotonic existence logic.
- Extracting positive, negative, and timer dependencies.
- Providing a local evaluator shared by the compiler and reference runtime.

Hook Core output is still platform-neutral semantics, with no Solidity ABI attached.

## Compiler

`uvp-protocol/packages/compiler` is responsible for:

- Loading YAML / JSON Zhixu.
- Validating `stage`, `trigger`, `receiveSignals`, `selectedStages`, `executor` reachability.
- Generating `OnchainHookPlanArtifact`.
- Generating Solidity `registerPlan` parameters.
- Computing `planId`, `planHash`, and hook / stage / source / signal / dependency / route IDs.

## Compiler Input / Output Boundary

The compiler outputs deterministic plan artifacts and registration parameters. Order participants, wallet authorization, contract deployment, supplier trust, escrow, and funding are handled by later Product, registry, deployment, or periphery layers. The compiler answers only one question: can this static Zhixu be deterministically compiled into an EVM-registerable plan?

## Why It Is a Core Architectural Piece

If the compiler is not deterministic, every later trust attestation loses meaning. The trust registry endorses the plan hash; the contract registers compact hooks; the Product DTO shows the tasks for the Plan. If any hash or schema is not reproducible, the whole chain becomes unauditable.
