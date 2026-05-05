# Store

This is a core-concept side view kept for readers who enter from object pages. The canonical Store product entry is [Store](../../store/README.md).

The Store is the centralized product and platform workflow workbench. It is responsible for organizing Nucleation, Zhixu, Supplier, Orders, proofs, and endorsement requests into a human-readable interface. It gives Nucleation a stage, tags objects with platform metadata, displays proof, initiates governance requests, and keeps audit records; Nucleation, trust registries, and chain events each keep their own authority source.

## Where Its Authority Comes From

Store’s authority is organizational authority and platform workflow authority. It can say:

- this Zhixu was submitted by a certain Nucleation and passed Store workflow review;
- this Supplier is tagged by the platform as having `customs` or `logistics` capabilities;
- this version is the currently recommended active version for creating Orders;
- this draft passed compilation preview and schema validation;
- a certain attestation request has already been initiated or is waiting for indexing.

Protocol facts need on-chain event support:

- the plan has already been attested on chain;
- the Order has already been registered;
- the signal has already been submitted;
- the Supplier has already been endorsed by a trust registry;
- a certain Zhixu is already trusted and fair;
- a certain executor has already become the active executor.

These must come from trust-domain judgments or contract events.

## What Store Manages

| Object | What Store does | What Store does not do |
| --- | --- | --- |
| Nucleation | Provides a workbench for design, release, supplier organization, proof, and attestation requests. | Does not govern the internal coordination design on Nucleation’s behalf. |
| Zhixu | Imports, previews compilation, shows versions, reviews release materials, and requests endorsement. | Does not directly determine whether something is trustworthy and fair. |
| Supplier | Registers profiles, platform tags, contacts, proof, and endorsement materials. | Displays tags, chain trust, and order authorization as separate layers. |
| Order | Searches, locates, and views projections and proof. | Does not create on-chain runtime facts. |
| Governance workflow | Helps operators/admins initiate plan or supplier endorsement requests. | Does not let an audit row replace a registry event. |
| Metadata | Business descriptions, risk tags, capability tags, resource descriptions, and audit material URIs. | Does not turn metadata into workflow/material truth; protocol facts stay as events/proof. |

## Division Between Centralized and Decentralized Responsibilities

Store’s value is centralized organizational capability: classification, review, tagging, explanation, operations, governance entry points, and the Nucleation workbench. The value of the on-chain protocol is to preserve verifiable boundaries: plan hash, order, signal, hook, patch, attestation, and revocation.

Mixing the two causes problems. If Store becomes the source of truth, the protocol degrades into a normal backend; if Store takes over internal Zhixu governance, the responsibility of the coordination designer is erased; if the contract tries to carry all product interpretation, ordinary users get buried under `sourceId`, `signalId`, ABI, and gas.
