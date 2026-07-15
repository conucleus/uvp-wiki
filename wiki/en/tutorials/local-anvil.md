# Local Anvil Protocol Loop

This tutorial verifies the smallest on-chain semantic loop:

```text
Zhixu -> HookPlan -> OnchainHookPlan -> registerPlan/triggerOrderFromOutsideFor
  -> submitSignal/pokeTimer -> HookReady/HookStatusChanged
  -> statemachine chain replay oracle
```

## Prerequisites

- `pnpm install` has already been run.
- Foundry and Anvil are available.
- No real private key is required. The script can use a local Anvil key.

## Contract-only Deployment

Keep Anvil running in one terminal:

```bash
anvil --host 127.0.0.1 --port 8545 --chain-id 31337
```

Deploy from another terminal:

```bash
pnpm deploy:local
```

This entry accepts loopback RPCs only. It deploys the current State Machine, frozen modules, Deployment Registry, and Identity Registry, then writes the address manifest.

## Happy Path Self Update

```bash
uvp-deploy/deploy/scripts/bootstrap-local-anvil.sh --self-update
```

The script will:

1. Start or connect to local Anvil.
2. Build the workspace and contracts.
3. Deploy `UVPDeploymentRegistry`, `UVPIdentityRegistry`, `UVPStateMachine`, and the six modules; then freeze the modules.
4. Compile the UVP update Zhixu YAML, targeting `platform.type=blockchain`, `platform.provider=eth`, and `platform.network=base`.
5. Publish the current Plan with the publisher's signature.
6. Create an Order from creator-signed trigger typed data and install signal submitter authorizations.
7. Submit on-chain Signals.
8. Run replay-oracle checks for `HookReady`, `HookStatusChanged`, and `TimerPoked`.
9. In `--self-update` mode, deploy the next State Machine and frozen modules, record deployment cutover, and verify that the old Order remains bound to its original Plan.

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
- plan published;
- plan/order registered;
- signal submitted;
- hook events emitted;
- replay expected and observed values matching;
- `mismatches` equal to 0.

If there is a replay mismatch, first read the "Chain event replay mismatch" section in [Troubleshooting](../operations/troubleshooting.md).
