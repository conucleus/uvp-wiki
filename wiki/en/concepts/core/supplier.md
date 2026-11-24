---
title: Supplier
type: explanation
audience: 协议读者
preread: ../README.md
status: verified
---

# Supplier

> Prerequisite reading: [Core Concepts](../README.md)
A Supplier is a real-world or digital capability subject organized by Store and nuclei — an individual, company, customs broker, logistics provider, AI service, or enterprise system.

Store maintains the supplier's display name, contacts, capability tags, applicable roles and stages, private matching features, review and recommendation records off-chain (see [Zhixu Store](../store/README.md)). This data expresses Store's own business judgment, not UVP contract certification.

The subject namespace of `UVPIdentityRegistry` can bind `subjectId` to an account after offline identity verification; the supplier namespace binds a SID permanently to one supplier account (one-to-one, non-rotatable). For identity domains and trust layering see [Trust Domains](../trust/domains.md). Neither proves capability, reputation, fit, or fulfillment results.

## Who Uses It

Nuclei and Store organize supplier networks and maintain directory profiles; Registry operators register or revoke subject/account bindings; order participants use a supplier's capability subject through its executor binding.

## What It Produces

Supplier profiles enter the Store catalog and matching display; identity verification produces `IdentityBindingRegistered`/`IdentityBindingRevoked` events; SID registration/status changes produce `SupplierRegistered`/`SupplierStatusChanged`. The permanent supplier account of the selected SID becomes the executor account in the order and submits signals.

## Where Authority Comes From

Catalog capability and recommendation are Store's off-chain judgments; the right to submit Signals comes from the source stage's currently effective assigned supplier account and the EIP-712 signature (see [Executor](executor.md)); contracts recognize only `accountOf(supplierId)`, the SID's active status, and the signature.

| Concept | Source |
| --- | --- |
| Identity binding | `IdentityBindingRegistered` / `IdentityBindingRevoked` (subject namespace); `SupplierRegistered` / `SupplierStatusChanged` (supplier namespace). |
| Capability and recommendation | Store metadata and Store's own model. |
| Right to submit signals | The source stage's assigned supplier account (`UVPIdentityRegistry.accountOf`, SID active) and the EIP-712 signature. |

Revoking a subject identity binding stops the catalog's default resolution; suspending or revoking a supplier SID immediately cancels that stage's submission authority. Neither rolls back Orders, signatures, or on-chain facts that already happened.

Supplier and Executor are always two concepts: Supplier is Store's identity-and-capability catalog object; Executor is the role word actually used for one Order action. On chain a SID and supplier account are permanently one-to-one and non-rotatable; a supplier never maps to several switchable accounts, and changing addresses requires registering a new SID and explicitly migrating the zhixu/plan.

When one Zhixu collaborates with another, the B side publishes a separate `kind: Dock` document declaring static A→B emission conditions, the target stage declares `executor.supplierType: dock`, and at runtime the order selects a dock supplier on the attach stage and writes the A order number to form a binding; Supplier only expresses capability subjects in this Store's catalog. See [Executor](executor.md) and [Zhixu as Executor](../apps/zhixu-as-executor.md).
