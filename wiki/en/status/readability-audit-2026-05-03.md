# Wiki Readability Audit (Pre-Remediation Record)

Date: 2026-05-03

Scope: I only read the Markdown documents and navigation structure under `uvp-wiki/`. I did not read implementation code in `uvp-protocol`, `uvp-chain-services`, `zhixu-store`, `uvp-order-app`, `uvp-executor-kit`, or `uvp-periphery`. This note records the issues from the perspective of a reader with strong common sense, general software and business-collaboration knowledge, but no prior exposure to UVP.

Note: This is a pre-remediation audit record, so it preserves the high-barrier wording and question patterns that were visible at the time. The body docs have since added [One Order Story](../getting-started/one-order-story.md) and [Glossary](../reference/glossary.md), and have been rewritten to follow the rule of "explain what it is first, then explain the boundary".

## Overall Judgment

The Wiki’s strengths are clear: it guards the protocol boundary tightly, and many pages repeat that "chain events are the source of truth, while backend, Store, notifications, and metadata are only projections or workflow". That is very useful for preventing a normal backend from being written as if it were protocol truth.

The main reading barrier is also concentrated: the docs unfold the whole protocol universe first and explain each term afterward. On a first read, you have to remember Zhixu, nucleation, Supplier, Executor, Source, Signal, Hook, Trigger, Plan, Order, Trust Domain, Product DTO, Projection, Proof, Overlay, Docking, and similar objects at the same time. Each term is explained, but many explanations depend on other specialized terms, so the reader can follow along without forming an initial mental map.

What is most needed is not more detail, but a minimum story that an ordinary reader can follow end to end: how a cross-border procurement order moves from design, endorsement, creation, authorization, evidence submission, task readiness, on-chain proof, to product display, and who does each step, in which system, and which chain event finally counts.

## Highest-Priority Barriers

1. There is no concrete "learn UVP on one page" scenario.

   The current entry points start from transaction cost and protocol boundaries. The intent is clear, but a new reader still does not know what the system looks like. I recommend adding a story page, for example "how a cross-border procurement order runs end to end": the nucleation designs Zhixu, the trust domain endorses the Plan, Store creates the order and invites participants, customs/logistics parties submit signals, and Product API shows the task/proof. Every core term should appear here for the first time, with a one-sentence definition.

2. There is no site-wide glossary.

   Many terms are explained on their own pages, but a new reader needs a bilingual reference they can return to at any time. I recommend adding `reference/glossary.md` with at least these entries: UVP, Zhixu, 秩序, nucleation, Supplier, Executor, Source, Signal, Hook, Trigger, Plan, Order, Trust Domain, Attestation, Authorization, Projection, Replay, Proof, Evidence, Payload Hash, File Resource, Overlay, Stage Patch, Selector Binding, signalMap, Relayer, Product DTO, Product BFF, Store, Order App, Executor Kit, and Periphery.

3. The entry page carries too many responsibilities.

   `wiki/README.md` currently mixes mission, boundaries, engineering route, current status, and release cautions. It is complete, but the first reading pass is crowded with jargon and staging status. I recommend keeping only three things on the entry page: a one-sentence system definition, one concrete story, and three reading paths. Put the detailed status and release evidence on the status page.

4. The navigation has duplicate and legacy entry points.

   `core/README.md` and `concepts/overview.md` are both titled "Core Concepts" and both show the object map. `protocol/README.md` says it is a legacy navigation entry, but it is not in `SUMMARY.md`. `engineering/README.md` is also missing from `SUMMARY.md`. `concepts/core/store.md` and `store/README.md` overlap semantically, and neither is in the main navigation. I recommend choosing one canonical entry and turning the old entry into a short redirect or merge.

5. There are too many boundary statements and not enough user paths.

   The docs use many "what it is not" statements, which are useful for protocol correctness, but a new reader needs to know what it is and when it is used. Each top-level directory should start with "who reads this page, what they do within one day, and what verifiable result they end up with", then explain the boundary.

## Specialized Terms That Are Hard to Read

### Must be explained on the first page or in one story page

