# Store and Governance

`zhixu-store/app` is the Nucleus workbench and Store platform workflow frontend. It serves the Nucleus, Store operators, reviewers, governance admins, and trust reviewers. It is not the ordinary participant task app, and it is not a Zhixu internal governor.

## Store Objects

Store organizes these objects:

- nucleation identity, design materials, and version history;
- Zhixu drafts, compile previews, reviews, and versions;
- fairness / transparency / exception policy material;
- supplier directory, internal Nucleus adaptation relationships, and platform capability tags;
- order search and proof drilldown;
- governance publication / revocation requests.

## Store Boundary

Store may use its own platform authority for catalog tagging, material review, and workflow management, but these states must be clearly labeled by source:

| Store state | Is it an on-chain fact? |
| --- | --- |
| draft imported | No. |
| compile preview passed | No, only a reproducible compilation result. |
| design / fairness material submitted | No, the material comes from the Nucleus. |
| submitted for review | No. |
| approved for broadcast | No, only eligible to initiate an endorsement request. |
| Plan finalized indexed | Yes, from StateMachine events and the publisher signature. |
| Identity binding indexed | Yes, from Identity Registry events; no capability or reputation. |

## Governance Handoff

Store governance actions should be delegated to an existing governance service or administrator workflow. Store does not hold private keys directly, does not bypass admin headers, does not describe review approval as chain publication, and does not turn a Store reviewer into a Identity Registry.

## Why Store Is a Necessary Centralized Component

Decentralized contracts can only verify hashes, signatures, event order, and authorization. The real-world questions of “which Nucleus maintains this Zhixu”, “whether the fairness material for this Zhixu is complete”, “what is this customs broker’s contact information”, and “whether this version is recommended” require a centralized product interface. Store is the productized entry point for that layer of organization; trust and executability still return to Store or external institution publication and state-machine events.
