# Deployment and Evidence

The deployment and evidence components organize local closed-loop runs, Base Sepolia rehearsals, address manifests, release records, and staging gates into auditable engineering evidence.

## Reading Path

| Page | Purpose |
| --- | --- |
| [Periphery and Deployment](../concepts/architecture/components/periphery-deploy.md) | Relationship between the deploy directory, periphery adapters, and the release boundary. |
| [Base Sepolia Staging](../tasks/base-sepolia-staging.md) | testnet preflight, broadcast rehearsal, secret environment, and evidence output. |
| [Release and Verification](../operations/release-and-verification.md) | local baseline, Product baseline, staging gate, release evidence, claim language. |
| [Project Status](../status/README.md) | current verified/prototype/planned/blocked status. |

## Evidence Boundary

- `uvp-deploy/deploy/` is where this repository keeps deployment state; it does not depend on the sibling `uvp-deploy` repo.
- Generated logs, temporary address manifests, Playwright traces, DB dumps, and object bytes should not be committed as release records.
- A release record should contain only redacted, auditable summaries.
- Base Sepolia rehearsals are staging/testnet evidence, not production-ready evidence.