| Term | Current question |
| --- | --- |
| UVP | The entry explains the goal, but not in a very short definition. Is it a protocol, a product, a network, or a coordination boundary? |
| Zhixu / 秩序 | Zhixu is a DSL, while 秩序 sounds like a workflow, protocol, network, and organizational relationship. We need to clarify the difference between "Zhixu" and "Order". |
| nucleation | The docs describe it as the initiating core, designer, and organizer, but in practice is it a company, a team, a wallet, a role, or a Store workspace? |
| Supplier | It can be a company, an AI service, an adapter, or even another Zhixu. We need a concrete example before the abstract notion of "capability holder". |
| Executor | The difference from Supplier is explained many times, but we still need a concrete order mapping: supplier subject, executor wallet, submitter, and assignee. |
| Source | This page explains it carefully, but "causal chain" is a new idea. We need one procurement example with `payment`, `logistics`, and `buyer` before we discuss divergence and convergence. |
| Signal | "The smallest business input" is understandable, but the relationship between signal name, sourceId, signalId, payloadHash, and business evidence needs one diagram. |
| Hook | It is easy to mistake this for a web hook. The first occurrence should state clearly that it is a state-machine condition, not an external callback. |
| Trigger | It can be misunderstood as a button or a manual trigger. The docs explain it, but the entry page should say earlier that it is the Hook marker that makes a task appear. |
| Plan | A new reader may think Plan means a business plan or quotation plan. It needs a reminder that it is the on-chain version compiled from a Zhixu. |
| Order | It can be confused with the Chinese word "秩序". It should be fixed as `Order = runtime order instance`, while `秩序 = the coordination rules defined by Zhixu`. |
| Trust Domain | Who the "official domain" is, who can create one, and why it can attest things all need a more product-oriented explanation. |
| Product DTO | DTO is an engineering term. Ordinary readers need to know that it is "the data format that translates chain events into order/task/proof data the frontend can consume". |
| Proof | In the docs, proof can mean chain-event proof, fulfillment proof, linked order proof, or proof verifier output. These layers need to be separated. |

### Can be moved to a second layer, but needs a single consistent definition

| Term | Current question |
| --- | --- |
| Projection | The event-projection concept is clear to engineers, but ordinary readers need it translated as "a read model that can be deleted and rebuilt". |
| Replay | Is it a test, a rebuild, an audit, or a live recovery mechanism? It needs one sentence that sets the boundary. |
| Provenance | It appears in proof and event context, and should be translated as "state origin row". |
| Overlay | Executor overlay, resource overlay, and stage overlay need a combined diagram. |
| Patch | Ordinary readers may think this means a code patch. Here it is an order-level change action. |
| Selector Binding | This term is quite low-level. It needs to explain "which stage is allowed to choose or replace the executor for which target stage". |
| signalMap | The current explanation is technical. It should first say that it is "the translation of a child Zhixu’s start/complete/fail signals back to the parent Zhixu". |
| File Resources | It is easy to misread this as file storage. The glossary should fix it as "resource handle, not plaintext file content". |
| Relayer | Web3 readers will understand it, but ordinary readers need to know it is only "the service/person that broadcasts transactions". |
| EIP-712 | There is no need to explain the standard details on the ordinary path; only say that it is "the structured business statement signed by a wallet". |
| Canonical Hash | It belongs on a reference page, but if it appears too early, it creates unnecessary barriers. |
| ABI | Keep it on engineering paths only; the ordinary path should avoid it. |
| Base Sepolia / Anvil | These belong on status and tutorial pages, but should not distract from understanding the system on the entry page. |
| PRD | The status page contains many PRD numbers, which look like internal project-management material to a new reader. |

## Specific Page Issues

### `wiki/README.md`

- The first three value statements are strong, but the system objects have not been introduced yet. A new reader needs to know what pages they will see, who will use them, and what a completed order looks like first.
- The "one sentence" code block throws out more than ten concepts at once. It reads like a protocol chain, not a single sentence. I recommend splitting it into an "ordinary language version" and an "engineering version".
- Putting the "current project status" on the entry page interrupts the learning path. Keep only a short pointer to the status page, and leave the verified/prototype/staging evidence there.

### `getting-started/README.md`

- The title is English `Getting Started`, but the body is Chinese. I recommend standardizing it as "reader entry".
- It says it answers "what should I read first", but the actual order quickly jumps into quick-start and local loops. It lacks a path for readers who want to understand the system without running code.
- Add three paths: business/product readers, protocol engineers, and integrators/executors.

### `status/README.md`

- The status language is valuable, but PRD100-106, commits, managed Postgres, quota, and no-spend guard are too early for a new reader.
- Split it into two layers: a capability summary and release-evidence detail. The entry should only link to the capability summary.

### `core/README.md` and `concepts/overview.md`

- Both pages are called "Core Concepts" and both provide the object map. New readers cannot tell which one is the main entrance.
- Make `core/README.md` the canonical concept entrance, and turn `concepts/overview.md` into a "core object overview" side page or merge it.

### `concepts/core/zhixu.md`

- It starts with YAML, which is fine for engineers but not for a first-time reader. Start with a natural-language example: a cross-border procurement Zhixu includes demand confirmation, sourcing, payment path, logistics, and acceptance.
- `stage`, `taskPattern`, `source`, `signal`, and `trigger` appear together in the YAML. Start with a table explaining what each line means in real life.

### `concepts/core/source.md`

- This is the hardest topic, and the page puts in a lot of effort, but the examples jump from cross-border trade to oil fractionation and agricultural procurement, which raises the learning cost.
- Start with one cross-border procurement example that runs across the whole site, then move oil and agriculture into "advanced modeling examples".
- There is also a potential ambiguity to fix: `source.md` stresses that Source is not a role, but `signal.md` says "source means the origin of an action, such as a role, supplier, system entry point, or stage source". These two statements can make readers think Source can simply equal a role.

