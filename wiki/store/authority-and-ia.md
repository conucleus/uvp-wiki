# Store 权威边界与信息架构

秩序商店的信息架构必须分清三件事：凝结核内部治理、Store 平台 workflow、trust domain 外部背书。Store 给凝结核提供舞台，给 operator 提供目录和审核工具，给 trust reviewer 提供材料和 proof；但不能把平台 metadata 写成协议事实。

## 信息对象

| Store 对象 | 主要负责人 | 链上事实 | Store 组织信息 |
| --- | --- | --- | --- |
| Nucleation / 凝结核 | Zhixu 设计者 / 秩序组织者 | 无独立合约状态；体现在 Zhixu/Plan/Order/proof 中。 | identity、维护说明、版本历史、设计材料、发布材料。 |
| Zhixu draft/version | 凝结核设计，trust domain 背书 | `PlanAttested` / `PlanRevoked` 决定 official trust。 | draft、compile preview、fairness material、platform tags、active recommendation。 |
| Supplier | 凝结核组织，trust domain 背书 | `SupplierAttested` / `SupplierRevoked` 决定 trust projection。 | profile、capability tags、联系人、通知渠道、审核状态、历史参与记录。 |
| Order | registrar/participants/executors | `OrderRegistered` 和 state-machine events 决定运行状态。 | 搜索、排序、标签、operator note、proof summary。 |
| Task / performance | authorized submitters | `SignalSubmitted`、`HookReady`、stage overlay events 决定状态。 | 履约视图、异常提示、联系提醒、SLA 展示。 |
| Platform workflow | Store operator/reviewer/admin | registry tx 和 indexed events 决定 public claim。 | 审批、确认、audit、broadcast request、失败原因。 |
| Docking relation | local/linked order各自的 state-machine events 和 mapped signal proof | mapped signal 和 proof 决定local order推进。 | sandbox session、peer Zhixu 选择、relation metadata、operator review。 |

## Store 首页应该组织什么

- Search first：同一个查询可以命中凝结核、Zhixu、Order、Supplier、Governance object。
- Nucleation visible：Zhixu 版本要显示是谁设计和维护，而不是只显示 Store 状态。
- Trust visible：任何 plan/supplier trust 都要显示来自 registry projection 的状态。
- Proof reachable：订单、任务、supplier participation 都应能进入 proof/timeline。
- Store-only metadata labeled：draft、review、note、contact、notification、platform tag 必须标注为 Store/workflow 信息。
- Revoked visible but blocked：revoked plan/supplier 可以被 operator 查到，不能被当成可创建新订单的对象。
- Docking visible：peer Zhixu、adapter、signalMap、local/linked proof 要能从同一条 workflow 进入。

## 推荐 IA

```text
Store Home / Search
  -> Nucleation Workbench
       -> identity / design material / supplier organization / publish material
  -> Zhixu Catalog
       -> draft / compile preview / fairness material / trust status / active version
  -> Supplier Registry
       -> profile / nucleation fit / platform tags / contact / trust / participation
  -> Orders & Proof
       -> order detail / task timeline / proof rows / revoked warnings
  -> Docking
       -> sandbox / signalMap validation / local-linked relation / proof bridge
  -> Platform Workflow
       -> review / attestation request / revocation request / audit
```

搜索可以横跨对象，但对象详情页必须显示自己的权威来源。比如 supplier 搜索命中的是 Store profile，trust badge 必须来自 registry projection；Zhixu 卡片可以展示 Store 推荐版本，但 official 状态必须来自 plan attestation。

## 不允许的 IA

- 不把 Store 列表排序、平台标签或运营推荐写成 trust。
- 不把 Store admin 写成 Zhixu 内部治理者。
- 不让普通用户页面承担 Store search / governance / supplier registry 职能。
- 不让 Store metadata revive revoked plan 或 revoked supplier。
- 不隐藏 chain syncing/rebuild 状态，避免 operator 把投影延迟理解成对象不存在。
- 不让 docking sandbox 的“校验通过”直接变成可创建订单能力。
- 不把 contact delivered、message read、operator note 写成业务 signal。
