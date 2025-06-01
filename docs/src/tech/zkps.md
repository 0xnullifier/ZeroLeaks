# Zero-Knowledge Proofs and ZK Email

## What are Zero-Knowledge Proofs?

Imagine you want to prove you know a secret password without actually revealing the password itself. Zero-Knowledge Proofs (ZKPs) make this possible! They are a cryptographic method that allows one party (the "prover") to prove to another party (the "verifier") that they know a value or that a statement is true, without revealing any information beyond the validity of the statement itself.

### A Simple Analogy

Think of ZKPs like a magic trick where:

- **The Secret**: You know which card someone picked from a deck
- **The Proof**: You can prove you know their card without looking at it or telling them what it is
- **The Verification**: They can verify you're telling the truth without you revealing the card

In the digital world, ZKPs work similarly but with mathematical guarantees instead of magic.

## How ZeroLeaks Uses ZK Email

ZeroLeaks leverages a specialized application of zero-knowledge proofs called **ZK Email** to verify the authenticity of leaked documents while protecting the whistleblower's identity.

### The Email Authentication Problem

When someone receives an email from an organization (like a company or government agency), that email contains cryptographic signatures that prove:

- The email actually came from that organization's domain
- The email content hasn't been tampered with
- The timestamp is accurate

However, traditional email verification requires revealing:

- The recipient's email address
- The full email content
- Potentially identifying metadata

### ZK Email Solution

ZK Email allows whistleblowers to prove they received a legitimate email from a specific domain (like `@company.com`) without revealing:

- Their own email address
- The sender's specific email address
- The full content of the email
- Any other identifying information

### How It Works in ZeroLeaks

1. **Email Analysis**: The whistleblower's email client analyzes the email's cryptographic signatures (DKIM signatures)

2. **Circuit Generation**: A zero-knowledge circuit processes the email data and generates a proof that confirms:
   - The email came from the claimed domain
   - The email content matches certain criteria (without revealing what that content is)
   - The email is authentic and unmodified

3. **Proof Creation**: The system generates a mathematical proof that can be verified by anyone

4. **Public Verification**: Anyone can verify this proof on the blockchain without learning anything about the original email or its recipient

## Technical Implementation

### DKIM Verification

Every legitimate email contains a DKIM (DomainKeys Identified Mail) signature that:

- Uses cryptographic signatures to verify the sender's domain
- Ensures email content hasn't been modified
- Provides a mathematical foundation for our zero-knowledge proofs

### Circom Circuits

ZeroLeaks uses Circom (a domain-specific language for zero-knowledge circuits) to create proofs. Our circuits verify:

```
Email Authentication = DKIM Signature Verification + Content Verification + Domain Verification
```

### Groth16 Proof System

We use the Groth16 proving system because it provides:

- **Succinct proofs**: Very small proof size (just a few hundred bytes)
- **Fast verification**: Proofs can be verified quickly on the blockchain
- **Strong security**: Mathematically guaranteed privacy and correctness

## Benefits for Whistleblowers

### Complete Anonymity

- No need to reveal your identity to prove document authenticity
- Protection from retaliation while maintaining credibility
- Mathematical guarantees that your privacy is preserved

### Verifiable Authenticity

- Anyone can verify your claims are genuine
- Impossible to fake proofs without access to real emails
- Builds trust in leaked information

### Censorship Resistance

- Proofs are stored on the blockchain and cannot be deleted
- No central authority can suppress verified information
- Global access to verification

## Security Guarantees

Zero-knowledge proofs provide three fundamental guarantees:

1. **Completeness**: If the statement is true, an honest prover can always convince an honest verifier
2. **Soundness**: If the statement is false, no prover can convince an honest verifier (except with negligible probability)
3. **Zero-Knowledge**: If the statement is true, the verifier learns nothing beyond this fact

This means that ZeroLeaks can guarantee both the authenticity of leaks and the privacy of sources with mathematical certainty.

## Real-World Impact

By combining the power of zero-knowledge proofs with email authentication, ZeroLeaks creates a new paradigm for whistleblowing where:

- Sources can safely expose wrongdoing without fear
- Journalists can verify information with confidence  
- The public can trust in the authenticity of leaked documents
- Organizations cannot deny legitimate communications

This technology transforms whistleblowing from a high-risk, low-trust activity into a secure, verifiable process that protects democracy and accountability.