### `concepts/core/signal.md`

- Signal itself is explained clearly, but the boundaries between `payloadHash`, `metadataURI`, evidence, File Resources, and Proof are spread across multiple pages.
- Add a "business files do not go on chain" diagram: plaintext file -> evidence metadata -> `payloadHash`/`metadataURI` -> `SignalSubmitted` -> proof row.

### `concepts/core/hook.md` and `concepts/core/trigger.md`

- The protocol semantics of Hook/Trigger are clear, but the product intuition is weak. Use the same order example to show why a logistics task becomes ready after payment `cmp` appears.
- Hook is easy to confuse with an external webhook. The title or first paragraph should directly say "Hook is not a webhook".

### `concepts/trust/*`

- "Plan trust" and "order action authorization" are separated well.
- But the real identity of the Trust Domain is unclear: who the official domain is, whether there can be more than one domain, whether Store and the trust domain may be run by the same organization, and what the domain owner’s governance responsibility is.
- Attestation and authorization are both "auth/endorsement" words, so the glossary should force a distinction: attestation is trust endorsement, authorization is permission to submit an order action.

### `store/*`

- The Store section has strict boundaries, but there is a lot of repetition. Almost every page says Store metadata is not the chain source of truth.
- Put a "day in Store" story on the entry page first: the nucleation imports Zhixu, organizes suppliers, submits release material, the operator reviews, the governance admin requests attestation, and once `PlanAttested` appears the order may be created.
- `Store`, `Store Console`, `Store Workbench`, `秩序商店`, and `zhixu-store` need to be standardized or at least given an alias table.

### `execution/*`

- The boundary between Executor Kit and Zhixu as Executor is fairly clear.
- But "executor" may mean a human, a company system, an AI/MCP system, an adapter, or another Zhixu. Add a role matrix: human participants use Order App, enterprise/AI users use Executor Kit Product API mode, advanced chain-native executors use chain-native mode, and peer Zhixu systems connect through signalMap docking.

### `components/chain-services.md`

- The "non-trusted execution layer" explanation is correct, but the term itself may make new readers think it is unreliable or unsafe. The first occurrence should say "non-source-of-truth execution layer: you may run it and trust its service quality, but you must not treat it as protocol truth".
- The page is suitable for engineers and should be later in the ordinary-reader path.

### Navigation and Legacy Pages

- `protocol/README.md` calls itself a legacy navigation entry, but it is not attached to `SUMMARY.md`.
- `engineering/README.md` is a useful engineering entry, but it is not attached to `SUMMARY.md`.
- `concepts/core/store.md` and `store/README.md` overlap semantically and do not have a main-navigation entry.
- Either attach them to navigation and label them as "engineering shortcuts / legacy entries", or turn them into short redirects to reduce parallel entrances.

## Recommended Cleanup Order

1. Add `getting-started/system-in-one-story.md`: use one complete business story to explain 12 core terms, and link to it from the first screen of `README.md`.
2. Add `reference/glossary.md`: a bilingual glossary with aliases and "do not confuse" notes, linked from `README.md`, `core/README.md`, and `SUMMARY.md`.
3. Reduce the entrances: keep one core-concepts main gate and handle `protocol/README.md`, `engineering/README.md`, and `concepts/core/store.md` in navigation.
4. Add "who this section is for" and "what you can understand after three steps" to every top-level directory entry.
5. Move the project-status details out of `wiki/README.md` and into `status/README.md`; keep only the current capability summary on the entry page.
6. Fix the Source wording so that "Source is a causal chain" does not conflict with "Source is the origin of an action / a role".
7. Add a documentation rule that every specialized term must have one plain-language explanation at first occurrence and a link to the glossary.

## Suggested One-Page Story Skeleton

```text
1. The nucleation designs a cross-border procurement Zhixu:
   demand confirmation -> supplier sourcing -> payment path -> logistics/customs -> buyer acceptance

2. The compiler turns the Zhixu into a Plan:
   Plan has planId/planHash and can be reviewed and endorsed by a trust domain.

3. Store helps the nucleation organize materials:
   It shows version, suppliers, evidence requirements, and fairness material, but Store itself is not the source of truth.

4. The trust domain endorses the Plan and Supplier:
   PlanAttested/SupplierAttested events enter the on-chain trust registry.

5. The registrar creates an Order:
   The Order binds the Plan and records which wallet may submit which source/signal.

6. A task becomes ready:
   A Hook condition is satisfied, Trigger causes the contract to emit HookReady, and Product API shows the pending task.

7. The executor submits a Signal:
   The customs broker or logistics operator signs with EIP-712 and submits the payloadHash; contract documents/invoices do not go on chain.

8. Product DTO displays the result:
   The user sees the order, task, evidence fingerprint, and proof row; the advanced view can trace back to tx/block/event.
```

This page would make the later side pages much easier to read, because the reader already has a minimal end-to-end loop in mind.
