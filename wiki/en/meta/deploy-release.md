---
title: Deployment and Evidence
type: meta
audience: 工程贡献者
status: verified
---

# Deployment and Evidence

The deployment and evidence components organize local closed-loop runs, Base Sepolia rehearsals, address manifests, release records, and staging gates into auditable engineering evidence.

## Reading Path

| Page | Purpose |
| --- | --- |
| [Periphery and Deployment](../concepts/periphery-and-deploy.md) | Relationship between the deploy directory, periphery adapters, and the release boundary. |
| [Base Sepolia Staging](../how-to/base-sepolia-staging.md) | testnet preflight, broadcast rehearsal, secret environment, and evidence output. |
| [Release and Verification](../how-to/release-checklist.md) | local baseline, Product baseline, staging gate, release evidence, claim language. |
| [Project Status](status.md) | current verified/prototype/planned/blocked status. |

## Evidence Boundary

- `uvp-deploy/` is where this repository keeps its deployment domain (release `deploy/`, QA `qa/`, ops `ops/`); it does not depend on a sibling `uvp-deploy` repo. Version truth comes only from `deploy/compatibility/uvp-stack.v1.json` and the frozen fixtures.
- Generated logs, temporary address manifests, Playwright traces, DB dumps, and object bytes must not be committed as release records.
- Release records contain only redacted, auditable summaries.
- Base Sepolia rehearsals are staging/testnet evidence, not production-ready.
