# Supplier Directory、能力与联系

Supplier Directory 是 Store 的链下工作台：维护 supplier 目录、名称、联系信息、能力标签、匹配特征和履约 proof。Identity Registry 只提供线下 subject 与钱包的对应，不能替 Store 证明能力。

## 两类标签

| 标签层 | 谁维护 | 含义 | 权威边界 |
| --- | --- | --- | --- |
| 凝结核内部标签 | 凝结核 / 秩序组织者 | 某 supplier 适合某 stage、role slot、resource/evidence 类型。 | 能力判断由凝结核负责，signal authorization 在 Order 中产生。 |
| Store 平台标签 | Store operator | catalog 分类、搜索、行业、风险、运营可见性。 | Store 自己承担解释和运营责任。 |
| Identity binding | Identity Registry owner | 线下 subject 对应哪个钱包。 | 不包含能力，也不创建订单权限。 |

Supplier “打标”分成不同层。Store 平台标签、凝结核内部标签、外部合规材料和订单授权分别展示。

## Supplier 信息层

| 层 | 内容 | 权威 |
| --- | --- | --- |
| Profile | display name、subject id、wallet、组织说明、metadata URI。 | Store metadata。 |
| Nucleus fit | 可服务的 Zhixu、stage、role slot、resource/evidence 类型。 | 凝结核组织语义。 |
| Platform capability | logistics、customs、inspection、payment、dispute-review、document-verification 等 catalog tags。 | Store metadata + audit。 |
| Contact | 联系人、通知渠道、负责人、可用时段、SLA、operational notes。 | Store metadata；不进链上明文。 |
| Identity | active/revoked/not_found、Registry、binding proof。 | `UVPIdentityRegistry` projection。 |
| Participation | recent orders、open tasks、historical proof。 | `UVPStateMachine` / Product projection。 |
| Docking | peer Zhixu subject、supported signalMap、adapter endpoints、sandbox sessions。 | Store workflow + proof；身份绑定看 Identity Registry。 |

## 供应商组织路径

```text
凝结核定义 supplier requirements
  -> Store 记录 supplier profile / contact / platform tags
  -> 凝结核把 supplier 组织进某些 stage 或 role slots
  -> Store 线下核验身份材料
  -> Registry owner register identity binding
  -> indexed IdentityBindingRegistered
  -> 订单注册时写入 signal authorization
  -> 履约 proof 反哺 supplier passport
```

这里的每一步权威不同。凝结核组织内部候选；Store 维护平台目录和 audit；Identity Registry 解析 subject/wallet；当前订单是否可提交 signal 仍由 `UVPStateMachine` 授权决定。

## Capability Passport

Capability passport 先展示身份、能力资料、可用阶段和 proof，再展示联系人和通知配置。

| 区块 | 内容 |
| --- | --- |
| Identity | subject id、wallet、display name、legal/organization notes、metadata URI。 |
| Nucleus usage | 被哪些凝结核组织进哪些 Zhixu、stage、role slot。 |
| Capability | 可承接 stage、resource/evidence 类型、支持的 Product task intent、是否可做 selector。 |
| Identity | Registry、binding status、revocation reason、proof rows。 |
| Operations | 联系人、通知渠道、SLA、可用区域、工作时间、升级路径。 |
| Runtime | open tasks、recent orders、failure/timeout history、active executor records。 |
| Docking | 如果 supplierType 是 `zhixu`，展示 peer Zhixu Plan 发布、signalMap 模板、docking sandbox 历史。 |

## Store admin 展示口径

- 凝结核决定某个 supplier 如何进入内部环节。
- Identity Registry 只判定当前目录如何把 subject 解析到钱包。
- 平台 capability tag 用作目录、搜索和匹配，由 Store 对其解释与维护负责。
- 联系人或通知成功用作 operational workflow；履约完成看 signal/proof。
- supplier profile 用作能力材料；当前订单提交权限看 signal authorization。

## 作为 Zhixu Supplier

当 supplier 的 `supplierType=zhixu` 时，它表示一条可被其他秩序调用的 peer 秩序能力。Store 要展示接入材料和 proof：

- peer Zhixu 的凝结核与 active Plan version；
- 可接受的local stage 输入；
- 输出 `str/cmp/err` signalMap；
- linked order 创建或定位方式；
- `DockedOrderLinked`、`DockedSignalMapped`、`DockedSignalSubmitted` proof；
- proof bridge 规则；
- 历史 docking 履约记录。

local order 必须在 order registration、后续授权路径或 docking 事件路径中明确允许 mapped signal 推进。
