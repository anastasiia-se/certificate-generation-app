# Fresh Start: Certificate App with Azure Static Web Apps Standard

## Why Fresh Start is Better
- Current functions have compatibility issues
- SWA uses Azure Functions v4 programming model (simpler, more modern)
- Clean architecture designed for SWA from the beginning
- No legacy code or dependencies to worry about

## New Project Structure
```
certificate-app-swa-v2/
├── app/                    # React frontend (built files)
│   └── (built React app)
├── api/                    # Azure Functions v4
│   ├── src/
│   │   ├── functions/
│   │   │   ├── generateCertificate.js
│   │   │   ├── getCertificates.js
│   │   │   └── health.js
│   │   ├── services/
│   │   │   ├── pdfService.js
│   │   │   ├── emailService.js
│   │   │   └── databaseService.js
│   │   └── templates/
│   │       └── certificate.html
│   ├── package.json
│   └── host.json
├── frontend/              # React source
│   ├── src/
│   ├── public/
│   └── package.json
├── staticwebapp.config.json
└── package.json
```

## Step-by-Step Implementation

### Step 1: Create Fresh Project
```bash
mkdir certificate-app-swa-v2
cd certificate-app-swa-v2
```

### Step 2: Initialize SWA-Optimized Azure Functions (v4 Model)

Create `api/package.json`:
```json
{
  "name": "certificate-api",
  "version": "1.0.0",
  "description": "Certificate generation API for SWA",
  "scripts": {
    "start": "func start",
    "test": "node test.js"
  },
  "dependencies": {
    "@azure/functions": "^4.0.0",
    "@azure/storage-blob": "^12.17.0",
    "@sendgrid/mail": "^8.1.0",
    "puppeteer": "^21.0.0"
  },
  "main": "src/functions/*.js"
}
```

Create `api/host.json`:
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### Step 3: Write Clean Azure Functions v4

Create `api/src/functions/generateCertificate.js`:
```javascript
const { app } = require('@azure/functions');
const { generatePDF } = require('../services/pdfService');
const { sendEmail } = require('../services/emailService');
const { saveToDB } = require('../services/databaseService');

app.http('generateCertificate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const { name, surname, email } = await request.json();
            
            // Validate input
            if (!name || !surname || !email) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Missing required fields' })
                };
            }

            // Generate certificate
            const certificateId = `CERT-${Date.now()}`;
            const pdfBuffer = await generatePDF(name, surname, certificateId);
            
            // Send email
            await sendEmail(email, name, surname, pdfBuffer, certificateId);
            
            // Save to database
            await saveToDB({
                certificateId,
                name,
                surname,
                email,
                generatedAt: new Date().toISOString()
            });

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: true,
                    certificateId,
                    message: 'Certificate sent to your email'
                })
            };
        } catch (error) {
            context.log('Error:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Failed to generate certificate' })
            };
        }
    }
});
```

Create `api/src/functions/getCertificates.js`:
```javascript
const { app } = require('@azure/functions');
const { getAllCertificates } = require('../services/databaseService');

app.http('getCertificates', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const certificates = await getAllCertificates();
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certificates)
            };
        } catch (error) {
            context.log('Error:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Failed to fetch certificates' })
            };
        }
    }
});
```

Create `api/src/functions/health.js`:
```javascript
const { app } = require('@azure/functions');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        return {
            status: 200,
            body: JSON.stringify({ 
                status: 'healthy',
                timestamp: new Date().toISOString()
            })
        };
    }
});
```

### Step 4: Create Service Modules

Create `api/src/services/pdfService.js`:
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function generatePDF(name, surname, certificateId) {
    // Read template
    const templatePath = path.join(__dirname, '../templates/certificate.html');
    let template = await fs.readFile(templatePath, 'utf-8');
    
    // Replace placeholders
    template = template
        .replace('{{name}}', name)
        .replace('{{surname}}', surname)
        .replace('{{date}}', new Date().toLocaleDateString())
        .replace('{{certificateId}}', certificateId);
    
    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(template);
    const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true
    });
    
    await browser.close();
    return pdf;
}

