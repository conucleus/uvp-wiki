# Base Sepolia Staging

Base Sepolia is the current public test target. It is used for staging/rehearsal evidence and is not the same as production release.

## Secret Environment

Local secret file:

```bash
set -a
source ~/.test_envs
set +a
```

Rules:

- `~/.test_envs` must stay outside the repository.
- File permissions should be `0600`.
- Do not paste private key values into logs, docs, issues, PRs, or chat.
- `BASE_SEPOLIA_RPC_URL`, `UVP_STAGING_RPC_URL`, and `UVP_RPC_URL` should default to `https://sepolia.base.org` unless a faster RPC has been verified.
- The Base Sepolia chain id is `84532`, not Ethereum Sepolia’s `11155111`.
- Staging uses the current `UVPStateMachine` EIP-712 domain version `0.2`.

## Non-Spend Preflight

Run this first:

```bash
pnpm staging:preflight
```

Preflight should check:

- RPC and chain id;
- address manifest;
- active deployment;
- chain-services runtime profile;
- PostgreSQL;
- evidence storage;
- relayer/gas-payer config;
- Store auth;
- demo/E2E/permissive fallback disabled;
- role wallets and permission inputs.

## Broadcast Rehearsal

Only after preflight passes and funded role wallets plus on-chain permissions are confirmed, run:

```bash
pnpm staging:rehearsal -- --allow-broadcast
```

This sends transactions, so you must know the current deployer, owner, publisher, registrar, relayer gas payer, participant, governance domain owner, and governance reviewer.

## chain-services Testnet Profile

The testnet profile must fail closed:

```text
CHAIN_SERVICES_RUNTIME_ENV
CHAIN_SERVICES_DATABASE_DRIVER=postgres
CHAIN_SERVICES_DATABASE_URL
CHAIN_SERVICES_MIGRATIONS_AUTO_RUN
SECURITY_PREFLIGHT_STRICT
UVP_CHAIN_ID=84532
UVP_RPC_URL
UVP_ADDRESS_MANIFEST
UVP_PRODUCT_BFF_REGISTRATION_ADAPTER
UVP_PRODUCT_BFF_REGISTRAR_PRIVATE_KEY_ENV
UVP_STATE_MACHINE_RELAYER_BROADCAST_ENABLED
UVP_STATE_MACHINE_RELAYER_PRIVATE_KEY_ENV
UVP_EVIDENCE_STORAGE_ADAPTER
UVP_EVIDENCE_OBJECT_NAMESPACE
RECONCILE_WORKER_ENABLED
```

The testnet profile rejects memory/SQLite, implicit database URLs, localhost RPC, Anvil default private keys, demo mode, E2E fixture controls, permissive Product submission authorization, and broadcast-disabled relayers.

## Evidence Output

Release/rehearsal output should include:

- run id;
- commit;
- chain id;
- state-machine and trust-registry address;
- plan/order/task/submission ids;
- tx hashes;
- proof rows;
- indexer status;
- storage/evidence readiness;
- browser E2E summary;
- redacted role table;
- failed stage or skipped reason.

Submit only a filtered release record, not secrets, raw logs, or temporary local manifests.
