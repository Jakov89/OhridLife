# EmailJS Setup Guide (5-minute setup)

## Why EmailJS is Better
✅ **No server credentials needed** - Visitors send emails directly  
✅ **Free for up to 200 emails/month**  
✅ **More secure** - No personal email credentials exposed  
✅ **Works immediately** - Anyone can send contact form emails  

## Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [emailjs.com](https://www.emailjs.com)
2. Sign up for free account
3. Verify your email

### Step 2: Connect Your Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email service)
4. Follow the prompts to connect your email
5. **Copy the Service ID** (you'll need this)

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template content:

**Subject:** `New Contact from {{from_name}} - {{subject}}`

**Body:**
```
New contact form submission from OhridHub:

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
Reply directly to this email to respond to {{from_name}}.
```

4. **Copy the Template ID** (you'll need this)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. **Copy your Public Key**

### Step 5: Update Your Website
Edit the `index.js` file and replace these values around line 3514:

```javascript
const serviceID = 'your_service_id_here';    // From Step 2
const templateID = 'your_template_id_here';  // From Step 3  
const publicKey = 'your_public_key_here';    // From Step 4
```

### Step 6: Test
1. Restart your server: `node server.js`
2. Visit your website
3. Submit a test message via the contact form
4. Check your email inbox!

## Current Status
- ✅ **EmailJS library loaded** on your website
- ✅ **Contact form updated** to use EmailJS
- ✅ **Server fallback** - works even without EmailJS setup
- ⚠️ **Needs configuration** - replace the placeholder values

## Benefits After Setup
- 📧 **Instant emails** to contact@ohridhub.mk
- 🔒 **No server credentials** needed
- 💰 **Free** for up to 200 emails/month
- ⚡ **Fast** - emails sent directly from visitor's browser
- 🛡️ **Secure** - no sensitive credentials in your code

The contact form will continue working even without EmailJS setup (submissions are logged), but with EmailJS you'll get instant email notifications! 