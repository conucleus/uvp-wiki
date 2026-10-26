---
title: CLI and Configuration
type: reference
audience: Engineering contributors
status: verified
---

# CLI and Configuration

## Root Scripts

```bash
pnpm check
pnpm test
pnpm build
pnpm lint
pnpm verify:protocol-freeze
```

## uvp-client CLI

See [UVP Client](../concepts/apps/uvp-client.md) for the full model. The CLI only covers executor commands: wallet, faucet, doctor, chain-once, chain-watch, chain-signal.

```bash
pnpm --filter @uvp-eth/uvp-client cli -- --help
```

Create or inspect a wallet:

```bash
pnpm --filter @uvp-eth/uvp-client cli -- wallet new --env-file .env.local
pnpm --filter @uvp-eth/uvp-client cli -- wallet address \
  --private-key-env UVP_ETH_DEPLOYER_PRIVATE_KEY
```

Non-spending doctor (config, RPC chain id/head, contract code, signer; exits 1 on failure):

```bash
pnpm --filter @uvp-eth/uvp-client cli -- doctor \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --state-machine 0x0000000000000000000000000000000000000001
```

Chain watcher dry-run (`--dry-run` only rehearses scanning and building; nothing is submitted). The example config declares `stateMachines[]`, so `--state-machine` is omitted — passing both is rejected because the scan set must be declared in one place:

```bash
pnpm --filter @uvp-eth/uvp-client cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

A single signal:

```bash
pnpm --filter @uvp-eth/uvp-client cli -- chain-signal \
  --rpc-url http://127.0.0.1:8545 \
  --state-machine 0x0000000000000000000000000000000000000001 \
  --chain-id 31337 \
  --plan-id 0x2222222222222222222222222222222222222222222222222222222222222222 \
  --order-id 0x1111111111111111111111111111111111111111111111111111111111111111 \
  --source slot-a \
  --stage exec.main \
  --signal-name cmp \
  --payload-hash 0x3333333333333333333333333333333333333333333333333333333333333333 \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

Exit codes: `chain-once`/`chain-watch` exit 1 when a scan carries a non-benign error or a job ends failed/dead_letter. Job retry/dead-letter/revive are SDK functions (`retryStateMachineJob`, `deadLetterStateMachineJob`, `reviveStateMachineJob`), not CLI subcommands.

## uvp-client entries

```ts
import { ... } from '@uvp-eth/uvp-client/core';
import { ... } from '@uvp-eth/uvp-client/browser';
import { ... } from '@uvp-eth/uvp-client/headless';
```

- `core`: transport/auth, chain target, signal build/decode/submit, validation, evidence.
- `browser`: Product V3 client, EIP-1193 signing, session/deadline/format, typed-data verification; the host injects provider and session.
- `headless`: private-key wallet, watcher/job store, doctor.
- `cli`: `buildProgram`/`main` (bin `uvp-client`).

## chain-services Storage

See [Chain Services](../concepts/services/chain-services.md) for module boundaries.

```text
CHAIN_SERVICES_DATABASE_URL=postgres://uvp:uvp@127.0.0.1:5432/uvp_chain_services
```

`CHAIN_SERVICES_DATABASE_URL` is required in every environment, including local and test; startup fails and names the missing key. The value must be a `postgres://` (or `postgresql://`) DSN: the `CHAIN_SERVICES_DATABASE_DRIVER` switch is gone, SQLite and in-memory engines are removed, and there is no implicit default.
