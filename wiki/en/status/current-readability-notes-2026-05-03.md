# Current Wiki Readability Notes

Date: 2026-05-03

Implementation note: this record captured the readability state before the medium navigation reorganization. It remains useful as audit background; some items below may now be partially or fully remediated by the current Wiki layout.

Scope: I read only the English Markdown documents under `uvp-wiki/`. I did not read implementation code in `uvp-protocol`, `uvp-chain-services`, `zhixu-store`, `uvp-order-app`, `uvp-executor-kit`, `uvp-deploy`, or `uvp-periphery`.

Reader stance: a technically literate reader with strong business and software common sense, but no prior UVP context, trying to learn the system only from the Wiki.

## Overall Judgment

The current Wiki is much more readable than the pre-remediation audit record. The most important fixes are already present: [One Order Story](../getting-started/one-order-story.md), [Glossary](../reference/glossary.md), role-specific sections for Store/Product/Execution, and repeated source-of-truth boundaries.

The remaining barrier is density and abstraction. A new reader can eventually learn the system, but they still have to hold too many invented or UVP-specific terms at the same time: Zhixu, Nucleation, Supplier, Executor, Source, Signal, Hook, Trigger, Plan, Order, Trust Domain, Attestation, Authorization, Product DTO, Product BFF, Signal Container, Stage Overlay, Selector Binding, signalMap, Docking, and Periphery.

The docs should now move from "complete explanation" toward "guided comprehension". The first pass should make the reader confident about one concrete business order, one actor map, and one event path. The second pass can teach compiler, contract, DTO, and release details.

## Highest-Friction Issues Still Present

1. The front page still asks newcomers to absorb the whole universe too early.

   `README.md` now links the story and glossary, but it still starts with a broad thesis, a dense "In One Line" chain, current status, staging notes, and engineering paths. The recommended reading order starts with Project Status before One Order Story. For a first-time reader, status details such as Base Sepolia, managed Postgres/R2, PRD status, and release gates are distracting before they understand what an Order is.

   Recommended fix: make the default path "Story -> Glossary -> Actor map -> Core concepts". Move Project Status into an engineering/release path.

2. `Nucleation` is still the hardest role to imagine in the real world.

   The definition says "originating nucleus, designer, and organizer". I still do not know whether it is normally a company, a team, a workspace, a wallet, a product owner, a protocol governance body, or a marketplace operator. The Store docs repeatedly say Nucleation owns internal governance; the product shape is still abstract.

   Recommended fix: add one concrete identity example: "ACME Procurement Team is the Nucleation for the cross-border procurement Zhixu; it owns `spec.nucleation.id`, maintains versions, organizes supplier slots, and uses Store as its workbench."

3. `Trust Domain` is defined, but the "official domain" relationship is still underspecified.

   The docs say the official trust domain attests plans and suppliers, and `registerPlan()` checks that domain. I still do not know who chooses the official domain, whether multiple domains can exist, whether Store and the official domain can be operated by the same organization, and what happens when domains disagree.

   Recommended fix: add a trust-domain FAQ and a short governance model: domain owner, reviewer, official domain id, optional additional domains, revocation responsibility, and what Store may display from each.

4. `Source` is accurate but still mentally expensive.

   The Source page explains causal chains well, but it jumps from supplier sourcing to seller/buyer convergence, oil fractionation, agricultural procurement, and cross-border sources. That is a lot of modeling before the reader has a stable example.

   Recommended fix: keep the first half to one cross-border order and show a small table: source, real-world lane, example signal, who submits, what later hook depends on it. Move oil/agriculture to advanced modeling.

5. `Hook` still risks being mistaken for a webhook.

   The Hook page says it is a condition, but the first paragraph should explicitly say "Hook is not an HTTP webhook or callback." This is still worth doing because "HookReady" otherwise sounds like an integration callback to many readers.

6. `Trigger` still needs a simpler product intuition.

   Current definition is correct: a trigger is a hook marker that emits `HookReady`. For a product reader, the simpler explanation is: "Trigger is the rule that opens a task." The page should start with a product sentence before compiler semantics.

