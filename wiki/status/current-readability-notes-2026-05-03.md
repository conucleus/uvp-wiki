# 当前 Wiki 阅读门槛记录

日期：2026-05-03

实施说明：本记录对应英文版同名记录，保留为中等重排前后的阅读门槛背景。当前中文导航、首页、角色地图、证据路径和术语表已经吸收其中一部分整改项。

范围：只阅读并整理 `uvp-wiki/` 下的文档；不阅读协议、服务、前端或部署实现代码。

读者视角：有较强业务和软件常识，但第一次接触 UVP，只靠 Wiki 学习系统。

## 总体判断

Wiki 已经从“工程模块目录”向“读者理解路径”移动：现在有首页、一个订单故事、角色地图、证据与 proof 路径、术语表、Store/Product/执行/工程组件分层入口。

剩余门槛主要是抽象密度高。新读者会同时遇到 Zhixu、Nucleation、Plan、Order、Source、Signal、Hook、Trigger、Trust Domain、Attestation、Authorization、Product DTO、Stage Overlay、signalMap、Docking、Periphery 等术语。第一遍阅读应先稳定在一条具体业务订单、一张角色图和一条事件路径上，第二遍再进入 compiler、contracts、DTO 和 release details。

## 仍需注意的问题

1. 首页必须保持对外宣传和 SEO 入口属性。学习路径应该在首页之后，而不是把首页改成纯 getting started。
2. Nucleation 仍然需要反复给现实身份例子，例如“某采购团队拥有跨境采购 Zhixu，维护版本并组织 supplier slots”。
3. Trust Domain 要清楚解释 official domain、多个 domain、Store workflow approval 和 registry attestation 的区别。
4. Source 先用跨境订单解释，再把石油分馏、农产品收购放到进阶例子。
5. Hook 第一段要直接说明它不是 webhook。
6. Trigger 第一读法应是“把 ready condition 变成可执行任务”。
7. Evidence、payloadHash、metadataURI、signed Signal、`SignalSubmitted`、Product proof row 必须放在同一条路径里讲。
8. 读者侧统一说“可重建服务层：Chain Services”；`non-trusted execution layer` 只作为协议别名说明“不是事实源”，不是“不可靠”。
9. Docked Zhixu 和 signalMap 很重要，但应作为进阶组合，不要抢走基础 Order 路径。
10. Project Status 对工程和 release owner 有用，但不应成为新读者默认第一步。

## 推荐维护顺序

1. 保持首页负责“为什么 UVP 存在、解决什么问题、读者该去哪”。
2. 新人路径维持：一个订单故事 -> 角色地图 -> 证据与 Proof 路径 -> 术语表 -> 核心概念。
3. Store/Product 页面继续用操作故事和权威边界解释产品价值。
4. 工程组件页面统一解释 public interface、事实源、可重建投影和 release evidence。
5. 修改 ABI、event、EIP-712、canonical hash、DTO、API 或 release claim 时，同步检查 public interface 和文档 drift。
