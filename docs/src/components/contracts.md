# Smart Contracts

ZeroLeaks leverages three main smart contracts written in Move language on the Sui blockchain to handle verification, governance, and tokenomics. This section provides detailed documentation of each contract's functionality and design.

## Contract Overview

### 1. Verifier Contract (`contracts.move`)

The verifier contract is responsible for validating zero-knowledge proofs and storing verified leak information on the blockchain.

#### Core Structures

**Verification Key (Vk)**

```move
public struct Vk has key, store {
    id: UID,
    pvk: vector<u8>,    // Prepared verification key
    admin: address,     // Contract administrator
}
```

**Leak Information (Info)**

```move
public struct Info has copy, drop, store {
    content: String,    // Description of the leak
    blob_id: String,    // Walrus storage identifier
}
```

**Leaks Collection (Leaks)**

```move
public struct Leaks has key, store {
    id: UID,
    info: vector<Info>  // Collection of all verified leaks
}
```

#### Key Functions

**new_leak()**

```move
public fun new_leak(
    blob_id: String,
    content_to_verify: String,
    leak: &mut Leaks,
    vk: &Vk,
    proof_points_bytes: vector<u8>,
    public_inputs: vector<u8>,
    _ctx: &mut TxContext 
)
```

This function performs the core verification process:

1. **Proof Preparation**: Converts the verification key into a format suitable for verification
2. **Proof Parsing**: Deserializes the proof points from bytes
3. **Input Processing**: Converts public inputs from bytes
4. **Verification**: Uses Groth16 verification to validate the proof
5. **Storage**: If verification succeeds, adds the leak info to the collection

**get_info()**

```move
public fun get_info(leak: &Leaks): vector<Info>
```

Provides read-only access to all verified leaks, enabling transparency and public verification.

**Administrative Functions**

- `create_vk()`: Creates a new verification key object
- `set_new_vk()`: Updates the verification key (admin only)

### 2. DAO Contract (`dao.move`)

The DAO contract implements decentralized governance for the ZeroLeaks platform, managing allowlists, proposals, and voting mechanisms.

#### Core Structures

**Allowlist**

```move
public struct Allowlist has key, store {
    id: UID,
    name: String,
    list: vector<address>,  // Approved addresses
}
```

**DAO**

```move
public struct Dao has key {
    id: UID,
    proposals: vector<Proposal>,
    treasury_cap: TreasuryCap<ZL>,  // Token treasury management
}
```

**Proposal**

```move
public struct Proposal has key, store {
    id: UID,
    description: String,
    target: address,        // Address to add/remove
    action_add: bool,       // True for add, false for remove
    votes_for: u64,
    votes_against: u64,
    voted: vector<address>, // Addresses that have voted
    executed: bool,
}
```

#### Governance Features

**Allowlist Management**

- Create specialized allowlists for different access levels
- Manage permissions for sensitive document access
- Democratic control over platform access

**Proposal System**

- Submit proposals to modify allowlists
- Vote on proposals using LZ tokens
- Automatic execution of approved proposals

**Treasury Management**

- Control over LZ token minting and burning
- Community-controlled fund allocation
- Transparent financial governance

### 3. Token Contract (`lz_coin.move`)

The LZ token contract implements the platform's native governance and utility token.

#### Key Features

**Standard Coin Implementation**

- Built on Sui's native coin framework
- Supports standard token operations (transfer, burn, mint)
- Integrates with Sui wallet ecosystem

**Governance Integration**

- Tokens used for DAO voting power
- Staking mechanisms for enhanced participation
- Incentive distribution for platform contributions

**Economic Controls**

- Controlled inflation through DAO governance
- Fee burning mechanisms for deflationary pressure
- Treasury management for sustainable development

## Technical Implementation Details

### Zero-Knowledge Proof Verification

The verifier contract uses Sui's native Groth16 implementation:

```move
let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk.pvk);
let proof_points = groth16::proof_points_from_bytes(proof_points_bytes);
let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs);
assert!(groth16::verify_groth16_proof(&groth16::bn254(), &pvk, &public_inputs, &proof_points));
```

This process ensures:

- **Mathematical Certainty**: Cryptographic guarantees of proof validity
- **Efficient Verification**: Fast on-chain validation
- **Standard Compliance**: Uses established cryptographic primitives
- **Gas Optimization**: Minimal computational overhead

### Storage Architecture

**Shared Objects**

- Leaks collection is a shared object accessible to all users
- Allows concurrent read access for transparency
- Mutable only through verified proof submission

**Object Linking**

- Verification key objects linked to specific circuits
- Allowlist objects provide fine-grained access control
- Proposal objects track governance state

**Data Integrity**

- All modifications require cryptographic proofs
- Immutable audit trail on blockchain
- Transparent verification process

### Security Considerations

**Access Control**

- Administrative functions protected by sender verification
- Allowlist membership required for restricted operations
- Multi-signature capabilities through DAO governance

**Proof Validation**

- All submissions require valid zero-knowledge proofs
- Public inputs verified against expected format
- Circuit-specific verification keys prevent proof reuse

**Economic Security**

- Token staking aligns incentives with platform security
- Slashing mechanisms punish malicious behavior
- Treasury controls prevent unauthorized fund access

## Integration with Other Components

### Frontend Integration

**Proof Submission Flow**

1. User generates proof client-side using circuits
2. Proof and public inputs serialized for blockchain submission
3. Frontend calls `new_leak()` function with proof data
4. Smart contract verifies and stores if valid

**DAO Interaction**

1. Token holders can submit governance proposals
2. Voting interface connects to DAO contract functions
3. Real-time proposal status updates from blockchain
4. Automatic execution of approved proposals

### Storage Integration

**Walrus Connection**

- Contract stores Walrus blob IDs for document references
- Immutable links between proofs and encrypted documents
- Verification trail for document authenticity

**Content Addressing**

- Cryptographic hashes ensure document integrity
- Tamper-evident references to stored documents
- Decentralized storage with blockchain verification

### Circuit Integration

**Verification Key Management**

- Contracts store verification keys for specific circuits
- Support for circuit upgrades through governance
- Version control for cryptographic parameters

**Proof Format Compatibility**

- Standardized proof serialization format
- Compatible with Circom-generated proofs
- Cross-platform verification support

## Deployment and Upgrade Patterns

### Initial Deployment

**Genesis Setup**

1. Deploy contracts with initial parameters
2. Set up verification keys for circuits
3. Initialize DAO with founding members
4. Distribute initial token allocation

### Upgrade Mechanisms

**Governance-Controlled Upgrades**

- Major contract changes require DAO approval
- Gradual migration strategies for breaking changes
- Backward compatibility where possible

**Emergency Procedures**

- Admin functions for critical security fixes
- Time-locked upgrades for transparency
- Community override mechanisms

### Monitoring and Maintenance

**Event Emission**

- Contracts emit events for all major operations
- Frontend and indexing services track contract state
- Real-time monitoring of platform health

**Gas Optimization**

- Efficient data structures minimize transaction costs
- Batch operations where possible
- Optimized verification algorithms

This smart contract architecture provides the foundational infrastructure for ZeroLeaks' secure, transparent, and decentralized operation while maintaining the flexibility needed for platform evolution.
