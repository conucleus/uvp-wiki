---
title: UVP: Provable Coordination Protocol for the AI Era
type: meta
audience: 全部读者
status: verified
---

# UVP: Provable Coordination Protocol for the AI Era

UVP (the Universal Value Protocol) is a protocol for cross-organization coordination together with its current EVM/Web3 implementation. It does not prove all real-world truth on any participant's behalf; it records a narrower but more critical fact: **who, under what authorization, around which order and stage, based on which evidence fingerprint, signed off on which business signal.**

The first read only needs to establish one intuition: **a Zhixu (秩序) is the rulebook, an Order (订单) is this concrete run, an Executor (执行者) handles a given step, and a Signal (信号) is an accountable business declaration.** Plan, Hook, Source, Product DTO, ABI, and related concepts unfold at the concept layer.

## Wiki Guide

The wiki follows Diataxis with four content types plus project meta information:

| What you want to do | Where to go |
| --- | --- |
| Understand UVP for the first time | [Learning path](tutorials/README.md): from [Why UVP](tutorials/why-uvp.md) to [One Order Story](tutorials/one-order-story.md), then the [full local loop](tutorials/local-anvil-loop.md) |
| Understand protocol objects and architecture | [Core Concepts](concepts/README.md); the boundary overview lives in [Protocol Boundaries](concepts/protocol-boundaries.md) |
| Complete a concrete task | [How-to guides](how-to/quick-start.md): development, running services, staging, troubleshooting |
| Look up authoritative facts | [Reference](reference/version-matrix.md): versions, interfaces, events, CLI, terminology |

For the project vision and the transaction-cost argument see the repository-root `whitepaper.md` and [Why UVP](tutorials/why-uvp.md); for the project maturity vocabulary see [Project Status](meta/status.md).

## How One Order Leaves Proof

```text
Zhixu rulebook
  -> compiled into a deterministic Plan (two-step commitPlan + finalizePlan registration)
  -> Identity Registry records subjects and wallets
  -> Order created and signal authorizations written
  -> executors submit evidence hashes and signed Signals
  -> UVPStateMachine records events and advances HookReady
  -> Chain Services rebuilds orders, tasks, timelines, and proof rows
```

See [SUMMARY.md](SUMMARY.md) for the full table of contents. `wiki/site/` is static-site generator output, not an editing source.
