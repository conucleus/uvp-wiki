# 凝结核工作台

凝结核工作台服务于秩序设计者和组织者。它提供 Zhixu 草稿、编译预览、供应商目录、资源配置、版本发布材料、proof 与 audit。

| 参与者 | 身份与权利 | 权利来源 |
| --- | --- | --- |
| 凝结核 | 设计 Zhixu、组织候选供应商、维护秩序材料。 | 凝结核内部治理与 Store workspace 权限。 |
| Store operator/reviewer | 维护目录、审核资料、设置可见性和推荐。 | Store 机构规则与访问控制。 |
| Publisher | 签名发布 Plan。 | StateMachine publisher 权限与 EIP-712 签名。 |
| Registry operator | 核验线下主体并登记 subject/account。 | Identity Registry owner 权限。 |
| Order participant | 接受订单角色并提交被授权的 Signal。 | 订单级授权、active executor overlay 与签名。 |

Store 中的能力标签、排序特征和匹配历史是链下商业资料。Identity Registry 提供公开身份解析。StateMachine 保存 Plan、Order、Signal、HookReady、patch 和 docking 事实。
