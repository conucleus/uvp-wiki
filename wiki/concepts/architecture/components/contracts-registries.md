# Contracts 与 Registries

链上事实层由 `UVPStateMachine`、冻结的功能 modules、`UVPIdentityRegistry` 和 `UVPDeploymentRegistry` 组成。Store 与 Chain Services 可以索引和解释这些事实，但不能改写它们。

## UVPStateMachine 与 modules

- publisher 签名提交 Plan，任意 relayer 广播。
- hooks 与 metadata hash 在 commit 时绑定，metadata 在 finalize 时一次冻结。
- 只允许 finalized Plan 创建 Order。
- creator/submitter 签名产生订单级权利；relayer 不需要 allowlist。
- Signal、HookReady、stage patch、resource patch、docking 与 derived signal 都留下可重放事件。
- 六个 module 配置完成后永久冻结地址。

## UVPIdentityRegistry

Registry 由 Store 运营，记录 `subjectId <-> account` 的带 hash/URI 身份绑定及撤销历史。它不认证 Plan，不记录 capability/reputation，也不是 StateMachine 准入条件。代码支持多个 Registry 地址，首期部署一个。

## UVPDeploymentRegistry

Deployment Registry 记录 StateMachine 部署的 Candidate、Canary、Active、Deprecated、Retired cutover 线索。它不能修改已部署合约，只告诉观察者当前产品选择哪个 deployment。

## 中心化与去中心化

中心化存在于 Store 的身份核验、名称展示、目录、标签、推荐、合规运营和默认 deployment 选择。去中心化体现在：任何人可读取和重放事件、任何 relayer 可广播有效签名、用户可绕过 Store 直接使用钱包地址、冻结合约不能被 Store 后台静默改写。信任来自可验证签名和不可变记录，而不是声称“没有运营者”。
