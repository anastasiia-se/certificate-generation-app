# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gen AI Training Diploma Generation System - A full-stack Azure application for generating, storing, and managing professional PDF diplomas for Swedbank's Gen AI training program.

**Current Status**: Production-ready v2.0 with batch CSV upload capability
**Active Branch**: disabled-sending-diplomas (no email functionality)
**Alternative Branch**: enabled-sending-diplomas (includes Resend email integration)

## Technology Stack

### Frontend (certificate-app-frontend/)
- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **HTTP Client**: Axios
- **CSV Parsing**: PapaParse
- **Hosting**: Azure Static Web Apps (Standard tier)

### Backend (api/)
- **Runtime**: Node.js 18.x
- **Framework**: Azure Functions v4
- **PDF Generation**: PDFKit
- **Storage**: Azure Table Storage + Azure Blob Storage
- **Email**: Resend API (only in enabled-sending-diplomas branch)

## Development Commands

### Frontend Development
```bash
cd certificate-app-frontend
npm start                # Start dev server on localhost:3000
npm run build            # Build production bundle
npm test                 # Run tests
```

### Backend Development (Azure Functions)
```bash
cd api
npm start                # Start Azure Functions locally on port 7071
npm test                 # Run tests (currently placeholder)
```

### Deployment
Deployment is automated via GitHub Actions. Push to main branch triggers:
1. Frontend deployment to Azure Static Web Apps
2. Backend deployment happens automatically (linked to Static Web App)

## Architecture

### System Flow
1. User authenticates (password: GenAITraining2025)
2. User generates diploma(s) via form or CSV upload
3. Azure Function generates PDF using PDFKit
4. PDF stored in Azure Blob Storage (`certificates` container)
5. Metadata stored in Azure Table Storage (`certificates` table)
6. User can download or delete diplomas from history table

### Key Azure Resources
```
Resource Group: certificate-app-rg
├── Static Web App: certificate-app-1755972754 (Standard tier)
│   URL: https://proud-beach-08943ae0f.1.azurestaticapps.net
├── Function App: certificate-functions-app-77132
│   URL: https://certificate-functions-app-77132.azurewebsites.net
└── Storage Account: certappstorage2025
    ├── Blob Container: certificates (stores PDF files)
    └── Table: certificates (stores metadata)
```

### API Endpoints
- **POST** `/api/GenerateCertificate` - Generate single diploma
- **GET** `/api/GetCertificateHistory` - Fetch all diplomas
- **GET** `/api/certificates/{id}` - Download specific diploma PDF
- **DELETE** `/api/diplomas/{id}` - Delete diploma and metadata

### Frontend Structure
```
certificate-app-frontend/src/
├── App.tsx                              # Main router and authentication
├── components/
│   ├── Login.tsx                        # Password authentication
│   ├── Header.tsx                       # Swedbank-branded header
│   ├── CertificateForm.tsx             # Single diploma generation
│   ├── BatchCertificateUpload.tsx      # CSV batch upload
│   └── CertificateHistory.tsx          # Diploma list with download/delete
├── services/                            # API communication layer
└── types/                               # TypeScript interfaces
```

### Backend Structure
```
api/
├── GenerateCertificate.js              # Main diploma generation endpoint
├── GetCertificateHistory.js            # Fetch all diplomas
├── GetCertificate.js                   # Download specific diploma
├── DeleteDiploma.js                    # Delete diploma
└── shared/
    ├── pdfGenerator.js                 # PDFKit diploma generation
    ├── blobStorage.js                  # Azure Blob operations
    ├── tableStorage.js                 # Azure Table operations
    ├── emailService.js                 # Resend integration (disabled branch)
    ├── swedbank-logo.png               # Logo for diplomas
    └── oak-leaves-bg.jpg               # Decorative border
```

## Critical Implementation Details

