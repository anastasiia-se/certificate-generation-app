# Certificate Generation App

A simple web application for generating and emailing PDF certificates with admin tracking.

## Project Structure

```
GenAI_Certificate_SWE_APP/
├── certificate-app-functions/         # Azure Functions backend
│   ├── generateCertificate/           # PDF generation function
│   ├── sendEmail/                     # Email sending function
│   ├── saveCertificateRecord/         # Database storage function
│   ├── getCertificates/               # Admin dashboard data
│   ├── templates/                     # Certificate HTML template
│   ├── host.json                      # Azure Functions config
│   ├── local.settings.json            # Local development settings
│   └── package.json                   # Node.js dependencies
├── certificate-app-frontend/          # React frontend
│   ├── src/
│   │   ├── App.js                     # Main application component
│   │   ├── App.css                    # Styling
│   │   └── AdminDashboard.js          # Admin dashboard component
│   └── package.json                   # React dependencies
└── README.md                          # This file
```

## Features Completed ✅

1. **Backend Azure Functions**:
   - Certificate PDF generation with Puppeteer
   - Email sending with SendGrid
   - Database record storage (SQL Server)
   - Admin dashboard data retrieval

2. **Frontend React App**:
   - Certificate request form (Name, Surname, Email)
   - Form validation and error handling
   - Admin dashboard with certificate listing
   - Simple navigation between views

3. **Certificate Template**:
   - Simple HTML template with CSS styling
   - Dynamic data insertion (name, date, certificate ID)

## Next Steps

### 1. Local Testing
```bash
# Start Azure Functions (in certificate-app-functions directory)
npm start

# Start React app (in certificate-app-frontend directory)
npm start
```

### 2. Environment Variables Setup
Create `certificate-app-functions/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "SENDGRID_API_KEY": "your_sendgrid_api_key",
    "SENDER_EMAIL": "your_sender_email@domain.com",
    "AZURE_STORAGE_CONNECTION_STRING": "your_azure_storage_connection",
    "SQL_CONNECTION_STRING": "your_sql_connection_string"
  }
}
```

### 3. Azure Deployment
- Deploy functions to existing Azure Function App
- Deploy React app to Azure Static Web Apps
- Configure environment variables in Azure

### 4. Testing Checklist
- [ ] Certificate PDF generation works
- [ ] Email sending functional
- [ ] Database storage working
- [ ] Frontend form submission
- [ ] Admin dashboard displays data
- [ ] Error handling works properly

## Technology Stack
- **Frontend**: React, CSS
- **Backend**: Node.js, Azure Functions
- **PDF Generation**: Puppeteer
- **Email**: SendGrid
- **Database**: Azure SQL Database
- **Storage**: Azure Blob Storage
- **Hosting**: Azure Static Web Apps + Azure Functions

## Current Status
✅ Development complete - Ready for testing and deployment!