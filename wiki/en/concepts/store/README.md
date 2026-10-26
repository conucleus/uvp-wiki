---
title: Zhixu Store (retired)
type: meta
audience: Protocol readers
preread: ../protocol-bindings.md
status: retired
---

# Zhixu Store (retired)

The Store/workbench frontend is removed; `zhixu-store/registry/` now provides only the `@uvp-eth/zhixu-registry` data layer:

- records `ZhixuRecord` (planId/planHash, descriptor, schemaHash, version, registeredBy signature) and `IdentityClaim` (wallet, subject, descriptor, signature, opaque attestationRefs);
- permissionless writes; no allowlist, review, recommendation, ranking, supplier workflow, or KYC;
- registration is not endorsement; identity claims do not participate in order authorization, which stays with on-chain plan/slot/signal facts.

See the [module map](../../reference/module-map.md) and [protocol boundaries](../protocol-boundaries.md).
