# Zhixu Store

Store is the off-chain product workbench between the Nucleus, Suppliers, operators, and execution interfaces. It provides drafts, compile previews, supplier profiles, capability tags, private matching, proof views, notifications, reviews, and audit. These commercial judgments do not become UVP protocol facts.

| Object | Authority | Store's role |
| --- | --- | --- |
| Zhixu design and version | Nucleus materials, publisher signature, finalized Plan. | Draft, preview, review, and publication workflow. |
| Real-world identity | Store verification plus an `UVPIdentityRegistry` binding. | Resolve display names, contacts, and the default directory. |
| Order and Signal rights | Participant signatures, order authorization, active executor overlay. | Prepare payloads and display proof; never sign as the participant. |

The Identity Registry does not publish Plans, certify Supplier capability or reputation, or perform matching. Store capability tags, ranking features, recommendation, and match history remain Store-specific off-chain data.

Store is deliberately centralized in identity verification, labels, compliance, directories, recommendation, and operations. It becomes trustworthy by exposing those boundaries: bindings and revocations are replayable, history is not deleted, participant authority is signed, relaying is permissionless, users can enter raw addresses, and frozen modules cannot be silently replaced.

`approved_for_broadcast` is only a Store workflow status. Whether a Plan can create an Order is determined by finalization in `UVPStateMachine`.
