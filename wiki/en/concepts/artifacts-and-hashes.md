---
title: Artifacts and Hashes
type: meta
audience: 工程贡献者
preread: compiler-and-hooks.md
status: verified
---

# Artifacts and Hashes

The compiler deterministically turns Zhixu definitions into protocol artifacts and hash commitments; this group of pages explains which inputs enter the artifacts, how stable hashes are computed, and how on-chain artifacts compress into registration parameters.

## Pages in This Section

| Subpage | Description |
| --- | --- |
| [Compiler Inputs](artifacts/compiler-input.md) | Which fields of `ZhixuDefinition` enter protocol artifacts, and which invalid shapes the compiler rejects. |
| [Canonical Hash](artifacts/canonical-hashes.md) | How stable hashes such as `planId`, `planHash`, `hookId`, and `signalKey` are computed. |
| [On-chain Registration Parameters](artifacts/solidity-registration.md) | How the on-chain artifact forms the parameters of `commitPlan()` / `finalizePlan()`. |
