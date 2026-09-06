---
title: AI 时代的协作地基
type: tutorial
audience: 协议读者
status: verified
---

# AI 时代的协作地基

如果 AI 只是在单个系统里替你写邮件、审单、报价或生成材料，UVP 没有必要。UVP 讨论的是另一层问题：当一个订单跨越客户、EPC、OEM、报关行、物流商、资金方、审计方和多个企业系统时，各方如何共同承认“谁有权确认什么”，以及这个确认如何被后续参与方信任、回放和追责。

这件事在 AI 时代会变得更重要，而不是更轻。AI 让执行能力变便宜，也让更多主体和工具能参与同一条生产关系；参与者越多，边界越需要标准化。

## AI 降低执行成本，不自动降低交易成本

AI 正在把“完成一项任务”的成本打下来。一个 agent 可以写代码、审单、报价、生成报关材料，企业系统也可以自动执行更多步骤。真正卡住跨组织协作的，仍然是另一组问题：该和谁协作，按什么规则协作，谁有资格接下一步，谁能确认结果，确认之后谁负责。

这些问题就是交易成本。根因是不同组织之间没有天然共享的事实源、责任边界和执行后果。AI 可以把某个报关文件写得更快，但它不能自动回答：这个文件由谁授权提交，凭证指纹是什么，哪一个订单阶段被推进，后续付款或验收为什么应该相信它。

UVP 的切入点不是再做一个工作流系统，也不是让 AI agent 自己说了算。UVP 把协作规则写成可复用的 Zhixu DSL，把执行权限、证据指纹、钱包签名和状态后果收束成标准化业务 signal，再把关键事实落成链上 proof。

## 协作先要回答“谁能负责”

现实里的生产关系不是一条线。以跨境光伏项目为例，许可、招标、排产、报关、清关、安装、验收、付款和 O&M 责任互相咬合——[一个订单故事](one-order-story.md)开头画的就是这条依赖链。

每一步都可能由不同主体完成：人、企业系统、AI agent、供应商、资金方、审计方或监管方。它们不只是需要“自动化流程”，还需要共同承认同一组事实：某个主体被授权在某个订单、某个阶段、某个证据指纹下发出了某个业务 signal，并且这个 signal 会触发可追责的后果。

所以 UVP 先把“谁能对什么负责”变成协议事实：

```text
授权主体
  -> 订单和阶段
  -> 证据指纹
  -> 钱包签名
  -> 业务 signal
  -> 状态后果和 proof
```

这是 AI、企业系统和普通参与者能在同一条协作边界里工作的前提。

## 为什么不是只信平台

在单一法域里，一个中心化平台可以成为可信记录方，因为用户对平台的信任通常来自监管机构、司法系统和本地合规责任。跨境协作时，这个前提会变弱：外国用户、银行、监管机构或合作方不天然信任由某一方运营的平台数据库，外国监管机构也未必能直接约束这个平台。

反过来看，如果没有链上事件作为共同事实源，A 方和 B 方争议“谁先提交了某个 signal”时，只能依赖某个平台数据库的日志；而这个数据库可能由其中一方、或其中一方法域内的平台维护。UVP 把授权、签名、证据指纹、提交顺序和状态后果落成可重放链事件，让跨境参与方先拥有一份共同记录。现实真实性、赔付、监管结论和法律责任仍由合同、监管、仲裁、保险、审计或 Identity Registry 处理；这些边界的正式表述见[协议边界](../concepts/protocol-boundaries.md)。

## 科斯定理的工程实践

UVP 的目标是成为科斯定理在 AI 时代的工程实践：把交易成本拆成可实现的协议对象。

下表是解释性对照：用交易成本的分类帮助理解 UVP 的工程对象，不是严格的学术对应，也不是协议规范。

| 交易成本 | UVP 的工程对象 |
| --- | --- |
| 搜索成本 | Store、Supplier Directory、identity projection、Product catalog。 |
| 议约成本 | Zhixu DSL、Plan、plan hash、file resources、supplier requirements。 |
| 协调成本 | Source、Signal、Hook、Trigger、Order、executor authorization。 |
| 监督成本 | evidence metadata、payload hash、metadata URI、proof row、timeline。 |
| 集成成本 | Product DTO、Chain Services、executor-kit、adapter/periphery boundary。 |
| 争议和抵赖成本 | EIP-712 签名、`SignalSubmitted`、`HookReady`、Identity Registry events、replayable chain proof。 |

这张表把过去靠经验、合同、邮件、截图和平台后台维持的生产关系，拆成可以校验、索引、组合和重放的对象。

## 从 L3 Agent 到 L4 / L5

AI agent 可以完成单个任务：写代码、审单、报价、生成文件。完成单个任务不需要 UVP。UVP 的位置在更高一层：**发明新的协作规则（L4 Innovator），以及调配跨主体、跨组织、跨法域的生产关系（L5 Organizer）。**

这个判断成立的前提是：AI 不只是调用工具，还能操作一套可验证的协作对象。

**AI 的舒适区是文字，UVP 给了一套让文字变成协作规则的语言。** Zhixu DSL 的形态接近 YAML，LLM 可以理解、生成、组装；但编译器的确定性翻译和链上状态机的强制执行，保证同样的 DSL 永远产生同样的协作边界。AI 不需要长手长脚，它只需要说清楚“谁先开始、谁等谁、什么证据算完成”，然后把现实中的报关行、物流商、资金方当作手脚来接收 signal。

**StateMachine 记录 Plan 发布，Identity Registry 记录主体与钱包。** Zhixu 的历史运行记录来自订单事件、evidence hash 和 proof projection。AI Organizer 可以检索已发布的 Zhixu 模块，通过 Docking 组装协作图，再把满足 Store 或订单策略的人类、企业或 AI agent 放在 executor 位置上。

**AI Organizer 生成和组合协作规则，现实主体负责授权与执行。** 人提出目标并批准关键边界，AI 生成 Zhixu DSL，编译器确定版本，UVP 按 signal 边界协调人、企业和 AI agent。人继续承担授权、监督和例外处理责任，链上记录保留每个关键动作的责任来源。

## 这个判断仍需要证据

UVP 现在已经具备 L4/L5 所需的协议事实层。完整底座还需要真实 Zhixu 模块、可靠的身份核验运营、足够密度的 supplier/executor 网络、负路径 proof，以及 Store 中可搜索、可复用、可组合的秩序库存。

UVP 的愿景很明确：成为 AI 时代可组合生产关系的协议底座，让人、企业系统和 AI agent 都能围绕同一套可验证协作对象组织真实订单。今天的实现已经把协议事实层跑出来；接下来要让更多真实 Zhixu、Identity Registry 和 supplier/executor 网络沉淀成可复用库存。


继续读 [一个订单故事](one-order-story.md) 可以建立业务直觉；读 [Plan 与订单生命周期](../concepts/lifecycle.md) 可以看到这套愿景怎样落到工程路径；读 [项目状态](../meta/status.md) 可以确认当前哪些能力已经 verified，哪些还在继续推进。
