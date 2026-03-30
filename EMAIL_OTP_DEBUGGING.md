# Email OTP Service - Debugging Guide

## 🔍 Common Issues & Solutions

### **Issue 1: Email Not Received in Inbox**

#### **A. Sender Email Not Verified in Brevo**
**Status:** ⚠️ **MOST COMMON**

**Solution:**
1. Go to [Brevo Dashboard](https://www.brevo.com/login/)
2. Navigate to **Senders & Contacts** → **Senders**
3. Check if `activeman825@gmail.com` has a ✅ **verified** status
4. If not verified:
   - Click "Add a sender"
   - Enter: `activeman825@gmail.com`
   - Check verification email sent to that address
   - Click the verification link
   - Wait 5-10 minutes before testing

---

### **Issue 2: API Authentication Error (401)**

**Cause:** Invalid or expired API key

**Solution:**
1. Log in to Brevo
2. Go to **Settings** → **SMTP & API keys**
3. Copy the API key starting with `xkeysib-`
4. Update in `.env`:
   ```
   BREVO_API_KEY=xkeysib-[YOUR_KEY_HERE]
   ```
5. Restart the server: `npm run dev`

---

### **Issue 3: Bad Request Error (400)**

**Causes:** 
- Malformed email address
- HTML content issues
- Missing required fields

**Check:**
```javascript
// Test email format
const email = "user@example.com"; // Valid
// Make sure email is not null or undefined
```

---

### **Issue 4: Rate Limiting (429)**

**Cause:** Too many requests to Brevo in short time

**Solution:**
- Wait 5 minutes before retrying
- Brevo has rate limits per minute
- Implement exponential backoff in your code

---

## 🧪 Test OTP Email Sending

### **Using cURL (Windows PowerShell)**

Run this to test your Brevo API:

```powershell
$headers = @{
    "api-key" = "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"
    "Content-Type" = "application/json"
}

$body = @{
    sender = @{
        email = "activeman825@gmail.com"
        name = "Smart Yatra"
    }
    to = @(
        @{ email = "YOUR_TEST_EMAIL@gmail.com" }
    )
    subject = "Test OTP"
    htmlContent = "<p>Test OTP: 123456</p>"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.brevo.com/v3/smtp/email" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

### **Using Node.js Script**

Create a test file: `test-email.js`

```javascript
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    email: process.env.EMAIL_SENDER_ADDRESS,
                    name: 'Smart Yatra'
                },
                to: [
                    {
                        email: 'YOUR_TEST_EMAIL@gmail.com'
                    }
                ],
                subject: 'Test Smart Yatra OTP',
                htmlContent: `<p>Your test OTP is: 123456</p>`
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Email sent successfully!');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('❌ Failed to send email');
        console.error('Error:', error.response?.data || error.message);
    }
};

testEmail();
```

Run: `node test-email.js`

---

## 📊 Check Email Sending Logs

### **In Brevo Dashboard:**
1. Go to **Activity** → **Emails**
2. Check recent sent/failed emails
3. Look for failures with detailed error messages

### **In Your Backend Console:**
- Check for console logs with ✅ or ❌ indicators
- Look for error status codes and Brevo API responses

---

## 🔧 Checklist for Complete Fix

- [ ] Email sender (`activeman825@gmail.com`) is verified in Brevo
- [ ] `BREVO_API_KEY` is correctly set in `.env`
- [ ] `EMAIL_SENDER_ADDRESS` is set in `.env`
- [ ] Server is restarted after `.env` changes
- [ ] Test OTP email sent successfully (via cURL or test script)
- [ ] Check email in inbox (including spam folder)
- [ ] Verify user email format is valid (contains @)

---

## 📝 Backend Logging Indicators

After update, look for these console logs:

```
✅ Email OTP sent successfully to user@example.com
❌ BREVO_API_KEY is not configured in .env
⚠️ Unauthorized - Check BREVO_API_KEY validity
```

---

## 🆘 Still Not Working?

1. **Check spam folder** - Emails might be filtered
2. **Verify sender email** - Must be verified in Brevo first
3. **Test with Brevo dashboard** - Send test email directly from Brevo
4. **Check API key expiration** - Regenerate if needed
5. **Review rate limits** - Wait between requests
6. **Network issues** - Check firewall/proxy blocking Brevo API