7. Proof, evidence, file resources, payload hash, metadata URI, and Product proof rows are still split across pages.

   The Signal and File Resources pages explain the boundary, but the reader needs one single diagram:

   ```text
   business file/plaintext
     -> evidence metadata
     -> payloadHash / metadataURI
     -> signed Signal
     -> SignalSubmitted event
     -> proof row in Product DTO
   ```

   Without this, "proof" can mean evidence proof, chain-event proof, fulfillment proof, linked-order proof, or proof-verifier output.

8. `non-trusted` and `Untrusted` were inconsistent and emotionally loaded.

   Before the navigation reorganization, the main term and some link labels used variants of "trusted / untrusted" language. The intended meaning was forkable projection layer outside the protocol fact source; "untrusted" could sound unsafe or unreliable.

   Recommended fix: use "Rebuildable Service Layer: Chain Services" as the reader-facing phrase, while keeping "non-trusted execution layer" only as the protocol alias.

9. Navigation still has parallel entrances.

   `core/README.md` and `concepts/overview.md` are both titled "Core Concepts" and are very similar. `concepts/core/store.md` overlaps with `store/README.md`. `protocol/README.md`, `engineering/README.md`, and `concepts/core/plan-order.md` are compatibility/side entries but are not clearly framed in navigation.

   Recommended fix: keep one canonical public entrance for each reader goal, and label the others as legacy/side-view pages at the top. If they remain outside `SUMMARY.md`, say they are retained for old links only.

10. Store docs repeat boundaries more than they build a user journey.

    The Store section is correct about authority separation, but many pages restate that Store metadata is not chain truth. A Store operator still needs one "day in Store" scenario: import Zhixu, compile preview, organize supplier, request review, request attestation, see `PlanAttested`, create or locate an order, inspect proof.

11. Docked Zhixu is powerful but currently a second-layer topic leaking into first-layer learning.

    `supplierType=zhixu`, `signalMap`, linked order, mapped signal, and docking events appear in One Order Story and several concept pages. A new reader can understand the core order path without docked Zhixu. It should be introduced as an advanced extension after the base order loop is fully stable.

12. The maturity/status signal is too close to the learning path.

    Project Status is useful for engineers, but it contains PRD100-106, managed-provider quota, Postgres/R2/JWT, commit-level claims, and no-spend guards. These are release-owner details. New readers need a simpler "what works now / what is prototype / what is planned" table before release evidence details.

## Terms I Would Still Add or Expand in the Glossary

The current glossary is useful but too short for the number of project terms in the docs. I would add:

| Term | Why it is still confusing |
| --- | --- |
| UVP | The entry page explains the mission, but the glossary should say whether UVP is a protocol, coordination model, product family, or implementation track. |
| Attestation | Needs a plain distinction from authorization: endorsement vs permission. |
| Authorization | Present, but should mention order-level, stage patch, Store workflow permissions, and why these are different. |
| Publisher | Appears in plan registration but is not a glossary term. |
| Registrar | Appears in order registration and `::OUTSIDE`, but is not a glossary term. |
| Official domain | Needed because many pages say official trust domain without explaining who configures it. |
| Evidence | Needs to be distinct from proof, payload, resource, and file. |
| Proof | Needs layered meanings: chain-event proof, Product proof row, evidence proof, linked-order proof. |
| Payload hash | Central to signal submission; should be defined in plain language. |
| Metadata URI | Needs a boundary: pointer to off-chain metadata, not the truth itself. |
| File Resource | Present, but add "handle, not file storage". |
| Stage | Used everywhere; should be defined before Hook/Trigger. |
| Task Pattern | Appears in Zhixu DSL and compiler input. |
| stageIdentifier / stageId | New readers see both; explain human-readable vs hashed. |
| HookPlan | Not in current glossary, but appears very early. |
| OnchainHookPlan | Same as above. |
| HookReady | It is the task-opening event; define directly. |
| Stage Overlay | Present in docs, missing in glossary. |
| Stage Patch | Needed because "patch" sounds like code patch. |
| Selector Binding | Needed because it controls executor/resource patch rights. |
| Product BFF | Engineering term; explain as order-draft/invite/registration workflow service. |
| Signal Container | Product-layer wrapper for task/evidence/signature/submit/proof. |
| Docking / Docked Zhixu | Needs plain distinction between sandbox pairing, linked order, and mapped signal proof. |
| Periphery | Explain as adapters around core, especially funding/guarantee/payment/agent work. |
| Anvil / Base Sepolia | Keep these in engineering/release path, but define when they first appear. |
| Replay | Define as rebuilding state from events, not simply rerunning a test. |

