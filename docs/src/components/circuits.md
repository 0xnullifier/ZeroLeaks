# Zero-Knowledge Circuits

ZeroLeaks employs sophisticated zero-knowledge circuits built with Circom to verify email authenticity and document integrity while preserving privacy. This section provides an in-depth analysis of our circuit architecture and implementation.

## Circuit Overview

The ZeroLeaks circuit system consists of three main components that work together to provide comprehensive email verification:

1. **Email Content Circuit** - Verifies email content and DKIM signatures
2. **Merkle Tree Circuits** - Handles document collections and batch verification
3. **Helper Circuits** - Utility functions for data processing

## Email Content Circuit (`email_content.circom`)

### Purpose and Functionality

The email content circuit is the core component that verifies email authenticity while maintaining sender/receiver privacy. It proves that:

- An email was received from a specific domain
- The email contains certain content patterns
- The DKIM signature is cryptographically valid
- The verification doesn't reveal sender or receiver identities

### Circuit Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Email Input   │    │  DKIM Verification │    │ Content Extraction│
│                 │───▶│                  │───▶│                 │
│ - Headers       │    │ - RSA Signature  │    │ - Pattern Match │
│ - Body          │    │ - Hash Validation│    │ - Domain Check  │
│ - DKIM Sig      │    │ - Key Verification│   │ - Output Hash   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

#### 1. Email Verification Module

```circom
template EmailVerifier(max_header_bytes, max_body_bytes, n, k, ignore_body_hash_check) {
    // Inherits from @zk-email/circuits/email-verifier.circom
    // Validates DKIM signatures and email structure
}
```

**Parameters:**

- `max_header_bytes`: Maximum size of email headers (typically 1024)
- `max_body_bytes`: Maximum size of email body (typically 8192)
- `n`: RSA key size parameter (2048-bit RSA)
- `k`: Number of chunks for RSA verification
- `ignore_body_hash_check`: Whether to skip body hash validation

#### 2. Content Pattern Matching

```circom
template IsInArray(n) {
    signal input val;
    signal input arr[n];
    
    // Checks if a value exists in an array
    // Used for domain verification and content patterns
}
```

This template enables verification of specific content patterns without revealing the actual content.

#### 3. Domain Verification

```circom
template FromAddrRegex(msg_bytes) {
    // Extracts and verifies sender domain
    // Ensures email came from expected organization
}
```

### Circuit Flow Diagram

```
Email Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                DKIM Signature Verification               │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │Extract DKIM │  │   Verify    │  │   Validate  │     │
│  │ Headers     │─▶│ RSA Signature│─▶│   Hash      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                 Content Verification                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Extract   │  │   Pattern   │  │   Domain    │     │
│  │  Content    │─▶│   Matching  │─▶│ Verification│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    Output Generation                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Create    │  │   Generate  │  │   Merkle    │     │
│  │   Hash      │─▶│   Proof     │─▶│   Root      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Public and Private Inputs

#### Private Inputs (Witness)

- Complete email headers and body
- DKIM signature components
- RSA private key components (for signature verification)
- Content to be verified

#### Public Inputs

- Domain hash (identifies sender organization)
- Content pattern hash (proves specific content exists)
- Email timestamp range
- Merkle root of document collection

### Security Properties

#### Zero-Knowledge Properties

1. **Completeness**: Valid emails with correct signatures always produce valid proofs
2. **Soundness**: Invalid emails or forged signatures cannot produce valid proofs
3. **Zero-Knowledge**: Verifiers learn nothing beyond the validity of public claims

#### Privacy Guarantees

- Email addresses remain completely private
- Email content is not revealed beyond proven patterns
- Timing information is generalized to prevent correlation
- No metadata leakage through proof generation

## Merkle Tree Circuits

### Simple Merkle Circuit (`simple_merkle.circom`)

Handles verification of document inclusion in collections:

```circom
template SimpleMerkle(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal output root;
    
    // Verifies that a leaf is included in a Merkle tree
    // without revealing the leaf's position or siblings
}
```

### Continuous Merkle Circuit (`continous_merkle.circom`)

Enables efficient batch processing of multiple documents:

```circom
template ContinuousMerkle(n_documents, depth) {
    signal input leaves[n_documents];
    signal input pathElements[n_documents][depth];
    signal input pathIndices[n_documents][depth];
    signal output root;
    
    // Verifies multiple documents belong to the same collection
    // Enables batch submission of related leaks
}
```

### Merkle Tree Architecture

```
                    Root Hash
                   /         \
              H(A,B)           H(C,D)
             /     \           /     \
         H(Doc1) H(Doc2)  H(Doc3) H(Doc4)
           |       |        |       |
         Doc1    Doc2     Doc3    Doc4
      (Email1) (Email2) (Email3) (Email4)
