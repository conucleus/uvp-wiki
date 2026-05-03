# Supplier Registry、能力与联系

Supplier Registry 是凝结核组织供应商网络的工作台，也是 Store 平台维护 supplier 目录、联系信息、履约 proof 和背书请求材料的地方。Supplier 的协议对象定义见核心概念里的 Supplier；本页只讲 Store 侧面。

## 两类标签

| 标签层 | 谁维护 | 含义 | 不能替代 |
| --- | --- | --- | --- |
| 凝结核内部标签 | 凝结核 / 秩序组织者 | 某 supplier 适合某 stage、role slot、resource/evidence 类型。 | 不自动创建 trust，不自动授权 signal。 |
| Store 平台标签 | Store operator | catalog 分类、搜索、行业、风险、运营可见性。 | 不等于 trust-domain 背书。 |
| Trust attestation | trust domain | supplier subject 是否被背书。 | 不等于当前订单提交权限。 |

文档里写 supplier “打标”时必须说明是哪一层标签。不要把 Store 平台标签写成凝结核内部治理，也不要把任何标签写成链上授权。

## Supplier 信息层

| 层 | 内容 | 权威 |
| --- | --- | --- |
| Profile | display name、subject id、wallet、组织说明、metadata URI。 | Store metadata。 |
| Nucleation fit | 可服务的 Zhixu、stage、role slot、resource/evidence 类型。 | 凝结核组织语义。 |
| Platform capability | logistics、customs、inspection、payment、dispute-review、document-verification 等 catalog tags。 | Store metadata + audit。 |
| Contact | 联系人、通知渠道、负责人、可用时段、SLA、operational notes。 | Store metadata；不进链上明文。 |
| Trust | attested/revoked/not_found、domains、proof rows。 | `ZhixuTrustRegistry` projection。 |
| Participation | recent orders、open tasks、historical proof。 | `UVPStateMachine` / Product projection。 |
| Docking | peer Zhixu subject、supported signalMap、adapter endpoints、sandbox sessions。 | Store workflow + proof；trust 仍看 registry。 |

## 供应商组织路径

```text
凝结核定义 supplier requirements
  -> Store 记录 supplier profile / contact / platform tags
  -> 凝结核把 supplier 组织进某些 stage 或 role slots
  -> Store workflow review 背书材料
  -> governance admin request supplier attestation
  -> indexed SupplierAttested
  -> 订单注册时写入 signal authorization
  -> 履约 proof 反哺 supplier passport
```

这里的每一步权威不同。凝结核可以组织供应商网络；Store 可以维护平台目录和 audit；trust domain 可以背书 supplier subject；当前订单能不能提交 signal 仍由 `UVPStateMachine` 授权决定。

## Capability Passport

Supplier 页面应该像 capability passport，而不是普通联系人表。

| 区块 | 内容 |
| --- | --- |
| Identity | subject id、wallet、display name、legal/organization notes、metadata URI。 |
| Nucleation usage | 被哪些凝结核组织进哪些 Zhixu、stage、role slot。 |
| Capability | 可承接 stage、resource/evidence 类型、支持的 Product task intent、是否可做 selector。 |
| Trust | trust domain、attestation status、revocation reason、proof rows。 |
| Operations | 联系人、通知渠道、SLA、可用区域、工作时间、升级路径。 |
| Runtime | open tasks、recent orders、failure/timeout history、active executor records。 |
| Docking | 如果 supplierType 是 `zhixu`，展示 peer Zhixu plan trust、signalMap 模板、docking sandbox 历史。 |

## Store admin 不做什么

- 不替凝结核决定某个 supplier 必须参与某个内部环节。
- 不替 trust domain 判定 supplier 已经可信。
- 不把平台 capability tag 写成 `SupplierAttested`。
- 不把联系人或通知成功写成履约完成。
- 不把 supplier profile 写成当前订单的 signal authorization。

## 作为 Zhixu Supplier

当 supplier 的 `supplierType=zhixu` 时，它表示一条可被其他秩序调用的 peer Zhixu 能力。Store 要展示的是接入材料，而不是替 peer Zhixu 治理内部流程：

- peer Zhixu 的凝结核、active plan version 和 plan trust；
- 可接受的local stage 输入；
- 输出 `str/cmp/err` signalMap；
- linked order创建或定位方式；
- proof bridge 规则；
- 历史 docking 履约记录。

这类 supplier 仍然不能自己获得local order提交权。local order必须在 order registration 或后续授权路径中明确允许某个 submitter 提交映射 signal。
