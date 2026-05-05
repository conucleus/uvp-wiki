# Store 与治理

`zhixu-store/app` 是凝结核工作台和 Store 平台 workflow 前端。它服务凝结核、Store operator、reviewer、governance admin 和 trust reviewer，不是普通参与者任务 App，也不是 Zhixu 内部治理者。

## Store 的产品对象

Store 组织这些对象：

- nucleation identity、设计材料、版本历史；
- Zhixu draft、compile preview、review、version；
- fairness / transparency / exception policy material；
- supplier registry、凝结核内部适配关系、平台 capability tags；
- order search 和 proof drilldown；
- governance attestation/revocation request。

## Store 的边界

Store 可以用自身平台权威做目录打标、材料审核和 workflow 管理，但这些状态要清楚标注来源：

| Store 状态 | 是否链上事实 |
| --- | --- |
| draft imported | 否。 |
| compile preview passed | 否，只是可复现编译结果。 |
| design/fairness material submitted | 否，材料来自凝结核。 |
| submitted for review | 否。 |
| approved for broadcast | 否，只是可发起背书请求。 |
| PlanAttested indexed | 是，来自 trust registry 事件。 |
| SupplierAttested indexed | 是，来自 trust registry 事件。 |

## Governance Handoff

Store 的治理动作应委托给已有 governance service 或管理员流程。它不直接持有私钥，不绕过 admin header，不把 review approval 说成 chain attestation，也不把 Store reviewer 写成 trust registry。

## 为什么 Store 是中心化必要组件

去中心化合约只能验证哈希、签名、事件顺序和授权。现实世界的“哪个凝结核维护这条秩序”“这条 Zhixu 的公平性材料是否完整”“这家报关行联系方式是什么”“这个版本是否推荐使用”需要中心化产品界面组织。Store 就是这层组织能力的产品化入口；可信和可执行仍要回到 trust-domain attestation 与 state-machine events。
