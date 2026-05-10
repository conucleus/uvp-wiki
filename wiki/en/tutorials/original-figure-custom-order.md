# Original Character Figure Zhixu Example

This example uses an original-character physicalization workflow to show a lightweight but real multi-party production relationship. The full compilable YAML lives at:

```text
uvp-protocol/packages/compiler/fixtures/original-figure-custom-order.yaml
```

It is not a single buyer running internal agents. Each stage has an independent capability subject: client, platform reviewer, concept artist, sculptor, print shop, painter, QA, and logistics. An AI agent can help one of those subjects prepare evidence, but submission authority still comes from order-level authorization and signed signals.

## Why This Scenario

The workflow is much lighter than vehicles, cross-border regulated goods, or settlement, but it still has a real production network:

```text
client brief
  -> originality / license review
  -> supplier selection
  -> concept sheet
  -> client concept approval
  -> sculpt model
  -> printability check
  -> prototype print
  -> paint sample
  -> QA review
  -> pack and ship
  -> final acceptance
```

It naturally produces evidence: briefs, originality declarations, concept sheets, model packages, printability reports, prototype photos, paint samples, QA checklists, packing manifests, and delivery receipts. The chain stores only hashes, metadata URIs, signatures, and events; business files stay off chain.

## Production Model

| Stage | Source | Responsible Subject | Typical Evidence |
| --- | --- | --- | --- |
| `figure.brief` | `client` | Client | Character brief and reference hash. |
| `figure.license_review` | `platform` | Platform reviewer | Originality or authorization review. |
| `figure.supplier_selection` | `platform` | Platform operator | Supplier selection and capability match. |
| `figure.concept_sheet` | `artist` | Concept artist | Character sheet and color design. |
| `figure.concept_approval` | `client` | Client | Approval or rejection record. |
| `figure.sculpt_model` | `sculptor` | Sculptor | STL or model package hash. |
| `figure.printability_check` | `printer` | Print shop | Printability report. |
| `figure.prototype_print` | `printer` | Print shop | Prototype photos and print parameters. |
| `figure.paint_sample` | `painter` | Painter | Painted sample and palette record. |
| `figure.qa_review` | `qa` | QA reviewer | Defect list and acceptance photos. |
| `figure.pack_ship` | `logistics` | Logistics provider | Packing photos and tracking record. |
| `figure.final_acceptance` | `client` | Client | Final acceptance or rejection. |
| `figure.rework` | `platform` | Platform operator | Rework reason and reassignment record. |

`supplier_selection` and `rework` both declare `selectedStages`. This means the platform operator may select or replace the active executor for modeling, printing, painting, QA, or logistics during an order. Static `executor.supplierID` values are default routes; actual signal submission still depends on order-level authorization, active executor overlay, and EIP-712 signatures.

## Code-Level Constraints

The fixture follows the current compiler rules:

- `trigger` must be an array, not a string.
- Every `trigger` key must exist in the same stage's `receiveSignals`.
- `receiveSignals` values must use Hook DSL: `{source}::{condition}`.
- Local signal references should use `source::task.stage.signal`.
- `sendSignals: ["cmp"]` compiles to the current stage's `task.stage.cmp`.
- `selectedStages` must use full stage identifiers, such as `figure.sculpt_model`.
- A stage without a static `executor.supplierID` must be reachable through `selectedStages` from a stage that has one.
- `fileResources` are handles; business evidence plaintext does not go on chain.

## Validation

The example is covered by the compiler tests:

```bash
pnpm --filter @uvp-eth/compiler test
```

The test loads the fixture with `loadZhixuDefinition()` and compiles it into the internal HookPlan, the EVM-facing on-chain HookPlan, and Solidity `registerPlan` args. The current fixture compiles into 16 hooks and 13 selector bindings.

## What To Notice

The point is not the figure business itself. The point is a low-risk, low-cost, multi-party verifiable production network. Clients, platform operators, creators, production suppliers, QA, and logistics can be humans, enterprise systems, or supervised agents, but protocol facts still require authorized wallet-signed signals.
