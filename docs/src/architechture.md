# ZeroLeaks Architecture

## System Overview

ZeroLeaks employs a sophisticated multi-layered architecture that combines cutting-edge cryptographic technologies with blockchain infrastructure to create a secure, anonymous, and verifiable whistleblowing platform.

![ZeroLeaks Architecture](../image.png)

## Architecture Components

### 1. Client Layer

#### Web Frontend (React/TypeScript)

- **User Interface**: Intuitive web application for leak submission and browsing
- **Wallet Integration**: Seamless connection with Sui ecosystem wallets
- **Proof Generation**: Client-side zero-knowledge proof creation using WebAssembly
- **Document Upload**: Secure file handling with client-side encryption

#### Zero-Knowledge Circuits (Circom)

- **Email Verification**: Circom circuits that verify DKIM signatures
- **Content Proofs**: Prove specific content exists without revealing it
- **Domain Authentication**: Verify emails came from specific domains
- **Merkle Tree Verification**: Efficient verification of document collections

### 2. Blockchain Layer (Sui)

#### Smart Contracts (Move Language)

- **Verification Contract**: Validates zero-knowledge proofs on-chain
- **DAO Governance**: Manages community voting and decision-making
- **Token Management**: Handles LZ token distribution and staking
- **Access Control**: Manages permissions for sensitive documents

#### Key Contract Functions

**Proof Verification**

```move
public fun verify_proof(
    proof: vector<u8>,
    public_signals: vector<u256>,
    verification_key: &VerificationKey
): bool
```

**DAO Voting**

```move
public fun submit_proposal(
    ctx: &mut TxContext,
    title: String,
    description: String,
    execution_hash: vector<u8>
)
```

### 3. Storage Layer

#### Walrus Decentralized Storage

- **Document Storage**: Encrypted documents distributed across network nodes
- **Redundancy**: Multiple copies ensure availability and fault tolerance
- **Content Addressing**: Cryptographic hashes provide immutable references
- **Economic Incentives**: Token-based rewards for storage providers

#### Seal Encryption Protocol

- **Threshold Encryption**: Documents encrypted with distributed keys
- **Access Control**: Cryptographic keys managed by smart contracts
- **Forward Secrecy**: Key rotation protects historical documents
- **DAO Integration**: Community governance controls decryption

### 4. Backend Services

#### API Server (Node.js/TypeScript)

- **Document Indexing**: Searchable metadata for leaked documents
- **User Management**: Session handling and user preferences
- **Caching Layer**: Performance optimization for frequently accessed data
- **Webhook Integration**: Real-time updates from blockchain events

#### Circuit Compilation Services

- **Trusted Setup**: Generation of proving and verification keys
- **Circuit Optimization**: Performance tuning for zero-knowledge proofs
- **Key Management**: Secure distribution of circuit parameters
- **Version Control**: Management of circuit upgrades and compatibility

## Data Flow Architecture

### Leak Submission Process

1. **Email Upload**
   - User uploads .eml file through web interface
   - Client extracts DKIM signatures and email headers
   - Sensitive data never leaves user's browser

2. **Proof Generation**
   - Circom circuit processes email data locally
   - Zero-knowledge proof generated using WASM
   - Proof demonstrates email authenticity without revealing content

3. **Document Encryption**
   - Supporting documents encrypted using Seal protocol
   - Encryption keys distributed among DAO members
   - Encrypted data uploaded to Walrus network

4. **Blockchain Recording**
   - Proof submitted to Sui smart contract
   - Verification key validates proof on-chain
   - Transaction permanently records verification

5. **DAO Review**
   - Community votes on document access levels
   - Smart contracts automatically enforce decisions
   - Democratic governance ensures fair access

### Document Access Process

1. **Request Initiation**
   - User browses available leaks through web interface
   - Verification status displayed for each document
   - Access permissions checked against DAO decisions

2. **Permission Verification**
   - Smart contracts verify user's access rights
   - Token holdings and reputation considered
   - Time-locked releases automatically processed

3. **Decryption Process**
   - Threshold number of DAO members provide key shares
   - Seal protocol reconstructs decryption key
   - Documents decrypted and delivered to user

