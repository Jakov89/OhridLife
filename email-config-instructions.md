# Email Configuration for OhridHub Contact Form

## Current Status
✅ **Contact form is working** and will log submissions to the console
✅ **Email address updated** to `contact@ohridhub.mk`
✅ **API endpoint created** at `/api/contact`

## To Enable Actual Email Sending

### Option 1: Using Nodemailer with Gmail (Recommended)

1. **Install nodemailer:**
```bash
npm install nodemailer
```

2. **Create environment variables (.env file):**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=contact@ohridhub.mk
```

3. **Enable 2-Factor Authentication on Gmail and create App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate new password for "OhridHub"

4. **Update server.js (uncomment the nodemailer code):**
```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// In the /api/contact endpoint, replace the TODO section with:
await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: emailContent.subject,
    html: emailContent.html,
    replyTo: email
});
```

### Option 2: Using Professional Email Service (SendGrid)

1. **Install SendGrid:**
```bash
npm install @sendgrid/mail
```

2. **Get SendGrid API key:**
   - Sign up at sendgrid.com
   - Get API key from Settings → API Keys

3. **Environment variables:**
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_TO=contact@ohridhub.mk
```

4. **Update server.js:**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In the /api/contact endpoint:
await sgMail.send({
    to: process.env.EMAIL_TO,
    from: 'noreply@ohridhub.mk', // Must be verified in SendGrid
    subject: emailContent.subject,
    html: emailContent.html,
    replyTo: email
});
```

### Option 3: Using SMTP (For custom email providers)

```javascript
const transporter = nodemailer.createTransporter({
    host: 'your-smtp-server.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

## Testing the Contact Form

1. **Start the server:** `node server.js`
2. **Visit:** http://localhost:3000
3. **Scroll to contact form**
4. **Submit a test message**
5. **Check console output** for submission details

## Current Form Features

✅ **Real-time validation** - Name, email, message validation
✅ **Professional UI** - Modern design with loading states
✅ **Error handling** - Comprehensive error messages
✅ **Responsive design** - Works on all devices
✅ **Security** - Input validation and sanitization
✅ **User feedback** - Success and error states

## Form Data Structure

The form sends this data to `/api/contact`:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Travel Recommendations",
    "message": "Hi, I'm planning a trip to Ohrid...",
    "to": "contact@ohridhub.mk",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Next Steps

1. Choose an email service (Gmail recommended for quick setup)
2. Install required packages
3. Set up environment variables
4. Update server.js with email sending code
5. Test the form with real email delivery

The contact form is ready to use and will enhance visitor engagement significantly! 🚀 