### PDF Generation
- Uses PDFKit to generate landscape A4 diplomas
- Includes Swedbank branding (orange #FF6B35, logo)
- Decorative 1.5cm oak leaves border frame
- Fields: Name, Surname, Completion Date, Diploma ID
- Location: [api/shared/pdfGenerator.js](api/shared/pdfGenerator.js)

### Storage Pattern
- **Table Storage**: Uses partition key `CERT`, row key `diploma_{timestamp}_{random}`
- **Blob Storage**: Files named `{diplomaId}.pdf` with `application/pdf` content type
- **Fallback**: If storage connection fails, uses in-memory store (development only)

### Batch Processing
- CSV format: Simple two columns `Name,Surname` (no header required)
- Auto-assigns completion date to current date
- Processes sequentially with progress tracking
- Returns individual success/failure status per diploma
- Prevents duplicates by checking Name+Surname+Date combination

### Authentication
- Frontend-only password protection (localStorage session)
- Password: `GenAITraining2025`
- No backend authentication (APIs are anonymous)
- **Security Note**: APIs are publicly accessible - consider adding function keys for production

## Environment Variables

### Frontend (.env.production)
```
REACT_APP_API_URL=https://certificate-functions-app-77132.azurewebsites.net/api
```

### Backend (Azure Function App Settings)
```
AZURE_STORAGE_CONNECTION_STRING=<required>
NODE_ENV=production
```

### Email-Related (only for enabled-sending-diplomas branch)
```
RESEND_API_KEY=<required>
SENDER_EMAIL=onboarding@resend.dev
```

## Branch Strategy

- **main**: Production branch (currently mirrors disabled-sending-diplomas)
- **disabled-sending-diplomas**: Current active development (no email)
- **enabled-sending-diplomas**: Email functionality enabled with Resend

When working on features:
1. Use disabled-sending-diplomas for non-email features
2. Merge to main for production deployment
3. Switch to enabled-sending-diplomas if email functionality needed

## Common Tasks

### Adding a New Diploma Field
1. Update TypeScript interface in `certificate-app-frontend/src/types/`
2. Add field to form in `CertificateForm.tsx` and `BatchCertificateUpload.tsx`
3. Modify `api/GenerateCertificate.js` to accept new field
4. Update `api/shared/pdfGenerator.js` to render field on PDF
5. Update Table Storage schema in `api/shared/tableStorage.js`

### Modifying Diploma Design
- Edit `api/shared/pdfGenerator.js`
- PDFKit documentation: https://pdfkit.org/
- Test locally by running Function App and triggering generation
- Images are embedded from `api/shared/` directory

### Testing Azure Functions Locally
```bash
cd api
# Ensure local.settings.json has AZURE_STORAGE_CONNECTION_STRING
npm start
# Test endpoint at http://localhost:7071/api/GenerateCertificate
```

### Debugging Storage Issues
- Check Azure Portal for storage account `certappstorage2025`
- Verify connection string in Function App configuration
- Check Function App logs in Azure Portal for detailed errors
- In-memory fallback activates if connection fails (development only)

## Migration to Swedbank Azure

For production deployment to Swedbank's Azure tenant, refer to:
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete system architecture
- [MIGRATION_REQUIREMENTS.md](MIGRATION_REQUIREMENTS.md) - Priority checklist
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current implementation status

### Critical Migration Steps
1. **Custom Domain**: Configure diplomas.swedbank.se with DNS/SSL
2. **Email Domain**: Set up SPF/DKIM/DMARC for ai.learning@swedbank.se (if using email branch)
3. **API Security**: Add function keys or Azure AD authentication
4. **Data Residency**: Ensure EU region (North Europe) for GDPR compliance
5. **Monitoring**: Configure Application Insights and alerts
6. **Backup**: Implement automated backup for Table/Blob storage

## Known Limitations

- Frontend password visible in code (localStorage session)
- APIs publicly accessible without authentication
- No rate limiting on API endpoints
- No duplicate prevention for identical Name+Surname+Date
- No automated backup/disaster recovery
- Email functionality uses test domain in enabled-sending-diplomas branch

## Testing the Application

### Manual Testing Flow
1. Navigate to https://proud-beach-08943ae0f.1.azurestaticapps.net
2. Login with password: GenAITraining2025
3. Test single diploma generation
4. Test batch CSV upload (format: Name,Surname)
5. Verify diploma appears in history table
6. Test download functionality
7. Test delete with confirmation

### CSV Upload Test File Format
```csv
John,Smith
Jane,Doe
Robert,Johnson
```

## Useful Azure CLI Commands

```bash
# Check Function App status
az functionapp list --resource-group certificate-app-rg --query "[].{name:name,state:state}" -o table

# View Function App settings
az functionapp config appsettings list --name certificate-functions-app-77132 --resource-group certificate-app-rg

# Restart Function App
az functionapp restart --name certificate-functions-app-77132 --resource-group certificate-app-rg

# View Function App logs
az functionapp log tail --name certificate-functions-app-77132 --resource-group certificate-app-rg

# Check storage account
az storage account show --name certappstorage2025 --resource-group certificate-app-rg
```

## Code Conventions

- **Frontend**: TypeScript with React functional components and hooks
- **Backend**: JavaScript (Node.js) with async/await pattern
- **Styling**: Material-UI components with Swedbank orange (#FF5F00, #FF6B35)
- **Error Handling**: Try-catch blocks with detailed error messages
- **Storage**: Fallback pattern (Azure Storage → In-Memory for development)

## Dependencies to Watch

- **@azure/functions**: Azure Functions runtime (currently v4)
- **@azure/data-tables**: Table Storage client (v13)
- **@azure/storage-blob**: Blob Storage client (v12)
- **pdfkit**: PDF generation library (v0.17)
- **react**: Frontend framework (v19)
- **@mui/material**: UI components (v7)

## Support Resources

- Azure Functions Docs: https://docs.microsoft.com/en-us/azure/azure-functions/
- PDFKit Documentation: https://pdfkit.org/
- Material-UI Docs: https://mui.com/
- Azure Storage Docs: https://docs.microsoft.com/en-us/azure/storage/
