---
title: Troubleshooting
type: how-to
audience: 工程贡献者
status: verified
---

# Troubleshooting

## `pnpm install` or workspace commands fail

Check:

- whether Node.js is 20+;
- whether pnpm is 9.15.0;
- whether you are running from the repository root;
- whether a package filter target is missing.

Start with:

```bash
pnpm check
pnpm test
```

Then narrow down to the specific package.

## ABI Fixture Drift

Symptoms:

- `pnpm verify:protocol-freeze` fails;
- event topic, selector, ABI hash, or bytecode hash do not match.

Handling:

1. Confirm this is an intentional public-interface change.
2. Update the fixture.
3. Check `protocol-bindings`, chain-services, executor-kit, and deploy scripts.
4. Add tests and a release note.

Do not silently change the fixture just to make tests pass.

## Chain Event Replay Mismatch

Symptoms:

- the bootstrap replay summary reports `mismatches > 0`, so deployment activation is skipped and the process exits non-zero (evidence artifacts are still written);
- a replay run throws instead of completing;
- expected and observed event counts differ;
- `HookReady` or `HookStatusChanged` order or state does not match.

Replay is always strict — the optional lenient mode has been removed, so any mismatch throws rather than being tolerated or warned about.

Check:

- whether the compiler output changed `planHash`;
- whether signal authorization is missing;
- whether a duplicate signal was handled first-writer-wins;
- whether the timer has reached its due time;
- whether a negative condition canceled the hook;
- whether the statemachine oracle fixture needs a synchronized update.

## Product API Returns Empty Results or `detail_unavailable`

The Product API has no demo data source: an empty projection returns an empty array, and a missing detail returns `detail_unavailable`. There is no `?fallback=demo` parameter and no `UVP_PRODUCT_DEMO_MODE` key — empty output always reflects what the projection actually contains.

Check:

- whether `VITE_UVP_CHAIN_SERVICES_URL` points at the real service;
- whether the indexer projection is lagging or needs a rebuild (`rebuild:indexer`);
- whether the chain-services runtime profile matches the environment you think you are running;
- whether the identity projection is missing or the plan has been revoked.

## Order App Shows No Tasks

Check:

- whether `wallet` or `VITE_UVP_ORDER_APP_WALLET_ADDRESS` matches the authorized submitter;
- whether `/product/me/tasks` is returning empty;
- whether order-level `SignalSubmitterAuthorized` has been indexed;
- whether supplier identity has been revoked;
- whether the task is waiting on other prerequisite signals;
- whether the Product API URL points at the real service instead of a test/stub URL.

## Relayer Does Not Broadcast

First distinguish the two fail-closed behaviors:

- In a non-local environment, or when `UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED=true`, a missing broadcast adapter is a startup configuration error — the relayer refuses to start rather than running half-configured.
- In a local run without a configured broadcast adapter, submit returns `broadcastStatus: "not_attempted"`: no nonce is reserved and the audit entry records the submission as skipped. This is explicit local dry-run semantics, not silent success.

Check:

- whether the environment is local or non-local, and which behavior above applies;
- the gas-payer private key env name;
- whether the signer equals the submitter in the typed data;
- whether the submitter has order-level authorization;
- whether chain id and state-machine address match;
- whether the pending/retry queue already contains failure records.

## Base Sepolia RPC Is Slow or Times Out

The default is `https://sepolia.base.org`. If you switch RPCs, first use a non-spending preflight to verify `eth_chainId`, chain id `84532`, and basic read stability before entering a broadcast rehearsal.

## Related Pages

- [Development](development.md)
- [Release and Verification](release-checklist.md)
- [Base Sepolia Staging](base-sepolia-staging.md)
- [Run Services and Frontends](run-services-and-apps.md)
- [Public Interfaces](../reference/public-interfaces.md)
