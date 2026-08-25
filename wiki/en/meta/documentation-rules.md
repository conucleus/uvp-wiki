---
title: Documentation Rules
type: meta
audience: 文档贡献者
status: verified
---

# Documentation Rules

The wiki's goal is to make the project readable, organizing source code, tests, ABI fixtures, PRD records, and release evidence into one reading path. Protocol facts remain defined by code, chain events, and re-runnable evidence.

## Content Types (Diataxis)

Every page must be classified into exactly one of the following five types, declared with the front-matter `type` field:

| type | Directory | Question answered |
| --- | --- | --- |
| `tutorial` | `tutorials/` | "Walk me through it the first time"--narrative plus hands-on; vision argumentation goes to `tutorials/why-uvp.md` or the root `whitepaper.md` |
| `explanation` | `concepts/` | "How should I understand it"--protocol objects, architecture, components, and boundary explanations |
| `how-to` | `how-to/` | "I need to get something done"--steps organized by reader goals; every page declares prerequisites and verification commands |
| `reference` | `reference/` | "What are the authoritative facts"--API, CLI, event, hash, and version quick lookup, checked against code and fixtures as ground truth |
| `meta` | root README/SUMMARY, `meta/` | meta information such as navigation, project status, and documentation rules |

## Front-matter

Every markdown page (stubs excepted) must begin with:

```yaml
---
title: <consistent with the H1>
type: tutorial | explanation | how-to | reference | meta
audience: 协议读者 | 应用开发者 | 工程贡献者 | 运维 | 全部读者 | 文档贡献者
preread: <optional; relative path of the recommended prior page>
status: verified | prototype | planned | archived
---
```

- The `status` vocabulary matches [Project Status](status.md): verified = backed by code/tests/replay; prototype = demo/partial implementation; planned = PRD/plan only; archived is reserved for redirect stubs keeping old paths alive.
- A stub is the only page form allowed to omit some fields: one line stating where the content moved is enough.

## Writing Principles

- Write what the reader needs to do first, then link to source code and PRDs.
- On first appearance, introduce proper nouns in Chinese-first form, e.g. "秩序 (Zhixu)" and "订单 (Order)".
- Each protocol-object page is organized by "what it is / who uses it / what result it produces / where authority comes from"; when a hard boundary is needed, cite [Protocol Boundaries](../concepts/protocol-boundaries.md) in one sentence.
- **Protocol invariants have exactly one defining location** (`concepts/protocol-boundaries.md`). Other pages give at most a one-sentence summary plus a link; restating entire passages is forbidden.
- Distinguish implemented, fixture/local demo, staging evidence, and planned PRD; mark uncertain facts with `<!-- TODO(confirm): ... -->`; writing filler content is forbidden. Before publishing, convert the comment into a visible "pending confirmation" blockquote so the static site does not render escaped raw HTML.
- Front-matter fields are fixed to `title` / `type` / `audience` / `preread` / `status`; `preread` takes exactly one bare relative path (e.g. `../core/executor.md`) — no quotes, no markdown link. The "Prerequisite reading" blockquote under the body H1 must stay consistent with that field.
- Label Store metadata, database rows, and relayer queues as read-model or workflow state; label protocol facts as registry/state-machine events.
- Keep funding, USDC, escrow, and guarantee topics inside the periphery boundary.
- Private keys, RPC secrets, JWT secrets, and object-storage credentials are written only in redacted form.

## Information Architecture Rules

- `SUMMARY.md` is the only navigation truth. Every content page appears exactly once in SUMMARY; stubs never enter SUMMARY.
- Top-level sections are fixed to six categories: learning path, core concepts, architecture and runtime, how-to guides, reference, and project meta information (second-level entries may subdivide as needed).
- The same file is mounted in SUMMARY exactly once; different aspects are expressed through cross-links inside page bodies.
- Use `Nucleus` as the English subject name; `nucleation` is only used for fields such as `spec.nucleation.id` or nucleation context.
- When moving or merging a page, leave a `status: archived` stub at the old path so external links keep working.
- `en/` is the English mirror of the Chinese sources; its directory structure stays isomorphic with zh. Changes on both sides stay in sync, with zh authoritative.
- `wiki/site/` is rebuildable static output, excluded via `.gitignore`, and never committed.

## Documentation Placement

| Content | Place it here |
| --- | --- |
| Newcomer entry points | `wiki/README.md`, `tutorials/` |
| Protocol-object and architecture explanations | `concepts/` (including `core/`, `state-machine/`, `artifacts/`, `trust/`, `product/`, `services/`, `store/`, `apps/`) |
| Actionable operational steps | `how-to/` |
| API/CLI/module/event quick reference | `reference/` |
| Project status, deployment evidence, documentation rules | `meta/` |

PRDs still live under `docs/product/`. Release records still live under `uvp-deploy/deploy/releases/`. Module-local commands still live in each module's `README.md`.

## Update Checklists

When changing a protocol public interface:

- update [Public Interfaces](../reference/public-interfaces.md);
- update [Contracts and Events](../reference/contracts-and-events.md);
- update [Canonical Hashes](../concepts/artifacts/canonical-hashes.md) and [On-chain Registration Parameters](../concepts/artifacts/solidity-registration.md);
- confirm fixture-verifier commands are still correct (steps in [Troubleshooting](../how-to/troubleshooting.md));
- if an invariant statement is affected, update [Protocol Boundaries](../concepts/protocol-boundaries.md).

When changing the Product API:

- update [Product API Endpoints](../reference/product-api-endpoints.md);
- update [Product DTO and User Surfaces](../concepts/product/README.md) and the relevant services pages;
- sync the related Store / Order App / Executor Kit how-to and concept pages.

When changing the Store / Supplier / Zhixu management paths:

- update [the Zhixu Store](../concepts/store/README.md) and its child pages;
- state whether the relevant status belongs to the read model or on-chain events (cite Protocol Boundaries; do not restate);
- keep the three-way boundary clear between Nucleus internal governance, Store platform workflow, and Store or external institution external material review.

When changing the Executor / executor-kit / docked Zhixu paths:

- update [Executor Kit](../concepts/apps/executor-kit.md), [Zhixu as Executor](../concepts/apps/zhixu-as-executor.md), and [Order App](../concepts/apps/order-app.md);
- sync CLI syntax with [CLI and Configuration](../reference/cli-and-config.md).

When changing the release/staging gate:

- update [Base Sepolia Staging](../how-to/base-sepolia-staging.md), [Release and Verification](../how-to/release-checklist.md), and [Project Status](status.md);
- never write secret values.

When adding a periphery adapter:

- explain which core interfaces it consumes;
- explain which facts it does not own;
- mark adapter events as adapter-side facts; reference the corresponding core interface or periphery contract for order/trust/funding source of truth respectively.
