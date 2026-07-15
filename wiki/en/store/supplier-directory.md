# Supplier Directory, Capability, and Contact

The Supplier Directory is a Store-managed off-chain workspace for supplier names, contact details, capability tags, matching features, and fulfillment proof. The Identity Registry supplies the public subject-to-wallet mapping.

| Layer | Content | Authority |
| --- | --- | --- |
| Profile | Display name, subject ID, wallet, organization notes, metadata URI. | Store records. |
| Capability | Stage, role-slot, resource, evidence, and operating tags. | Nucleus judgment and Store records. |
| Contact | People, channels, availability, SLA, and escalation path. | Store records; private details stay off chain. |
| Identity | Active/revoked/not-found binding and proof. | `UVPIdentityRegistry` projection. |
| Participation | Recent Orders, open tasks, and historical proof. | `UVPStateMachine` and Product projections. |

## Operating path

```text
Nucleus defines supplier requirements
  -> Store records profile, contact, and matching features
  -> Store verifies identity material offline
  -> Registry owner registers the identity binding
  -> an Order grants signal authorization
  -> fulfillment proof updates the Store passport
```

Each Store owns its capability and matching judgments. Identity registration records who a wallet represents. Order authorization determines which Signals that wallet may submit for a specific Order.
