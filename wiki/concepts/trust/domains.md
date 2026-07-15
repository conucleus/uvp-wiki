# Identity Registry：现实身份与链上地址

当前 Registry 明确是 **UVP Store 自己运营的身份准入域**。代码保留配置多个 Registry 地址的能力，为未来其他国家的合规主体或独立机构预留接口；首期只运行一个，也只对外宣传 Store 自己的 Registry。

`UVPIdentityRegistry` 很薄，只回答一个问题：某个线下主体对应哪些链上钱包。它不认证 Plan，不声明供应商能力或信誉，不做推荐，也不决定谁能创建 Order 或提交 Signal。

```solidity
owner() -> address
transferOwnership(address newOwner)
registerIdentityBinding(subjectId, account, descriptorHash, descriptorURI) -> bindingId
revokeIdentityBinding(bindingId, reasonHash, reasonURI)
activeBindingForAccount(account) -> bindingId
getIdentityBinding(bindingId) -> IdentityBinding
```

## 数据模型

| 字段 | 含义 |
| --- | --- |
| `registryAddress` | 发出身份事件的 Registry；不同地址是不同身份域。 |
| `bindingId` | 一条不可复用的身份绑定记录。 |
| `subjectId` | Store 内的线下主体标识，不是能力标签。 |
| `account` | 对应的钱包地址。 |
| `descriptorHash` | 线下身份描述材料的内容承诺。 |
| `descriptorURI` | 链下材料位置；可供 Store 显示名称和审计线索。 |

同一 subject 可以绑定多个钱包；一个钱包在同一 Registry 中同时只能有一个 active binding。撤销按 `bindingId` 进行，历史不会删除。

## 撤销的实际含义

撤销后，Store 不再把该钱包解析成当前默认身份，也不应继续放进默认目录。它不会回滚既有 Order，不会撤销历史签名，也不能阻止用户手工输入原始钱包地址。真正的 Order/Signal 权利仍来自参与者签名、订单级授权和当前 executor overlay。

## Store 的责任边界

名称、联系方式、能力标签、搜索与推荐特征、匹配记录、审核流程都属于 Store 链下数据。它们可以复杂、可以因 Store 而异，但不能伪装成 UVP 协议事实。Registry 只留下身份绑定的 hash/URI 和可重放事件。
