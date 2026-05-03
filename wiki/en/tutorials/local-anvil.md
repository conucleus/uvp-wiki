# Local Anvil Protocol Loop

This tutorial verifies the smallest on-chain semantic loop:

```text
Zhixu -> HookPlan -> OnchainHookPlan -> registerPlan/registerOrder
  -> submitSignal/pokeTimer -> HookReady/HookStatusChanged
  -> statemachine chain replay oracle
```

## Prerequisites

- `pnpm install` has already been run.
- Foundry and Anvil are available.
- No real private key is required. The script can use a local Anvil key.

## Happy Path Self Update

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --self-update
```

The script will:

1. Start or connect to local Anvil.
2. Build the workspace and contracts.
3. Deploy `UVPDeploymentRegistry`, `ZhixuTrustRegistry`, and `UVPStateMachine`.
4. Compile the UVP update Zhixu YAML, targeting `platform.type=blockchain` and `platform.provider=eth`.
5. Register the official trust domain.
6. Attest the current plan.
7. Allowlist the plan publisher and order registrar.
8. Register the plan and order, and write signal submitter authorizations.
9. Submit on-chain signals.
10. Run replay-oracle checks for `HookReady`, `HookStatusChanged`, and `TimerPoked`.
11. Register the next plan and next order to prove the old order is still bound to the old plan.

## Failure Branch

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --failure
```

This branch drives rollback/failure semantics and verifies that the negative or failure-path chain events match the reference reducer.

## Where Output Goes

Typical output:

- `logs/anvil-bootstrap/<run_id>/summary.json`
- `logs/anvil-bootstrap/<run_id>/events.json`
- `uvp-deploy/deploy/addresses/anvil.local.json`

These are local run evidence. Do not put private keys or RPC secrets into the output, and do not treat local logs as the protocol source of truth.

## Success Criteria

On success, you should see:

- contracts deployed;
- plan attested;
- plan/order registered;
- signal submitted;
- hook events emitted;
- replay expected and observed values matching;
- `mismatches` equal to 0.

If there is a replay mismatch, first read the "Chain event replay mismatch" section in [Troubleshooting](../operations/troubleshooting.md).