module.exports = { generatePDF };
```

Create `api/src/services/emailService.js`:
```javascript
const sgMail = require('@sendgrid/mail');

async function sendEmail(email, name, surname, pdfBuffer, certificateId) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
        to: email,
        from: 'certificates@yourcompany.com',
        subject: 'Your Certificate is Ready!',
        text: `Dear ${name} ${surname}, your certificate (${certificateId}) is attached.`,
        html: `
            <h2>Congratulations ${name} ${surname}!</h2>
            <p>Your certificate has been generated successfully.</p>
            <p>Certificate ID: <strong>${certificateId}</strong></p>
        `,
        attachments: [
            {
                content: pdfBuffer.toString('base64'),
                filename: `certificate_${certificateId}.pdf`,
                type: 'application/pdf',
                disposition: 'attachment'
            }
        ]
    };
    
    await sgMail.send(msg);
}

module.exports = { sendEmail };
```

Create `api/src/services/databaseService.js`:
```javascript
// Simple in-memory store for now (replace with Azure SQL later)
const certificates = [];

async function saveToDB(certificate) {
    certificates.push(certificate);
    return certificate;
}

async function getAllCertificates() {
    return certificates;
}

module.exports = { saveToDB, getAllCertificates };
```

### Step 5: Create Simple Certificate Template

Create `api/src/templates/certificate.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .certificate {
            border: 10px solid gold;
            padding: 50px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
        }
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }
        h2 {
            font-size: 32px;
            margin: 30px 0;
        }
        .name {
            font-size: 36px;
            font-weight: bold;
            text-decoration: underline;
        }
        .footer {
            margin-top: 50px;
            font-size: 14px;
        }
        .certificate-id {
            margin-top: 20px;
            font-size: 12px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>Certificate of Completion</h1>
        <p>This is to certify that</p>
        <h2 class="name">{{name}} {{surname}}</h2>
        <p>has successfully completed the requirements</p>
        <p>on this day <strong>{{date}}</strong></p>
        <div class="footer">
            <p>Authorized Signature</p>
        </div>
        <div class="certificate-id">
            Certificate ID: {{certificateId}}
        </div>
    </div>
</body>
</html>
```

### Step 6: Simplified React Frontend

Create `frontend/src/App.js`:
```javascript
import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/generateCertificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`Success! Certificate sent to ${formData.email}`);
        setFormData({ name: '', surname: '', email: '' });
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Certificate Generator</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.surname}
          onChange={(e) => setFormData({...formData, surname: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Certificate'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;
```

### Step 7: SWA Configuration

Create `staticwebapp.config.json`:
```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "platform": {
    "apiRuntime": "node:20"
  }
}
```

### Step 8: Deploy to Azure

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Build frontend
cd frontend
npm run build
cd ..

# Copy build to app folder
xcopy frontend\build\* app\ /E /I

# Create Static Web App
az staticwebapp create \
  --name "certificate-app-fresh" \
  --resource-group "certificate-app-rg" \
  --location "swedencentral" \
  --sku "Standard"

# Get deployment token
az staticwebapp secrets list \
  --name "certificate-app-fresh" \
  --query "properties.apiKey" -o tsv

# Deploy
swa deploy ./app --api-location ./api --deployment-token <TOKEN>
```

## Advantages of Fresh Start
1. **Modern Functions v4** - Cleaner, simpler syntax
2. **No legacy issues** - No old dependencies or configurations
3. **SWA-optimized** - Designed specifically for Static Web Apps
4. **Simpler debugging** - Less complex code structure
5. **Better performance** - Optimized for SWA runtime

## Testing Locally
```bash
# Install dependencies
cd api && npm install
cd ../frontend && npm install

# Run locally
swa start ../frontend/build --api-location ../api
```

Visit http://localhost:4280 to test!