# Actor Map

This page maps real roles in a cross-border PV project to UVP roles. Keep the main split in mind: real-world subjects do the work and accept responsibility; UVP records authorized signals, signatures, evidence fingerprints, and chain consequences.

Read the map in this order:

```text
Nucleation designs the reusable rulebook
  -> Trust Domain endorses the Plan or Supplier
  -> Publisher registers the Plan
  -> Registrar registers one Order and its signal permissions
  -> Submitter signs a business Signal
  -> Relayer may broadcast the transaction
  -> Chain Services displays the rebuilt Product / Store view
```

## From Real Roles to UVP Roles

| Real role | What they do in the PV project | UVP role | What proves it |
| --- | --- | --- | --- |
| Government / regulator | Permits, filings, grid connection, acceptance, regulatory conclusions. | Trust Domain or external signal issuer. | `PlanAttested`, regulatory signal, Product proof row. |
| Project company / owner | Starts the project and confirms demand, contracts, payment, and acceptance. | Buyer / Owner, Order participant. | `OrderRegistered`, owner-side `SignalSubmitted`. |
| Nucleation | Designs this class of PV delivery coordination as a reusable Zhixu, maintains versions and supplier slots. | Nucleation. | Compiled `planId` / `planHash`; `PlanAttested` after endorsement. |
| Store operator | Imports the Zhixu, organizes supplier profiles, reviews materials, and starts endorsement workflows. | Store operator. | Store audit record; official trust still comes from registry events. |
| EPC / EPCM | Design, procurement, construction management, installation coordination, acceptance materials. | Supplier or Executor, depending on the Order stage. | supplier trust, order authorization, EPC-stage `SignalSubmitted`. |
| OEM / tier-1 supplier | Final spec, samples, tooling, pilot run, factory release, inspection, packing. | Supplier; sometimes Executor for an Order stage. | `SupplierAttested`, factory or inspection signal, payload hash. |
| Importer / customs / logistics | Shipment, port arrival, customs declaration, customs release, port transport. | Supplier / Executor / adapter. | customs or logistics `SignalSubmitted`, tx/block/log proof. |
| Warehouse / site delivery | Warehouse receipt, outbound, site arrival, handover, delivery confirmation. | Executor or site supplier. | warehouse receipt, site-delivery signal, Product proof row. |
| O&M | Post-installation inspection, fault response, maintenance records. | Supplier / Executor. | O&M signal, maintenance evidence hash, proof row. |
| Funder / insurer / auditor | Payment, credit, insurance, audit, risk confirmation. | Trust Domain, adapter, or signal issuer. | endorsement, payment/audit/insurance signal, chain-event proof. |
| Registrar | Creates a concrete Order against an endorsed Plan and writes initial signal permissions. | Registrar. | `OrderRegistered`, `SignalSubmitterAuthorized`. |
| Relayer | Broadcasts participant-signed transactions and may pay gas. | Relayer. | transaction hash and chain event; business responsibility comes from submitter signature. |
| Chain Services | Rebuilds order, task, timeline, proof, and trust views from chain events. | Rebuildable Service Layer. | projection row with tx, block, log, contract, chain id, and event provenance. |

## Supplier and Executor in One Concrete Stage

For a customs-release stage:

| Layer | Example |
| --- | --- |
| Supplier | The customs broker company that has the capability and may receive trust-domain endorsement. |
| Executor | The broker's operations wallet, employee wallet, API wallet, or adapter that is authorized for this Order stage. |
| Authorization | `SignalSubmitterAuthorized` binds that submitter wallet to the customs source/signal for this Order. |
| Proof | `SignalSubmitted` plus payload hash and transaction provenance proves what was submitted. |

## Authority Sources in One Order

| Question | Authority source |
| --- | --- |
| Is this PV delivery Zhixu endorsed? | Trust-domain `PlanAttested` / `PlanRevoked`. |
| Does this project-delivery Order exist? | `UVPStateMachine.OrderRegistered`. |
| Who may submit a stage signal? | `SignalSubmitterAuthorized`, plus active executor overlay when present. |
| Did a business action happen? | Authorized wallet signature and `SignalSubmitted`. |
| Is the next task open? | `HookReady`. |
| Where does the Product or Store view come from? | Chain-event projection; workflow metadata must be marked clearly. |

## How to Read a Role

| Question | How to decide |
| --- | --- |
| Is this subject designing a coordination template or executing a concrete Order? | Template design maps to Nucleation / Store; concrete execution maps to Order participant / Supplier / Executor. |
| Does this subject provide long-term capability or handle the current stage? | Long-term capability maps to Supplier; current-stage submitter maps to Executor or submitter. |
| Does this subject endorse real-world trust or create an Order? | Endorsement maps to Trust Domain; Order creation and initial authorization map to Registrar. |
| Does this subject broadcast a transaction or sign the business statement? | Broadcasting maps to Relayer; business statement maps to submitter signature. |
