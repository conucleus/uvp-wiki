# Product Local Loop

The Product local loop adds the Product API on top of the Local Anvil protocol loop:

```text
local contracts
  -> chain-services Product API
  -> order draft / invite / registration / start
  -> evidence
  -> prepare-submit / EIP-712 signature / submit
  -> order timeline / proof
```

## Run

```bash
uvp-deploy/deploy/scripts/product-local-anvil.sh
```

It uses memory storage by default, which is good for quick verification.

Use SQLite durable storage:

```bash
uvp-deploy/deploy/scripts/product-local-anvil.sh --durable
```

Reuse an existing API:

```bash
uvp-deploy/deploy/scripts/product-local-anvil.sh \
  --chain-services-url http://127.0.0.1:8787
```

## What This Script Proves

It no longer creates orders directly through bootstrap; instead, it creates them through the Product BFF path:

1. `POST /product/order-drafts`
2. `POST /product/orders/<draft-id>/invites`
3. `POST /product/invites/<invite-id>/accept`
4. `POST /product/order-drafts/<draft-id>/submit`
5. `GET /product/order-triggers/<registration-id>`
6. `POST /product/order-triggers/<registration-id>/start`
7. `POST /product/evidence`
8. `POST /product/tasks/<task-id>/prepare-submit`
9. Local Anvil participant key produces an EIP-712 signature
10. `POST /product/tasks/<task-id>/submit`
11. `GET /product/submissions/<submission-id>`
12. `GET /product/orders/<order-id>/timeline`
13. `GET /product/orders/<order-id>/proof`

## Where Output Goes

`logs/product-anvil/<run_id>/` contains:

- `summary.json`
- `api-transcript.json`
- `events.json`
- nested bootstrap summary
- per-run address manifest

The tx hash, order id, task id, submission id, and replay mismatch values in `summary.json` are the key indicators of whether the local loop is truly chain-backed.

## Relationship to the Frontend

The full browser path is driven by `product-browser-e2e.sh`:

```bash
uvp-deploy/deploy/scripts/product-browser-e2e.sh --mode fixture
uvp-deploy/deploy/scripts/product-browser-e2e.sh --mode full --require-full
```

`--mode fixture` uses local fixtures and does not prove the on-chain loop. `--mode full --require-full` requires the real Product stack, transactions, indexer, and service dependencies to be available.
