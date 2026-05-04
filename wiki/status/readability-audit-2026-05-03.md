# Wiki 阅读门槛审计（整改前记录）

日期：2026-05-03

范围：只阅读 `uvp-wiki/` 下的 Markdown 文档和导航结构。没有阅读 `uvp-protocol`、`uvp-chain-services`、`zhixu-store`、`uvp-order-app`、`uvp-executor-kit`、`uvp-periphery` 等实现代码。本文按“有强常识、懂一般软件和商业协作、但第一次接触 UVP”的读者视角记录问题。

说明：这是一份整改前审计记录，保留了当时看到的高门槛表述和问题句式。正文文档已新增 [一个订单故事](../getting-started/one-order-story.md) 与 [核心术语表](../reference/glossary.md)，并按“先讲是什么，再讲边界”的规则改写。

## 总体判断

Wiki 的强项很明确：协议边界守得紧，很多页面都反复说明“链事件是事实源，后端、Store、通知、metadata 只是投影或工作流”。这对工程团队避免把普通后端写成协议事实源很有价值。

主要阅读门槛也很集中：文档先把协议宇宙一次性展开，再解释每个词。第一次读时，需要同时记住 Zhixu、凝结核、Supplier、Executor、Source、Signal、Hook、Trigger、Plan、Order、Trust Domain、Product DTO、Projection、Proof、Overlay、Docking 等对象。每个词都被解释了，但很多解释又依赖别的专有词，导致“我能跟着看，却很难形成第一张心智图”。

最需要补的是一条普通人能跟完的最小故事：一个跨境采购订单从设计、背书、创建、授权、提交证据、任务 ready、链上 proof 到产品展示，分别由谁做、在哪个系统里做、最终哪条链事件作数。

## 最优先要降的门槛

1. 缺少“一页学会 UVP”的具体场景。

   当前入口从交易成本和协议边界讲起，立意清楚，但新读者还不知道系统长什么样。建议新增一页读前故事，例如“一个跨境采购订单如何跑完”：凝结核设计 Zhixu，trust domain 背书 Plan，Store 创建订单并邀请参与方，报关行/物流商提交 signal，Product API 展示 task/proof。所有核心术语都在这个故事里第一次出现，并给一句话定义。

2. 缺少全站术语表。

   很多词在各自页面解释过，但新读者需要一个能随时回查的中英对照表。建议新增 `reference/glossary.md`，至少覆盖：UVP、Zhixu、秩序、凝结核、Supplier、Executor、Source、Signal、Hook、Trigger、Plan、Order、Trust Domain、Attestation、Authorization、Projection、Replay、Proof、Evidence、Payload Hash、File Resource、Overlay、Stage Patch、Selector Binding、signalMap、Relayer、Product DTO、Product BFF、Store、Order App、Executor Kit、Periphery。

3. 入口页承担了太多职责。

   `wiki/README.md` 同时讲使命、边界、工程路线、当前状态和 release 注意事项。它很完整，但第一次读会被密集术语和 staging 状态淹没。建议入口只保留三件事：系统一句话、一个具体故事、三条读者路径。详细状态和 release evidence 放到状态页。

4. 导航里有重复入口和旧入口。

   `core/README.md` 和 `concepts/overview.md` 都叫“核心概念”，都在介绍对象地图。`protocol/README.md` 写明是上一版导航留下的入口，但不在 `SUMMARY.md`。`engineering/README.md` 也不在 `SUMMARY.md`。`concepts/core/store.md` 与 `store/README.md` 语义重复，且不在主导航。建议明确一个 canonical 入口，旧入口只做短跳转或合并。

5. 边界说明太多，用户路径太少。

   文档大量使用“不能是什么”，这对协议正确性有用，但新读者更需要先知道“它到底是什么，谁在什么时候用它”。建议每个一级目录先给“谁用这页、一天内做什么、最后产生什么可验证结果”，再给边界。

## 我读不顺的专有词

### 必须在第一页或一页故事里解释

