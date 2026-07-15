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

- `mismatches > 0` in the bootstrap summary;
- expected and observed event counts differ;
- `HookReady` or `HookStatusChanged` order or state does not match.

Check:

- whether the compiler output changed `planHash`;
- whether signal authorization is missing;
- whether a duplicate signal was handled with first-writer-wins;
- whether the timer has reached its due time;
- whether a negative condition canceled the hook;
- whether the statemachine oracle fixture needs to be updated.

## Product API Returns Demo/Fallback

Staging/production should not depend on demo fallback.

Check:

- whether `VITE_UVP_CHAIN_SERVICES_URL` is set;
- whether `UVP_PRODUCT_E2E_FIXTURES` was accidentally enabled;
- whether `/product/zhixus?fallback=demo` was used by mistake;
- whether the chain-services runtime profile rejects permissive fallback;
- whether the identity projection is missing or the plan has been revoked.

## Order App Shows No Tasks

Check:

- whether `wallet` or `VITE_UVP_ORDER_APP_WALLET_ADDRESS` matches the authorized submitter;
- whether `/product/me/tasks` is returning empty;
- whether order-level `SignalSubmitterAuthorized` has been indexed;
- whether supplier identity has been revoked;
- whether the task is waiting on another prerequisite signal;
- whether the Product API URL points to the real service instead of a test/stub URL.

## Relayer Does Not Broadcast

Check:

- `UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED`;
- gas-payer private key env name;
- whether the signer matches the submitter in the typed data;
- whether the submitter has order-level authorization;
- whether chain id and state-machine address match;
- whether the pending/retry queue already contains failure records.

## Base Sepolia RPC Is Slow or Times Out

The default is `https://sepolia.base.org`. If you switch RPCs, first verify `eth_chainId`, chain id `84532`, and basic read stability with a non-spend preflight before moving to broadcast rehearsal.
