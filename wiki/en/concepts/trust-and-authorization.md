# Identity, publication, and authorization

UVP separates three facts that must not imply one another:

| Layer | Fact or right | Source | Revocability |
| --- | --- | --- | --- |
| Identity Registry | Default Store-directory identity resolution. | A binding written by the registry owner. | The owner may revoke the directory binding, not erase history or control the account. |
| Plan publication | Publication of an immutable hooks + metadata Plan. | The publisher's EIP-712 signature. | A relayer cannot alter it; frozen modules cannot be silently replaced. |
| Order and Signal actions | Creation of an Order or submission of a specific Signal. | Participant signatures and order-level authorization. | Registry revocation does not retroactively remove these rights. |

Plan and Order transactions may be broadcast by any relayer. A relayer pays gas and transports signed data; it is not the source of publisher, creator, or submitter authority.

Store capability tags and private matching features are commercial metadata. They are not written to `UVPIdentityRegistry` and do not become `SignalSubmitterAuthorized` permissions.
