# 秩序商店

秩序商店是凝结核、供应商、operator 和普通执行界面之间的链下产品工作台。它提供目录、编译预览、供应商资料、能力标签、搜索匹配、proof 视图、通知、审核流程和 audit，但不把这些商业判断提升为 UVP 协议事实。

```text
凝结核设计 Zhixu
  -> Store 编译预览与链下审核
  -> publisher 签名提交并 finalize Plan
  -> UVPStateMachine 产生 Plan / Order / Signal 事实

Store 线下核验主体
  -> UVPIdentityRegistry 登记 subjectId <-> account
  -> Store 用 descriptor 显示名称
```

## 三条相互独立的边界

| 对象 | 权威来源 | Store 的作用 |
| --- | --- | --- |
| Zhixu 设计和版本选择 | 凝结核材料、publisher 签名、finalized Plan。 | 组织 draft、编译预览、审核和发布操作。 |
| 现实身份 | Store 线下核验 + `UVPIdentityRegistry` binding。 | 显示名称、维护联系与默认目录；撤销后移出默认目录。 |
| Order/Signal 权利 | 参与者签名、订单级授权、active executor overlay。 | 准备 payload、展示状态和 proof；不能替参与者签名。 |

身份 Registry 不认证 Plan，不声明 Supplier 能力或信誉，不负责撮合。Store 的能力标签、搜索排序、推荐特征和匹配记录可以很复杂，也可以因不同 Store 而异，但始终是链下商业数据。

## 中心化与可验证性

Store 明确中心化地承担线下身份核验、名称展示、合规、目录、标签、推荐和运营。用户对它的信任不来自“Store 是去中心化的”，而来自责任边界清楚：身份写入可重放事件、撤销不删除历史、publisher 和参与者权限由签名证明、任意 relayer 可广播、用户可绕过目录直接使用原始钱包地址、冻结 modules 不能被后台静默替换。

## 信息架构

| 区域 | 内容 |
| --- | --- |
| [凝结核工作台](nucleation-workbench.md) | Zhixu draft、编译、版本和设计材料。 |
| [Zhixu 管理](zhixu-management.md) | publisher 签名、Plan commit/finalize 与 Store 发布 workflow。 |
| [Supplier Directory](supplier-directory.md) | 线下 Supplier 资料、能力标签、身份 binding 和联系。 |
| [履约与 Proof](runtime-proof.md) | Order、task、Signal、proof 与身份显示。 |
| [联系与通知](contact-notifications.md) | delivery intent、retry、负责人和 SLA。 |
| [治理与 Audit](governance-audit.md) | Store operator 权限、身份登记/撤销和链下审核记录。 |
| [Docking Sandbox](docking-sandbox.md) | peer Zhixu、adapter 和 signal map 的链下试拼。 |

Store workflow 状态不是链上权利。`approved_for_broadcast` 只表示 Store 愿意执行下一步；Plan 是否可用于创建 Order，以 `UVPStateMachine` 中是否 finalized 为准。
