# One Order Through UVP Components

```text
Zhixu draft
  -> compiler produces a deterministic Plan artifact
  -> publisher signs and publishes the Plan
  -> Product BFF prepares the Order and participant authorization
  -> UVPStateMachine records Order, Signal, HookReady, and patch events
  -> Chain Services rebuilds projections
  -> Store, Order App, and executor-kit consume DTOs and proof
```

| Stage | Main components | Source of authority |
| --- | --- | --- |
| Design | Nucleus, Store, Compiler | Zhixu source, Store material, and deterministic compiler output. |
| Publication | Publisher, Protocol Bindings, StateMachine | EIP-712 publisher signature and Plan events. |
| Identity resolution | Store, Identity Registry | Store offline records and subject/account binding. |
| Order creation | Product BFF, Order participants | Creator signature, accepted-participant records, and Order authorization. |
| Order progress | Order App, executor-kit, StateMachine | Submitter signatures, Signal events, and Hook events. |
| Display and verification | Chain Services, Product DTO | Replayable chain events, hashes, and projections. |

The Identity Registry participates in identity resolution. Each Store owns supplier capability, search, recommendation, and matching records. Publisher authority and StateMachine events publish Plans.