| 词 | 当前疑问 |
| --- | --- |
| UVP | 入口解释了目标，但没有一个极短定义。它是协议、产品、网络，还是一套协调边界？ |
| Zhixu / 秩序 | Zhixu 是 DSL，秩序又像业务流程、协议、网络和组织关系。需要明确“秩序”和“订单”的区别。 |
| 凝结核 | 文档说是发起核、设计者、组织者，但现实里它是公司、团队、钱包、角色、还是 Store workspace？ |
| Supplier | 它既可以是公司，也可以是 AI 服务、adapter、甚至另一条 Zhixu。需要先给“能力主体”之外的真实例子。 |
| Executor | 它和 Supplier 的区别解释了很多次，但仍需要一个订单里的具体映射：supplier subject、executor wallet、submitter、assignee 分别是谁。 |
| Source | 这页解释得认真，但“因果链”是新概念。需要先用一个订单里的 `payment`、`logistics`、`buyer` 讲清楚，再讲分叉交汇。 |
| Signal | “最小业务输入”容易理解，但 signal 名称、sourceId、signalId、payloadHash、业务证据之间的关系需要一张图。 |
| Hook | 容易被误解成 web hook。应在第一次出现时写明：它是状态机条件，不是外部回调。 |
| Trigger | 容易被理解成按钮或人工触发。文档有说明，但入口里应提前说明它是“让任务出现的 Hook 标记”。 |
| Plan | 新读者容易把 Plan 当成业务计划或报价计划。需要强调它是“某个 Zhixu 编译出的链上版本”。 |
| Order | 容易和“秩序”中文混淆。建议固定中文：`Order = 订单实例`，`秩序 = Zhixu 设计出的协作规则`。 |
| Trust Domain | “官方域”是谁、谁能建域、为什么它能背书，需要更产品化说明。 |
| Product DTO | DTO 是工程词。普通读者更需要知道它是“把链上事件翻译成前端订单/任务/证明的数据格式”。 |
| Proof | 文档里 proof 指链事件证明、履约证明、linked order proof、proof verifier report。需要分层。 |

### 可以放到第二层，但要有统一定义

| 词 | 当前疑问 |
| --- | --- |
| Projection | 事件投影的概念对工程师清楚，对普通读者需要翻成“可删除重建的读模型”。 |
| Replay | 是测试、重建、审计，还是线上恢复机制？需要一句话定界。 |
| Provenance | 出现在 proof 和 event context 里，建议翻成“状态来源行”。 |
| Overlay | Executor overlay、resource overlay、stage overlay 之间关系需要合并图。 |
| Patch | 普通读者会以为是代码补丁。这里是订单级变更动作。 |
| Selector Binding | 术语偏底层。需要说明“哪个 stage 有权为哪个目标 stage 选择/替换执行者”。 |
| signalMap | 当前解释偏工程。需要先说它是“把子秩序的开始/完成/失败信号翻译回父秩序”。 |
| File Resources | 容易误解成文件存储。建议在术语表里固定“资源句柄，不是文件明文”。 |
| Relayer | Web3 背景读者懂，普通读者需要知道它只是“代广播交易的人/服务”。 |
| EIP-712 | 不必在普通路径解释标准细节，只要说明是“钱包签名的结构化业务声明”。 |
| Canonical Hash | 放在参考页合理，但入口里的 deterministic artifact 会提前制造门槛。 |
| ABI | 只在工程路径出现即可，普通路径应避免。 |
| Base Sepolia / Anvil | 状态页和教程里可保留，入口页不要让它们干扰系统理解。 |
| PRD | 状态页里很多 PRD 编号，对新读者像内部项目管理材料。 |

## 具体页面问题

### `wiki/README.md`

- 前三段价值判断很强，但系统对象还没出现，新读者需要先知道“我会看到什么页面、谁会用它、跑完一单是什么样”。
- “一句话”代码块一次抛出 10 多个概念，不像一句话，更像完整协议链路。建议拆成“普通话版本”和“工程版本”。
- “项目当前状态”放在入口页会打断学习路径。建议只保留一句“当前状态见项目状态”，把 verified/prototype/staging evidence 细节留给状态页。

### `getting-started/README.md`

- 标题是英文 `Getting Started`，正文是中文。建议统一为“读者入口”。
- 它说回答“我应该先读什么”，但给出的顺序很快进入 quick-start 和本地闭环。缺少“不跑代码，只理解系统”的路径。
- 建议增加三类路径：业务/产品读者、协议工程读者、集成执行者读者。

### `status/README.md`

- 状态口径很有价值，但 PRD100-106、commit、managed Postgres、quota、no-spend guard 对新读者过早。
- 建议拆成两层：当前能力摘要和 release evidence 细节。入口只链接当前能力摘要。

### `core/README.md` 与 `concepts/overview.md`

- 两页都叫“核心概念”，都提供对象地图。新读者不知道哪个是正门。
- 建议 `core/README.md` 成为概念正门，`concepts/overview.md` 改成“核心对象总览细页”或合并。

### `concepts/core/zhixu.md`

- 一开始就放 YAML，适合工程师，不适合第一次理解。建议先给自然语言例子：一条跨境采购 Zhixu 包含需求确认、寻源、付款、物流、验收几个阶段。
- `stage`、`taskPattern`、`source`、`signal`、`trigger` 在 YAML 里同时出现，建议先用表格解释“这段 YAML 里每一行在现实里是什么”。

### `concepts/core/source.md`

- 这是核心难点，文档投入最多，但例子跨度从跨境到石油分馏、农产品收购，学习成本高。
- 建议先固定一个贯穿全站的跨境采购例子，然后把石油和农产品放到“高级建模例子”。
- 还需要修正一个潜在歧义：`source.md` 强调 Source 不是角色，但 `signal.md` 写“source 表示动作来源，例如某个角色、供应商、系统入口或 stage source”。这两处容易让读者以为 Source 可以随便等同角色。

