# 版本与语义矩阵

| 边界 | 当前版本 | 含义 |
| --- | --- | --- |
| Rust core package | `0.1.0` | Hook 规范求值核心。 |
| 协议语义 | `uvp-semantic/0.3` | Hook 解析、求值和 replay 一致性边界。 |
| HookPlan artifact | `uvp.hookPlan.v1` | 编译器内部/公共 artifact。 |
| OnchainHookPlan | `uvp.onchainHookPlan.v1` | EVM 编译产物 schema。 |
| StateMachine ABI / EIP-712 | `0.8` | signed Plan commit、frozen metadata、permissionless relayer。 |
| IdentityRegistry ABI | `0.1` | 线下 subject 与钱包的薄身份绑定。 |
| DeploymentRegistry ABI | `0.2` | deployment cutover 与 canary 记录。 |
| Derived signal domain | `0.6` | Derived signal EIP-712 domain。 |
| Patch/Docking domains | `0.1` | executor/resource patch 与 docking。 |

Plan runtime identity 由 `publisher + hooksHash + metadataHash` 导出。Identity Registry 只记录 subject/account 绑定。Supplier capability、reputation、名称、标签、联系信息、搜索推荐和 workflow 状态由 Store 独立保存。Chain Services 的链上投影可重建。
