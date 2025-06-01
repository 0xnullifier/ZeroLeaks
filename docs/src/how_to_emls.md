# Email Export Guide: How to Extract .eml Files

This guide will walk you through the process of extracting `.eml` files from various email clients. EML files contain the raw email data needed for ZeroLeaks' zero-knowledge proof generation.

## What are .eml Files?

EML (Email Message) files are a standard format that contains the complete email message including:

- Headers (sender, recipient, date, subject)
- DKIM signatures (crucial for ZeroLeaks verification)
- Message body and attachments
- Complete metadata required for cryptographic verification

## Why Do You Need .eml Files?

ZeroLeaks uses the raw email data in .eml format to:

1. Extract DKIM signatures for cryptographic verification
2. Generate zero-knowledge proofs about email authenticity
3. Verify sender identity without revealing personal information
4. Maintain the complete chain of trust from email provider to blockchain

## Email Client Instructions

### Gmail (Web Interface)

#### Method 1: Using Browser Developer Tools

1. Open Gmail in your web browser
2. Open the email you want to export
3. Press `F12` to open Developer Tools
4. Go to the Network tab
5. Refresh the email (Ctrl/Cmd + R)
6. Look for a request containing the email content
7. Right-click and select "Save response"

#### Method 2: Using Gmail API (Advanced)

1. Enable Gmail API in Google Cloud Console
2. Use the API to fetch raw email content
3. Save the response as a `.eml` file

### Outlook (Desktop)

**Windows:**

1. Open Outlook desktop application
2. Select the email you want to export
3. Go to File → Save As
4. Choose "Outlook Message Format (*.msg)" or "Text Only (*.txt)"
5. For .eml format, use third-party tools or save as .msg then convert

**Mac:**

1. Open Outlook for Mac
2. Select the email
3. File → Save As
4. Choose location and save

### Apple Mail

1. Open Mail application
2. Select the email you want to export
3. File → Save As
4. Choose "Raw Source" from the format dropdown
5. Save with `.eml` extension

### Thunderbird

1. Open Thunderbird
2. Select the email
3. File → Save As → File
4. Choose "All Files" as file type
5. Add `.eml` extension to filename

### Yahoo Mail

1. Open Yahoo Mail in web browser
2. Open the email
3. Click the More menu (three dots)
4. Select "View Raw Message"
5. Copy the raw content
6. Paste into a text editor
7. Save with `.eml` extension

### ProtonMail

1. Open ProtonMail
2. Select the email
3. Click More → View source
4. Copy the raw email content
5. Save as `.eml` file

## Mobile Email Clients

### iPhone Mail App

1. Open the Mail app
2. Find and open the email
3. Tap the reply/forward button
4. Choose "Mail" to forward to yourself
5. In the compose window, long-press in the content area
6. Select "Quote Level" → "Include Original"
7. Send to an email account you can access on desktop
8. Follow desktop instructions to extract .eml

### Android Gmail App

1. Open Gmail app
2. Open the email
3. Tap the three-dot menu
4. Select "Print"
5. Choose "Save as PDF" (this won't preserve DKIM signatures)
6. For proper .eml files, access Gmail via desktop browser

## Third-Party Tools

### MailStore Home (Windows)

- Free tool for email archiving
- Can export emails in various formats including .eml
- Supports multiple email clients

### Aid4Mail (Cross-platform)

- Professional email migration tool
- Supports .eml export from various sources
- Has both free and paid versions

### Email Conversion Tools

- **MSG to EML Converter**: Converts Outlook .msg files to .eml
- **MBOX to EML**: Extracts individual emails from MBOX archives
- **PST to EML**: Converts Outlook PST files to individual .eml files

## Programmatic Extraction

### Python Script Example

```python
import imaplib
import email
import os

def download_emails_as_eml(username, password, server, folder='INBOX'):
    """Download emails as .eml files"""
    
    # Connect to server
    mail = imaplib.IMAP4_SSL(server)
    mail.login(username, password)
    mail.select(folder)
    
    # Search for emails
    status, messages = mail.search(None, 'ALL')
    email_ids = messages[0].split()
    
    for email_id in email_ids[-10:]:  # Last 10 emails
        # Fetch email
        status, msg_data = mail.fetch(email_id, '(RFC822)')
        raw_email = msg_data[0][1]
        
        # Save as .eml file
        filename = f"email_{email_id.decode()}.eml"
        with open(filename, 'wb') as f:
            f.write(raw_email)
    
    mail.close()
    mail.logout()

# Usage
download_emails_as_eml('your_email@gmail.com', 'your_password', 'imap.gmail.com')
```

### Node.js Example

```javascript
const Imap = require('imap');
const fs = require('fs');

const imap = new Imap({
  user: 'your_email@gmail.com',
  password: 'your_password',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

imap.once('ready', function() {
  imap.openBox('INBOX', true, function(err, box) {
    if (err) throw err;
    
    const f = imap.seq.fetch('1:10', { bodies: '' });
    f.on('message', function(msg, seqno) {
      msg.on('body', function(stream, info) {
        const writeStream = fs.createWriteStream(`email_${seqno}.eml`);
        stream.pipe(writeStream);
      });
    });
    
    f.once('end', function() {
      imap.end();
    });
  });
});

imap.connect();
```

## Verifying .eml Files

Before using .eml files with ZeroLeaks, verify they contain necessary components:

### 1. Check DKIM Signature

```bash
grep -i "dkim-signature" your_email.eml
```

### 2. Verify Headers

Ensure the file contains:

- `From:` header
- `To:` header
- `Date:` header
- `Subject:` header
- `Message-ID:` header

### 3. Check File Size

- Valid .eml files should be at least a few KB
- Very small files may be incomplete

## Security Considerations

### Before Exporting

- Ensure you have legal right to export the emails
- Be aware of company policies regarding email export
- Consider privacy implications

### After Exporting

- Store .eml files securely
- Delete temporary files after processing
- Never share .eml files containing sensitive information
- Use ZeroLeaks to prove email authenticity without revealing content

### DKIM Signature Preservation

- DKIM signatures are crucial for ZeroLeaks verification
- Ensure export method preserves complete headers
- Avoid copy-pasting email content (may corrupt signatures)
- Use raw message export when possible

## Troubleshooting

### Common Issues

**No DKIM Signature Found:**

- Not all emails have DKIM signatures
- Try emails from major providers (Gmail, Outlook, Yahoo)
- Check if your email provider supports DKIM

**Corrupted .eml File:**

- Re-export using different method
- Verify file size and content
- Check for complete headers

**Large File Sizes:**

- Remove attachments if not needed for verification
- Compress files for storage
- Consider splitting large email threads

**Encoding Issues:**

- Ensure UTF-8 encoding
- Avoid editing .eml files manually
- Use appropriate tools for your operating system

### Getting Help

If you encounter issues:

1. Check the ZeroLeaks documentation
2. Verify your .eml file format
3. Test with a simple email first
4. Contact ZeroLeaks support with specific error messages

## Best Practices

1. **Test First**: Start with a simple, recent email
2. **Preserve Originals**: Keep original emails accessible
3. **Document Process**: Note which method worked for your setup
4. **Batch Processing**: Export multiple emails at once when possible
5. **Regular Backups**: Maintain secure backups of important evidence
6. **Legal Compliance**: Ensure all exports comply with applicable laws

## Next Steps

Once you have your .eml files:

1. Review the ZeroLeaks user guide
2. Prepare your leak submission
3. Generate zero-knowledge proofs
4. Submit to the platform

Remember: ZeroLeaks protects your identity while proving email authenticity. The .eml file is processed locally to generate proofs without revealing your personal information.