## Page-Level Notes

### `wiki/en/README.md`

- Good: it now has a strong mission, reading order, and current status.
- Issue: it is still trying to be mission, glossary, roadmap, status, release caution, and engineering guide at the same time.
- Suggested cut: default front page should show "What UVP is", "one order story", and "choose your path"; status and release evidence should be linked, not embedded.

### `wiki/en/getting-started/one-order-story.md`

- Good: this is the most useful newcomer page.
- Issue: docked Zhixu enters before the ordinary path has enough product detail. Consider splitting the advanced linked-order section into "optional extension".
- Missing: the story should name concrete actors: buyer, Nucleation, trust domain reviewer, registrar, logistics executor, Store operator, relayer.

### `wiki/en/reference/glossary.md`

- Good: solves the largest old gap.
- Issue: too short relative to term density. It covers the core noun objects, but not the action/event/maturity terms that appear in real pages.
- Suggested structure: Object terms, action/event terms, product/service terms, release/environment terms, "do not confuse" pairs.

### `wiki/en/concepts/core/source.md`

- Good: the concept is explained carefully.
- Issue: examples are too broad for first read. Start with cross-border only, then branch to oil/agriculture under "advanced examples".

### `wiki/en/concepts/core/hook.md`

- Good: condition semantics and positive-anchor rules are clear.
- Issue: say directly that Hook is not a webhook, and lead with "condition that may open a task through Trigger".

### `wiki/en/concepts/core/trigger.md`

- Good: compiler/contract semantics are clear.
- Issue: product explanation should come first: "Trigger turns a ready condition into an executable task."
- Issue: `::OUTSIDE` is important but feels advanced; define empty source and OUTSIDE in the glossary or a sidebar.

### `wiki/en/concepts/trust/domains.md`

- Good: plan/supplier attestation is clearly separated from action authorization.
- Missing: who owns the domain, how official domain is selected, whether domains are multiple, and how Store displays domain disagreements.

### `wiki/en/store/README.md`

- Good: authority boundaries are disciplined.
- Issue: repetition of boundary statements makes the product journey harder to see.
- Suggested addition: one Store operator story and an alias table for Store, Store Console, Store Workbench, and `zhixu-store`.

### `wiki/en/execution/zhixu-as-executor.md`

- Good: the local/linked order model is explicit.
- Issue: this should be treated as advanced composition. For first-time readers, it introduces too many concepts at once: peer Zhixu, linked order, signalMap, docking link, mapped signal, proof bridge.

### `wiki/en/status/README.md`

- Good: status labels are useful and careful.
- Issue: the page mixes capability summary with release-evidence internals. A reader who just wants to know "what is real" has to parse PRDs, commits, managed quota, and service profile details.

## Recommended Cleanup Order

1. Rewrite the first-screen reading path so One Order Story is first, Project Status is an engineering/release path.
2. Expand the glossary with action/event/service/release terms and more "do not confuse" pairs.
3. Add one actor-event table for the core order story: who acts, where they act, what they sign or submit, which event proves it.
4. Add one evidence/proof diagram across business file, evidence metadata, payload hash, metadata URI, signal, event, and Product proof row.
5. Clarify Nucleation and Trust Domain with concrete organizational examples.
6. Rename or standardize `non-trusted` / `Untrusted` display language.
7. Reduce duplicate entrances: choose canonical concept/store/protocol pages and label compatibility pages.
8. Move docked Zhixu deeper into the advanced integration path, while keeping a one-line pointer in the story.
9. Split status into "capability maturity summary" and "release evidence details".
