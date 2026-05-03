# Documentation Rules

The goal of the Wiki is to help people understand the project, and to organize source code, tests, ABI fixtures, PRD records, and release evidence into one reading path. Protocol facts are still defined by code, chain events, and replayable evidence.

## Writing Principles

- Start with what the reader needs to do, then link to source and PRD.
- When a technical term appears for the first time, prefer the project term with a Chinese alias where useful, such as "Zhixu (秩序)" and "Order (订单)".
- Each core-object page should start with "what it is / who uses it / what it produces / where authority comes from", then move to boundary checks.
- Avoid using "not A, but B" as the main explanatory structure; when a hard boundary is necessary, put it under "boundary checks" or a checklist.
- Distinguish implemented, fixture/local demo, staging evidence, and planned PRD.
- PRD plans should use planned/prototype language; implemented features need code, tests, or release evidence.
- Write Store metadata, database rows, and relayer queues as read-model or workflow state; write protocol facts as registry/state-machine events.
- Put funding, USDC, escrow, and guarantee inside the adapter/periphery boundary.
- Private keys, RPC secrets, JWT secrets, and object-storage credentials must only appear in redacted form.

## Information Architecture Rules

- `SUMMARY.md` is the only navigation source of truth. After adding a page, place it in the appropriate top-level section.
- Top-level sections should first follow engineering-reader paths: getting started, core concepts, core components, Store, execution and integration, product language and DTO/API, local/staging/release, reference and evidence, and contribution rules.
- `core` is for "what the object is"; `components` is for "how the system is implemented"; `store` is for "how the Store organizes and validates real-world objects"; `execution` is for "how executors, adapters, AI/MCP, and docked Zhixu submit signals".
- A single Markdown file should be attached to only one top-level section in `SUMMARY.md`. If different sections need different views of the same topic, add a separate side-view page; older pages can be referenced from the body.
- `store` pages describe Store platform workflow and nucleation workbench; the Store admin is a platform workflow role, and the nucleation is the internal governor of the Zhixu.
- Supplier, Executor, compiler, Store, Product API, Signal Container, and release evidence are all first-class reading paths and should be distributed by reader entry point.
- During restructuring, keep the old side pages and old links first, and merge duplicated content only after the new structure stabilizes.
- `wiki/site/` is a rebuildable static output; the editable source is Markdown.

## Where to Put Content

| Content | Place it here |
| --- | --- |
| Newcomer entry | `wiki/README.md`, `wiki/getting-started/` |
| Core concepts entry | `wiki/core/` |
| Core components entry | `wiki/components/` |
| Store entry | `wiki/store/` |
| Nucleation workbench | `wiki/store/nucleation-workbench.md` |
| Execution and integration entry | `wiki/execution/` |
| Product language and DTO/API entry | `wiki/product/` |
| Status summary | `wiki/status/` |
| Concept and architecture side pages | `wiki/concepts/` |
| End-to-end tutorials | `wiki/tutorials/` |
| Actionable task steps | `wiki/tasks/` |
| API/CLI/module quick reference | `wiki/reference/` |
| Release, evidence, and troubleshooting | `wiki/operations/` |
| Documentation maintenance rules | `wiki/contribute/` |

PRDs still live under `docs/product/`. Release records still live under `uvp-deploy/deploy/releases/`.
Module-local commands still live in each module’s `README.md`.

## Update Checklist

When changing a protocol public interface:

- update [Public Interfaces](../reference/public-interfaces.md);
- update [Contracts and Events](../reference/contracts-and-events.md);
- update [Artifacts and Hashes](../concepts/artifacts-and-hashes.md);
- confirm the fixture verifier command is still correct.

When changing the Product API:

- update [Product API Reference](../reference/product-api.md);
- update [Product Language and DTO/API](../product/README.md);
- update the Store/Order App/Executor Kit task docs;
- note whether the old route is only a compatibility alias.

When changing the Store / Supplier / Zhixu management path:

- update [Store](../store/README.md);
- update [Nucleation Workbench](../store/nucleation-workbench.md);
- sync the object boundaries in [Core Concepts](../core/README.md);
- state that Store metadata, platform labels, contact information, notification status, review status, and fulfillment record views belong to the read model or workflow, while chain events and trust-domain attestations are shown separately;
- state the boundary between internal nucleation governance, Store platform workflow, and trust-domain external attestation.

When changing the Executor / executor-kit / docked Zhixu path:

- update [Execution and Integration](../execution/README.md);
- update [Executor](../concepts/core/executor.md);
- update [Zhixu as Executor](../execution/zhixu-as-executor.md);
- explain that Product tasks, Store docking sessions, and adapter jobs are workflow indexes, while on-chain order/signal/docking proof are shown separately.

When changing the release/staging gate:

- update [Base Sepolia Staging](../tasks/base-sepolia-staging.md);
- update [Release and Verification](../operations/release-and-verification.md);
- update [Project Status](../status/README.md);
- do not write secret values.

When adding a periphery adapter:

- explain which core interfaces it consumes;
- explain which facts it does not own;
- write adapter events as adapter-side facts, and reference the corresponding core interface or periphery contract for order/trust/funding source of truth.
