# Signal Authorization

Order-level signal authorization answers one very specific question: for this order, which wallet may submit which source / signal.

## Contract Authorization Structure

When an order is triggered, `SignalAuthorization[]` is carried by the signed trigger-order request:

```solidity
struct SignalAuthorization {
    bytes32 sourceId;
    bytes32 signalId;
    address submitter;
    bytes32 role;
    bytes32 metadataHash;
}
```

The contract stores it as:

```text
_signalAuthorizations[orderId][signalKey][submitter]
```

When a signal is submitted, the contract checks whether `orderId + signalKey + submitter` has authorization.

## Product Authorization Builder

`ProductAuthorizationBuilder` in the Product BFF converts the product-side `orderPermissionTable` and participant list into contract authorization. It validates:

- The permission table shape is correct.
- The required participant exists.
- Participant IDs are not duplicated.
- The role slot and stage exist.
- The participant has accepted and has a wallet address.
- The initial trigger permission exists.

Common hashes:

```text
sourceId = keccak256(entry.source)
signalId = keccak256(entry.signalName)
role = keccak256("role:" + roleSlotId)
metadataHash = keccak256("uvp:product-bff:authorization:v3:...")
```

## Initial Trigger

The Product BFF prepares system authorization for order startup:

```text
sourceId = keccak256("")
signalId = keccak256("OUTSIDE")
submitter = registrar address
```

This authorization is used for the registrar to trigger the order’s initial path. It does not give the backend all business-action permissions.

If a docked Zhixu link stage uses `::OUTSIDE` as its entry signal, it must follow the same order-level authorization boundary: only an authorized wallet can submit the `OUTSIDE` signal on the empty source. The later `str/cmp/err` mapping for a linked order still follows `signalMap`, docking links, and mapped signal authorization checks.

## Authorization and Task Display

Projections may assign task assignees based on authorization, but that is only a product view. When the contract actually accepts a submission, it checks authorization again, so a service-layer display mistake cannot cross the protocol boundary.
