---
title: UVP Client
type: explanation
audience: Executors, integration engineers
preread: order-app-vs-uvp-client.md
status: verified
---

# UVP Client

> Prerequisite: [Order App vs UVP Client](order-app-vs-uvp-client.md)

`@uvp-eth/uvp-client` is the public client SDK plus executor CLI: one package, four entries. It only signs, builds, submits, and reads chain/service facts; it never owns order state, sessions, private keys, or a server process.

| Entry | Responsible for | Not responsible for |
| --- | --- | --- |
| `@uvp-eth/uvp-client/core` | transport/auth seam, chain target, signal build/decode/submit, validation, signing helpers, evidence hashing | browser/host policy, server |
| `@uvp-eth/uvp-client/browser` | injected EIP-1193 signing, Product V3 client, session read model, deadline/format, product typed-data verification | env/localStorage/private keys |
| `@uvp-eth/uvp-client/headless` | private-key wallet handling, `HookReady` watcher, watch state/job store, non-spending doctor | browser provider |
| `@uvp-eth/uvp-client/cli` | executor commands: wallet, doctor, chain-once/chain-watch, chain-signal | any server/queue |

ABI, EIP-712 typed data, and canonical hashes are single-sourced in `@uvp-eth/protocol-bindings`; generic API DTOs are single-sourced in `@uvp-eth/product-dto`.

## CLI

```bash
pnpm --filter @uvp-eth/uvp-client cli -- --help
```

- `wallet new|address`, `faucet info`: wallet material comes only from explicit env vars; private keys are never printed.
- `doctor`: non-spending diagnostic over handler config, RPC chain id/head, state-machine contract code, and signer address; exits 1 when any check fails.
- `chain-once` / `chain-watch`: scan `HookReady` and submit configured `submitSignal` calls. State defaults to `<state-dir>/jobs.json` and `cursor.json`; `--job-store memory` keeps it in-process.
- `chain-signal`: build or broadcast one `submitSignal`; `--dry-run` only prints the deterministic call.

```bash
pnpm --filter @uvp-eth/uvp-client cli -- doctor \
  --config uvp-client/package/fixtures/state-machine-executor.config.json

pnpm --filter @uvp-eth/uvp-client cli -- chain-once \
  --rpc-url http://127.0.0.1:8545 \
  --chain-id 31337 \
  --config uvp-client/package/fixtures/state-machine-executor.config.json \
  --wallet-address 0x0000000000000000000000000000000000000002 \
  --dry-run
```

`chain-once`/`chain-watch` exit 1 when a scan carries a non-benign error or a job ends failed/dead_letter. Retry/dead-letter are SDK functions (`retryStateMachineJob`, `deadLetterStateMachineJob`); the CLI no longer exposes a jobs command group.

## Browser entry

The host injects `baseUrl`, `fetch`, and the session-token reader; the package reads no env/localStorage/private keys.

```ts
import {
  createProductClient,
  getBrowserEthereumProvider,
  requestProductSubmitSignature,
  verifyInviteAcceptTypedData,
} from '@uvp-eth/uvp-client/browser';

const client = createProductClient({ baseUrl, getSessionToken: () => hostSessionToken() });
const typedData = await client.prepareFinalize(draftId);
await requestProductSubmitSignature(getBrowserEthereumProvider()!, typedData, walletAddress);
```

Product API failures surface as `ProductError` with `kind`/`status`/`errorCode`; hosts branch on `unauthorized`/`forbidden`/`not_found`/`conflict`/`gone`/`unavailable` instead of parsing messages.

## Headless entry

```ts
import {
  createStateMachineWatcher,
  createStateMachineHandlersFromConfig,
  loadStateMachineHandlerConfig,
  submitStateMachineSignal,
} from '@uvp-eth/uvp-client/headless';
```

Watcher semantics: finality buffer (default 1; explicit for non-local runtimes), block-hash cursor continuity, chunked `eth_getLogs`, exponential poll/resend backoff, and pid run claims. Receipts are awaited by default; an unconfirmed broadcast is never recorded as delivered. An empty payload is the protocol constant `bytes32(0)`, not missing data.

## Boundaries

- No HTTP server, no database ownership, no business ruling.
- No order-level signal authorization; authorization comes from `UVPStateMachine` plan/order facts.
- CLI/SDK never custodies keys; keys come from explicit env vars only.
- Funding/guarantee/payment placeholders belong to periphery/adapter surfaces.

See [Protocol boundaries](../protocol-boundaries.md) for invariants and [Order App vs UVP Client](order-app-vs-uvp-client.md) for the surface split.