```

Each document in the tree represents a verified email, and the Merkle root provides a compact commitment to the entire collection.

## Circuit Compilation and Setup

### Trusted Setup Process

ZeroLeaks uses a Powers of Tau ceremony for the universal setup:

```bash
# Download universal setup parameters
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_23.ptau

# Compile circuit
circom email_content.circom --r1cs --wasm --sym

# Generate circuit-specific setup
snarkjs groth16 setup email_content.r1cs powersOfTau28_hez_final_23.ptau circuit_0000.zkey
```

### Key Generation

```bash
# Contribute to ceremony (adds randomness)
snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey

# Generate verification key
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
```

### Verification Key Format

The verification key contains:

```json
{
  "protocol": "groth16",
  "curve": "bn128",
  "nPublic": 4,
  "vk_alpha_1": [...],
  "vk_beta_2": [...],
  "vk_gamma_2": [...],
  "vk_delta_2": [...],
  "vk_alphabeta_12": [...],
  "IC": [...]
}
```

## Performance Characteristics

### Circuit Complexity

| Circuit Component | Constraints | Compile Time | Proof Time | Verification Time |
|-------------------|-------------|--------------|------------|-------------------|
| DKIM Verification | ~2M         | 5-10 min     | 30-60 sec  | <1 sec           |
| Content Matching  | ~100K       | 1-2 min      | 5-10 sec   | <1 sec           |
| Merkle Tree       | ~50K        | <1 min       | 2-5 sec    | <1 sec           |
| **Total**         | **~2.2M**   | **6-13 min** | **37-75 sec** | **<3 sec**    |

### Optimization Strategies

#### 1. Constraint Optimization

- Use efficient hash functions (Poseidon instead of SHA for internal operations)
- Minimize field operations through clever circuit design
- Batch verification where possible

#### 2. Proof Generation Optimization

- Client-side WASM compilation for browser execution
- WebWorker utilization for non-blocking UI
- Memory management for large circuits

#### 3. Verification Optimization

- Precomputed verification keys
- Batch verification of multiple proofs
- Efficient serialization formats

## Circuit Security Analysis

### Threat Model

#### 1. Malicious Prover Attacks

- **Forged Email**: Attacker tries to prove they received an email they didn't
- **Mitigation**: DKIM signature verification with RSA-2048 security
- **Protection Level**: Cryptographically secure

#### 2. Circuit Implementation Bugs

- **Logic Errors**: Bugs in circuit logic could allow invalid proofs
- **Mitigation**: Formal verification and extensive testing
- **Protection Level**: High confidence through audits

#### 3. Trusted Setup Compromise

- **Parameter Manipulation**: Compromised setup could enable proof forgery
- **Mitigation**: Multi-party ceremony with public verification
- **Protection Level**: Secure if at least one participant is honest

### Cryptographic Assumptions

#### 1. RSA-2048 Security

- DKIM signatures rely on RSA-2048 for authenticity
- Quantum threat consideration for future upgrades
- Current security horizon: 10-15 years

#### 2. Discrete Logarithm Problem

- Groth16 security based on elliptic curve discrete log
- BN254 curve provides ~128-bit security
- Quantum resistance timeline similar to RSA

#### 3. Hash Function Security

- SHA-256 for email content hashing
- Poseidon for in-circuit operations
- Collision resistance critical for security

## Integration with Frontend

### Proof Generation Workflow

```javascript
// 1. Parse email file
const emailData = parseEmailFile(emlFile);

// 2. Extract DKIM components
const dkimData = extractDKIMSignature(emailData);

// 3. Generate circuit inputs
const circuitInputs = {
    email_header: emailData.headers,
    email_body: emailData.body,
    rsa_signature: dkimData.signature,
    rsa_modulus: dkimData.publicKey,
    // ... other inputs
};

// 4. Generate proof
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    circuitInputs,
    "circuit.wasm",
    "circuit_final.zkey"
);

// 5. Submit to blockchain
await contract.new_leak(
    walrusBlobId,
    contentDescription,
    leaksObject,
    verificationKey,
    proof,
    publicSignals
);
```

### Error Handling

Common issues and solutions:

#### 1. Email Format Issues

```javascript
try {
    const emailData = parseEmailFile(emlFile);
} catch (error) {
    if (error.type === 'INVALID_FORMAT') {
        throw new Error('Email file format not supported');
    }
}
```

#### 2. DKIM Signature Problems

```javascript
const dkimResult = validateDKIMSignature(emailData);
if (!dkimResult.valid) {
    throw new Error(`DKIM validation failed: ${dkimResult.reason}`);
}
```

#### 3. Circuit Constraint Violations

```javascript
try {
    await snarkjs.groth16.fullProve(inputs, wasm, zkey);
} catch (error) {
    if (error.message.includes('constraint')) {
        throw new Error('Email content exceeds maximum size limits');
    }
}
```

This circuit architecture provides the cryptographic foundation that makes ZeroLeaks possible, enabling verifiable yet private document authentication that protects whistleblowers while ensuring the integrity of leaked information.
