# How to Use the Platform

## Getting Started with ZeroLeaks

ZeroLeaks provides a secure and anonymous way to submit and access leaked documents. This guide will walk you through both sides of the platform - submitting leaks and browsing verified information.

## For Whistleblowers: Submitting a Leak

### Step 1: Prepare Your Evidence

Before submitting to ZeroLeaks, ensure you have:

- **Email Evidence**: The original .eml file from your email client
- **Supporting Documents**: Any additional files that support your leak
- **Context Information**: A clear summary of why this information is important

#### Getting Your Email File (.eml)

Different email clients store emails differently. See our [Email Export Guide](./how_to_emls.md) for detailed instructions on:

- Gmail export procedures
- Outlook email extraction
- Apple Mail file location
- Thunderbird backup methods

### Step 2: Access the Platform

1. **Visit ZeroLeaks**: Navigate to the platform website
2. **Connect Wallet**: Use your Sui-compatible wallet (Sui Wallet, Martian, etc.)
3. **Navigate to Submit**: Click "Submit Leak" from the main menu

### Step 3: Upload Your Email

1. **Select Email File**: Choose your .eml file from your computer
2. **Verify Upload**: System will analyze the email structure
3. **Domain Verification**: Platform confirms the email domain is valid
4. **DKIM Check**: Automatic verification of email cryptographic signatures

**What Happens Behind the Scenes:**

- The system extracts DKIM signatures from your email
- Zero-knowledge circuits verify the email's authenticity
- No personal information is revealed during this process

### Step 4: Generate Zero-Knowledge Proof

1. **Proof Generation**: Click "Generate Proof" (this may take several minutes)
2. **Wait for Completion**: Do not close your browser during this process
3. **Proof Verification**: System confirms the proof is valid
4. **Anonymity Guarantee**: Your identity remains completely hidden

**Technical Note:** The proof generation happens entirely in your browser using WebAssembly. No sensitive data leaves your device during this process.

### Step 5: Add Supporting Documents

1. **Upload Additional Files**: Add any supporting documents
2. **Document Encryption**: Files are automatically encrypted before storage
3. **Storage on Walrus**: Encrypted files are distributed across the network
4. **Access Control**: Set who can access these documents initially

### Step 6: Write Your Article

1. **Provide Context**: Write a clear summary of your leak
2. **Explain Significance**: Help readers understand why this matters
3. **Protect Privacy**: Avoid including identifying information
4. **Review Content**: Ensure accuracy and completeness

### Step 7: Submit for Verification

1. **Review Submission**: Double-check all information
2. **Pay Gas Fees**: Small transaction fee for blockchain recording
3. **Submit to Blockchain**: Your proof is permanently recorded
4. **Await DAO Review**: Community will vote on document access

## For Researchers and Journalists: Browsing Leaks

### Accessing Verified Information

1. **Browse Categories**: Leaks are organized by topic and source type
2. **Search Function**: Use keywords to find specific information
3. **Verification Status**: All leaks show their verification status
4. **Proof Verification**: Anyone can independently verify proofs

### Understanding Verification Levels

#### ✅ Fully Verified

- Zero-knowledge proof successfully validated
- Email signatures cryptographically confirmed
- Documents authenticated on blockchain

#### ⏳ Under Review

- Proof submitted but awaiting DAO vote
- Preliminary verification completed
- Access may be restricted pending community decision

#### 🔒 DAO Restricted

- Community has voted to restrict access
- May require special permissions
- Often involves sensitive or potentially harmful content

### Participating in Governance

#### Acquiring LZ Tokens

- Contribute to platform through quality submissions
- Purchase tokens from decentralized exchanges
- Earn tokens by participating in governance

#### Voting on Access Decisions

1. **Review Proposals**: Read DAO proposals about document access
2. **Consider Impact**: Weigh public interest against potential harm
3. **Cast Your Vote**: Use your LZ tokens to vote on decisions
4. **Monitor Results**: Track voting outcomes and implementation

## Security Best Practices

### For Whistleblowers

#### Operational Security

- **Use Public WiFi**: Don't submit from your work or home network
- **Tor Browser**: Consider using Tor for additional anonymity
- **Clean Devices**: Use devices that aren't associated with your identity
- **Timing**: Avoid submitting immediately after events that could identify you

#### Digital Hygiene

- **Email Forensics**: Be aware that email headers contain metadata
- **Document Metadata**: Remove identifying information from files
- **Writing Style**: Avoid distinctive language patterns
- **Multiple Submissions**: Don't submit multiple leaks that could be linked

### For All Users

#### Wallet Security

- **Hardware Wallets**: Use hardware wallets when possible
- **Private Keys**: Never share your private keys
- **Backup**: Securely backup your wallet recovery phrases
- **Updates**: Keep wallet software updated

#### Platform Interaction

- **Verify URLs**: Always check you're on the correct platform URL
- **HTTPS**: Ensure secure connection (https://)
- **Smart Contract Verification**: Verify you're interacting with correct contracts
- **Gas Fees**: Be aware of transaction costs

## Troubleshooting Common Issues

### Email Upload Problems

**Issue**: Email file not recognized

- **Solution**: Ensure file has .eml extension and valid email structure

**Issue**: DKIM verification fails

- **Solution**: Check that email hasn't been forwarded or modified

**Issue**: Unsupported email domain

- **Solution**: We support major providers; contact support for additions

### Proof Generation Issues

**Issue**: Proof generation taking too long

- **Solution**: This is normal for complex emails; wait up to 30 minutes

**Issue**: Browser crashes during proof generation

- **Solution**: Use latest Chrome/Firefox, ensure sufficient RAM

**Issue**: Proof verification fails

- **Solution**: Check that email file hasn't been corrupted

### Wallet Connection Problems

**Issue**: Wallet not connecting

- **Solution**: Refresh page, check wallet is unlocked, verify network

**Issue**: Transaction failures

- **Solution**: Check gas fees, ensure sufficient balance, retry transaction

### Document Access Issues

**Issue**: Cannot access restricted documents

- **Solution**: Check DAO voting status, participate in governance process

**Issue**: Download failures

- **Solution**: Check internet connection, try again later (Walrus may be syncing)

## Getting Help

### Community Support

- **Discord**: Join our community for real-time help
- **Forum**: Post detailed questions in our support forum
- **Documentation**: Check technical documentation for advanced issues

### Technical Issues

- **Bug Reports**: Submit technical issues through our GitHub
- **Feature Requests**: Propose improvements through DAO governance
- **Security Concerns**: Contact security team directly

### Emergency Situations

If you believe you're in immediate danger:

1. **Stop Using the Platform**: Discontinue any activities that might identify you
2. **Seek Professional Help**: Contact journalists, lawyers, or advocacy organizations
3. **Document Everything**: Keep records of threats or retaliation
4. **Use Established Channels**: Consider traditional whistleblowing channels if necessary

Remember: ZeroLeaks provides technical protection, but cannot guarantee your physical safety. Always prioritize your personal security.
