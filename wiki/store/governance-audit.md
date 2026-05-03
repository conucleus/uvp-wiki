# Operator 权限、治理与 Audit

Store 里的权限和 audit 约束平台 workflow。Audit 记录证明某个 Store 操作发生过；凝结核的秩序设计、trust-domain 背书和 state-machine 事件仍各自保留权威来源。

## 三类权限

| 权限域 | 例子 | 边界 |
| --- | --- | --- |
| 凝结核工作台权限 | 导入 Zhixu、维护设计材料、组织 supplier requirements、提交发布材料。 | 不自动获得 trust attestation 或 order signal authorization。 |
| Store 平台权限 | review、catalog tag、visibility、attestation request、revocation request、audit export。 | 不替凝结核设计内部规则，不判定链上 trust。 |
| 链上业务权限 | register order、submit signal、stage patch、resource patch。 | 由合约、EIP-712、order authorization 和 active overlay 决定。 |

## 敏感动作

- draft import、compile preview、Product Schema save；
- design/fairness/material review；
- change platform catalog tags、risk label、visibility、active recommendation；
- create/update supplier profile、contact metadata、platform capability tags；
- save docking session、approve signalMap review material；
- request plan/supplier attestation or revocation；
- inspect failed governance broadcast or index state；
- mark revoked plan/supplier as hidden from new-order creation。

这些动作可以被审计；chain attestation、supplier trust 和业务完成分别来自 registry 或 state-machine 事件。

## 权限和确认

Store 应区分 read、nucleation_operator、operator、reviewer、governance_admin、auditor 等能力。敏感动作需要明确确认对象，例如 Nucleation ID、Draft ID、Plan ID、Plan Hash、Supplier subject、revocation reason。

| 能力 | 可做什么 |
| --- | --- |
| read | 搜索、查看 proof、查看 public metadata。 |
| nucleation_operator | 维护自己凝结核下的 draft、设计材料、supplier requirements。 |
| operator | 编辑平台 metadata、supplier profile、contact、docking sandbox。 |
| reviewer | review 发布材料、capability 材料、fairness/透明性材料。 |
| governance_admin | 发起或确认 attestation/revocation request。 |
| auditor | 查看 audit trail、导出 review/proof 包。 |

## Audit 边界

| Audit 能证明 | Audit 边界 |
| --- | --- |
| 某个 Store principal 发起、审批或确认了一个 workflow 动作。 | plan 已经 attested。 |
| 某个 metadata 字段、platform tag 或 contact 被修改。 | supplier 已经 trusted。 |
| 某个凝结核提交了设计材料或发布材料。 | trust domain 已认可其公平性。 |
| 某个 governance request 被创建或广播尝试。 | tx 已经被链接受并 index。 |
| 某个 docking session 被保存或 review。 | linked order proof 已经映射到 local order。 |

Public claim 只有在对应链事件被观察到后才成立。

## Audit 行应包含什么

- actor、role、session id；
- object type 和 object id；
- nucleation id、draft id、plan id、supplier subject 等关键引用；
- before/after hash 或字段摘要；
- reason、review note、fairness/material checklist reference；
- related tx hash、governance request id 或 proof reference；
- createdAt、broadcastAt、indexedAt；
- failure reason 和 retry count。
