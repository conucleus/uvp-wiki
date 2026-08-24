---
title: Supplier
type: explanation
audience: 协议读者
preread: README.md
status: verified
---

# Supplier

A Supplier is a real-world or digital capability subject organized by Store and nuclei — an individual, company, customs broker, logistics provider, AI service, or enterprise system.

Store maintains the supplier's display name, contacts, capability tags, applicable roles and stages, private matching features, review and recommendation records off-chain (see [Zhixu Store](../store/README.md)). This data expresses Store's own business judgment, not UVP contract certification.

`UVPIdentityRegistry` can bind a supplier's `subjectId` to one or more accounts after offline identity verification; for identity domains and trust layering see [Trust Domains](../trust/domains.md). It answers "who this account represents in this Store's catalog" and proves nothing about capability, reputation, fit, or fulfillment results.

## Who Uses It

Nuclei and Store organize supplier networks and maintain directory profiles; Registry operators register or revoke subject/account bindings; order participants use a supplier's capability subject through executor bindings.

## What It Produces

Supplier profiles enter the Store catalog and matching display; identity verification produces `IdentityBindingRegistered`/`IdentityBindingRevoked` events; a selected supplier deploys wallets that become executors in orders and submit signals.

## Where Authority Comes From

Catalog capability and recommendation are Store's off-chain judgments; the right to submit Signals comes from Order-level authorization and the current executor overlay (see [Executor](executor.md)); contracts recognize only authorization and signatures.

| Concept | Source |
| --- | --- |
| Identity binding | `IdentityBindingRegistered` / `IdentityBindingRevoked`. |
| Capability and recommendation | Store metadata and Store's own model. |
| Right to submit signals | Order-level authorization and current executor overlay. |

Revoking an identity binding stops default catalog resolution but does not roll back Orders, signatures, or on-chain facts that already happened, nor does it stop users from using bare addresses directly.

Supplier and Executor are always two concepts: Supplier is Store's identity-and-capability catalog object; Executor is the account actually authorized for one Order action. One Supplier may map to several accounts and may use different Executors in different Orders.

When one Zhixu needs to dock with another Zhixu, it uses docking's order link, signal mapping, and proof mechanisms rather than registering the other Zhixu as a Supplier DSL object; see [Zhixu as Executor](../apps/zhixu-as-executor.md).
