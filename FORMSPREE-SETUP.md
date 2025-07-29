# Formspree Setup Guide (2 minutes)

## Why Formspree is Perfect
✅ **Super simple** - Just one form endpoint  
✅ **Free for 50 emails/month**  
✅ **No server setup needed**  
✅ **Reliable and fast**  

## Quick Setup (2 minutes)

### Step 1: Create Formspree Account
1. Go to [formspree.io](https://formspree.io)
2. Click **"Get Started"**
3. Sign up with your email (use the same email where you want to receive contact form submissions)
4. Verify your email

### Step 2: Create New Form
1. **Click:** "New Form" 
2. **Form Name:** `OhridHub Contact Form`
3. **Email:** `contact@ohridhub.mk` (where you want to receive emails)
4. **Click:** "Create Form"

### Step 3: Get Your Form Endpoint
1. After creating the form, you'll see your **Form Endpoint**
2. It will look like: `https://formspree.io/f/xyzabc123`
3. **Copy this URL** - you'll need it for the next step

### Step 4: Update Your Website
1. Open `index.js` in your project
2. Find this line (around line 3464):
```javascript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID_HERE', {
```
3. **Replace** `YOUR_FORM_ID_HERE` with your actual form ID from Step 3
4. **Save the file**

### Step 5: Test Your Contact Form
1. **Start your server:** `node server.js`
2. **Visit:** http://localhost:3000
3. **Scroll to contact form**
4. **Submit a test message**
5. **Check your email inbox!**

## Example
If your form endpoint is `https://formspree.io/f/xyzabc123`, update the line to:
```javascript
const response = await fetch('https://formspree.io/f/xyzabc123', {
```

## Benefits After Setup
- 📧 **Instant emails** to contact@ohridhub.mk  
- 🔒 **No credentials needed** in your code  
- 💰 **Free** for 50 emails/month  
- ⚡ **Super fast** setup  
- 🛡️ **Spam protection** included

## Current Status
- ✅ **Contact form updated** to use Formspree
- ⚠️ **Needs form ID** - replace YOUR_FORM_ID_HERE
- ✅ **Ready to work** once form ID is added

**Your contact form will work immediately after you add your Formspree form ID!** 