4. **Audit Trail**
   - All access attempts logged on blockchain
   - Transparent record of who accessed what
   - Prevents unauthorized or hidden access

## Security Architecture

### Zero-Knowledge Privacy

#### Proof System (Groth16)

- **Succinctness**: Proofs are only ~200 bytes regardless of computation size
- **Non-interactivity**: No communication required between prover and verifier
- **Zero-knowledge**: Verifier learns nothing beyond proof validity
- **Universal Composability**: Multiple proofs can be safely combined

#### Circuit Design

- **Email Authentication**: Verifies DKIM signatures without revealing content
- **Selective Disclosure**: Proves specific facts while hiding others
- **Batch Processing**: Multiple emails can be proven together efficiently
- **Privacy Preservation**: No metadata leakage during verification

### Blockchain Security

#### Smart Contract Security

- **Formal Verification**: Mathematical proofs of contract correctness
- **Audit Trail**: All operations permanently recorded
- **Upgrade Governance**: Community votes on security updates
- **Economic Security**: Staking mechanisms align incentives

#### Consensus Security

- **Sui Consensus**: Byzantine fault-tolerant consensus mechanism
- **Validator Network**: Distributed set of independent validators
- **Stake-Based Security**: Economic incentives prevent malicious behavior
- **Fast Finality**: Transactions confirmed within seconds

### Storage Security

#### Encryption Security

- **End-to-End Encryption**: Data encrypted before leaving user's device
- **Threshold Cryptography**: No single point of key compromise
- **Forward Secrecy**: Periodic key rotation protects historical data
- **Quantum Resistance**: Post-quantum cryptographic algorithms

#### Network Security

- **Distributed Storage**: No single point of failure
- **Redundancy**: Multiple copies across different nodes
- **Economic Incentives**: Rewards for honest storage provision
- **Slashing**: Penalties for malicious or unreliable behavior

## Scalability Considerations

### Horizontal Scaling

#### Client-Side Computation

- **Proof Generation**: CPU-intensive work done on user devices
- **Parallel Processing**: Multiple proofs can be generated simultaneously
- **Caching**: Frequently used circuit parameters cached locally
- **Progressive Loading**: Large documents processed in chunks

#### Blockchain Optimization

- **Sui Parallelism**: Independent transactions processed simultaneously
- **Object-Centric Model**: Efficient state management and updates
- **Move Language**: Memory-safe and gas-efficient smart contracts
- **Batch Operations**: Multiple operations combined into single transactions

### Vertical Scaling

#### Storage Optimization

- **Compression**: Documents compressed before encryption
- **Deduplication**: Identical files stored only once
- **Tiered Storage**: Frequently accessed data on faster nodes
- **Garbage Collection**: Automatic cleanup of unused data

#### Network Performance

- **CDN Integration**: Content delivery networks for static assets
- **Edge Computing**: Proof verification at edge nodes
- **Load Balancing**: Traffic distributed across multiple servers
- **Caching Strategies**: Multi-layer caching for optimal performance

## Integration Points

### External Services

#### Blockchain Infrastructure

- **RPC Endpoints**: Connection to Sui network nodes
- **Indexing Services**: Real-time blockchain data processing
- **Wallet Providers**: Integration with popular Sui wallets
- **Gas Optimization**: Efficient transaction submission strategies

#### Storage Infrastructure

- **Walrus Network**: Direct integration with storage protocol
- **IPFS Gateways**: Backup storage for critical metadata
- **CDN Services**: Fast content delivery worldwide
- **Backup Systems**: Redundant storage for disaster recovery

### Development Ecosystem

#### Developer Tools

- **SDK/APIs**: Easy integration for third-party developers
- **Documentation**: Comprehensive guides and references
- **Testing Frameworks**: Tools for contract and circuit testing
- **Monitoring**: Real-time system health and performance metrics

#### Community Integration

- **Governance Tools**: DAO voting and proposal systems
- **Forum Integration**: Community discussion platforms
- **Notification Systems**: Real-time alerts for important events
- **Analytics**: Platform usage and security metrics

This architecture ensures ZeroLeaks operates as a robust, secure, and scalable platform that protects whistleblowers while maintaining the integrity and accessibility of leaked information.
