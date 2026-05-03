# Executors and Integrations

The Executors and Integrations catalog answers "who executes, how they connect, and how they submit signals." It connects the core concept of [Executor](../concepts/core/executor.md), the signal container exposed by [Product Language and DTO/API](../product/README.md), executor-kit, Order App, periphery adapters, and docked Zhixu.

```text
HookReady / Product task
  -> executor-kit / Order App / enterprise script / AI-MCP adapter
  -> evidence hash or metadata
  -> EIP-712 business signature
  -> Product API or direct submitSignal
  -> chain proof
```

## Reading Path

| Page | What it solves |
| --- | --- |
| [Executor Kit](executor-kit.md) | How the CLI/SDK listens for tasks, prepares the signal container, signs, submits, and reads proof. |
| [Zhixu as Executor](zhixu-as-executor.md) | How one Zhixu docks into another and how local/linked orders connect through signalMap and proof. |
| [Executor Core Concept](../concepts/core/executor.md) | The object boundaries of Supplier, Executor, active executor, selector patch, and signal submitter. |
| [Order App and Executor Kit](../concepts/architecture/components/order-app-executor-kit.md) | The division of labor between the ordinary participant UI and the automation executor tools. |
| [Periphery and Adapter](../concepts/architecture/components/periphery-deploy.md) | How funding, guarantee, payment, and agent adapters extend around the core protocol. |
| [CLI and Configuration](../reference/cli-and-config.md) | The current executor-kit commands, chain-services configuration, and frontend config. |
| [Chain Services](../components/chain-services.md) | The untrusted service layer used by Product API mode, relayer boundaries, and proof/status queries. |

## Fact Boundary on the Execution Side

Executor Kit, Order App, enterprise scripts, and AI/MCP adapters are all signal producers. They help participants discover tasks, prepare evidence, sign, and submit; the contracts still check:

- `UVPStateMachine` order-level signal authorization;
- the active executor overlay;
- the EIP-712 business signature;
- first-writer-wins signal semantics;
- chain event proof.

Relayers can pay gas or forward transactions; business signatures come from the authorized participant. The Store can contact executors, save notification state, and display fulfillment records; business completion is shown by state-machine signal/proof.

## Division of Labor with Product Language

| Layer | Responsibility |
| --- | --- |
| Product language and DTO/API | Project chain events into orders, tasks, proof, trust status, and signal containers. |
| Executors and integrations | Consume tasks and signal containers, prepare evidence, produce EIP-712 signatures, submit, and read proof back. |
| Store | Manage Zhixu/Supplier, docking sessions, operator review, and platform workflow. |

## Three Execution Entrypoints

| Entrypoint | Best for | Fact boundary |
| --- | --- | --- |
| Order App | Ordinary participants, manual task handling. | Consumes only Product DTO and signal container. |
| Executor Kit Product API mode | Enterprise systems, supervised agents, scripts, future MCP tools. | Submits through the prepare/sign/submit/proof boundary. |
| Executor Kit chain-native mode | Advanced chain-native executors, self-managed watchers. | Watches `HookReady` directly and submits authorized `submitSignal`. |

Most real integrations should prefer Product API mode. Chain-native mode is reserved for executors that need low-level HookReady handling and direct contract interaction.
