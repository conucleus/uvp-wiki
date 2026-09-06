---
title: Zhixu Store
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Zhixu Store

> Prerequisite reading: [Core Concepts](../README.md)
This is the core-concept side view of the Store. For the full product entry see [Zhixu Store](../store/README.md), which is organized by Store workflows, authority boundaries, and operator tasks.

The Zhixu Store is a centralized product and platform workflow workbench. It organizes nuclei, orders, suppliers, proofs, and material-review requests into interfaces humans can understand. It gives nuclei a stage, applies platform tags to objects, displays proof, initiates governance requests, and keeps audit records; nuclei, the Identity Registry, and on-chain events each retain their own sources of authority.

## Who Uses It

Nuclei use it to import orders, organize suppliers, and initiate publication; suppliers maintain directory profiles; operators/admins handle material review and governance requests; ordinary participants search orders and view proof through it.

## What It Produces

Store produces product workflow results such as catalogs, tags, version display, compile previews, publication/governance requests, and audit records; these organize information but do not directly create protocol facts.

## Where Authority Comes From

Store's authority is organizational authority and platform workflow authority. It can say:

- This Zhixu was submitted by some nucleus and passed Store workflow review.
- This supplier is tagged by the platform with `customs` or `logistics` capability.
- This version is the current active version recommended for creating orders.
- This draft passed compile preview and schema validation.
- Some publication request has been initiated or is awaiting indexing.

Protocol facts need support from on-chain events:

- The plan is published on chain.
- The order is registered.
- The signal is submitted.
- The supplier's subject/account binding is registered.
- A Zhixu has passed material review (publication).
- An executor has become the active executor.

All of these must come from Identity Registry determinations or contract events.

## What Store Manages

| Object | What Store does | What Store does not do |
| --- | --- | --- |
| Nucleus / 凝结核 | Provides the design, publication, supplier organization, proof, and publication-request workbench. | Does not govern inside the nucleus's order. |
| Zhixu | Import, compile preview, version display, publication material review, review requests. | Does not itself decide whether material review has passed. |
| Supplier | Register profiles, platform tags, contacts, proof, review material. | Tags, on-chain trust, and order authorization are layered separately for display. |
| Order | Search, locate, view projections, view proof. | Does not create on-chain runtime facts. |
| Governance workflow | Help operators/admins initiate plan or supplier review requests. | Does not let audit rows replace registry events. |
| Metadata | Business descriptions, risk tags, capability tags, resource descriptions, audit material URIs. | Metadata belongs to workflow/material; protocol facts come from event/proof. |

## Division Between Centralization and Decentralization

Store's value is centralized organizing capability: classification, review, tagging, explanation, operations, governance entry points, the nucleus workbench. The on-chain protocol's value is preserving verifiable boundaries: plan hash, order, signal, hook, patch, publication, revocation.

Mixing the two causes problems. If Store becomes the source of truth, the protocol degenerates into an ordinary backend; if Store governs inside a nucleus's order, the order designer's responsibility gets erased; and if contracts took over all product interpretation, ordinary users would drown in `sourceId`, `signalId`, ABI, and gas.