### `concepts/core/signal.md`

- Signal 本身讲得清楚，但 `payloadHash`、`metadataURI`、evidence、File Resources、Proof 的边界分散在多页。
- 建议增加一张“业务文件不上链”的链路图：文件明文 -> evidence metadata -> payloadHash/metadataURI -> SignalSubmitted -> proof row。

### `concepts/core/hook.md` 与 `concepts/core/trigger.md`

- Hook/Trigger 的协议语义清楚，但产品直觉不够。建议用同一个订单例子表达：付款 `cmp` 出现后，物流任务为什么 ready。
- Hook 容易被理解成外部 webhook。建议在标题或第一段直接写“Hook 不是 webhook”。

### `concepts/trust/*`

- “计划可信”和“订单动作授权”分得很好。
- 但 Trust Domain 的现实身份不清楚：官方域是谁，是否可以有多个域，Store 和 trust domain 是否可能由同一组织运营，domain owner 的治理责任是什么。
- Attestation 和 authorization 都是“授权/背书”类词，建议在术语表里强制区分：attestation 是信任背书，authorization 是订单提交权限。

### `store/*`

- Store 章节边界很严格，但重复度高。几乎每页都在说 Store metadata 不是链上事实。
- 建议入口页先加“Store 中一天的工作”：凝结核导入 Zhixu、组织 supplier、提交发布材料、operator review、governance admin 请求 attestation、看到 PlanAttested 后允许创建订单。
- `Store`、`Store Console`、`Store Workbench`、`秩序商店`、`zhixu-store` 这些名字需要统一或做别名表。

### `execution/*`

- Executor Kit 和 Zhixu 作为 Executor 的边界写得比较清楚。
- 但“执行者”可能是人工、企业系统、AI/MCP、adapter、另一条 Zhixu。建议增加一个角色矩阵：人类参与者用 Order App，企业/AI 用 Executor Kit Product API mode，高级链原生执行者用 chain-native mode，peer Zhixu 通过 signalMap docking。

### `components/chain-services.md`

- “非可信执行层”解释得对，但词本身可能让新读者以为它不可靠或不安全。建议第一次出现时写成“非事实源执行层：可以运行和信任其服务质量，但不能把它当协议真相”。
- 页面内容适合工程师，建议从普通读者路径中后置。

### 导航和旧页

- `protocol/README.md` 自称上一版导航入口，但没有挂到 `SUMMARY.md`。
- `engineering/README.md` 是有用的工程入口，但没有挂到 `SUMMARY.md`。
- `concepts/core/store.md` 与 `store/README.md` 语义重复，且没有主导航入口。
- 建议要么把这些挂进导航并标注“工程快捷入口/旧入口”，要么改成短跳转，减少并行正门。

## 建议的清理顺序

1. 新增 `getting-started/system-in-one-story.md`：用一个完整业务故事解释 12 个核心词，并在 `README.md` 第一屏链接它。
2. 新增 `reference/glossary.md`：做中英术语表、别名、不要混淆项，并从 `README.md`、`core/README.md`、`SUMMARY.md` 链接。
3. 收敛入口：保留一个核心概念正门，处理 `protocol/README.md`、`engineering/README.md`、`concepts/core/store.md` 的导航状态。
4. 给每个一级目录入口加“本目录适合谁读”和“三步读完能理解什么”。
5. 把 `wiki/README.md` 的项目状态细节下沉到 `status/README.md`，入口只保留当前能力摘要。
6. 修正 Source 相关表述，避免“source 是因果链”和“source 是动作来源/角色”冲突。
7. 在文档规则里增加一条：专有词第一次出现时必须给一句普通语言解释，且要链接到术语表。

## 建议的一页故事骨架

```text
1. 凝结核设计一条跨境采购 Zhixu：
   需求确认 -> 供应商寻源 -> 付款路径 -> 物流清关 -> 买方验收

2. 编译器把 Zhixu 编译成 Plan：
   Plan 有 planId/planHash，可被 trust domain 审查和背书。

3. Store 帮凝结核组织材料：
   展示版本、供应商、证据要求、fairness material，但 Store 自己不是事实源。

4. Trust domain 背书 Plan 和 Supplier：
   PlanAttested/SupplierAttested 事件进入链上 trust registry。

5. Registrar 创建一个 Order：
   Order 绑定 Plan，同时写入哪个钱包能提交哪个 source/signal。

6. 某个任务 ready：
   一个 Hook 条件满足，Trigger 让合约发出 HookReady，Product API 显示待处理任务。

7. 执行者提交 Signal：
   报关行或物流商的钱包签 EIP-712，提交 payloadHash，不把合同/发票明文上链。

8. Product DTO 展示结果：
   用户看到订单、任务、证据指纹和 proof row；高级视图能追到 tx/block/event。
```

这页会让后面的细页变得更容易读，因为读者已经有了一个最小闭环。
