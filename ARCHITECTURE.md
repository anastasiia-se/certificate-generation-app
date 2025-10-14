# Gen AI Training Diploma System - Architecture Documentation

## Executive Summary
This document outlines the complete architecture of the Gen AI Training for Technical Professionals Diploma Generation System, including current implementation details and migration requirements for transitioning from personal Azure to Swedbank's Azure cloud infrastructure.

---

## 🏗️ Current Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users (Browser)                          │
│                    Password: GenAITraining2025                   │
└────────────────────────┬───────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Azure Static Web Apps                           │
│                    (Standard Tier)                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                React Frontend (SPA)                      │   │
│  │  - Login Authentication                                  │   │
│  │  - Single Diploma Generation Form                        │   │
│  │  - Batch CSV Upload (Multiple Diplomas)                  │   │
│  │  - Diploma History Table                                 │   │
│  │  - PDF Download & Delete Functions                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬───────────────────────────────────────┘
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Azure Functions App                           │
│                     (Node.js Runtime)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ API Endpoints:                                           │  │
│  │  • POST   /api/GenerateCertificate                       │  │
│  │  • GET    /api/GetCertificateHistory                     │  │
│  │  • GET    /api/certificates/{id}                         │  │
│  │  • DELETE /api/diplomas/{id}                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬──────────────────┬──────────────────┬────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Azure Table    │ │   Azure Blob    │ │   Resend API    │
│    Storage      │ │    Storage      │ │  (Not Active)   │
│                 │ │                 │ │                 │
│ Table:          │ │ Container:      │ │ Email sending   │
│ certificates    │ │ certificates    │ │ disabled in     │
│                 │ │                 │ │ current branch  │
└─────────────────┘ └─────────────────┘ └─────────────────┘

Note: Email functionality available in 'enabled-sending-diplomas' branch
```

---

## 📦 Technology Stack

### Frontend
- **Framework**: React 18.x with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios
- **CSV Parsing**: PapaParse
- **Build Tool**: Create React App
- **Hosting**: Azure Static Web Apps (Standard tier)

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Azure Functions v4
- **PDF Generation**: PDFKit
- **Email Service**: Resend API
- **Storage**: Azure Storage SDK

### Infrastructure
- **Cloud Provider**: Microsoft Azure
- **Region**: Currently in personal region (needs migration)
- **Authentication**: Frontend-only password protection
- **CI/CD**: GitHub Actions

---

## 🎯 Current Features (disabled-sending-diplomas branch)

### Diploma Generation
- **Single Diploma Mode**: Manual form entry for individual diplomas
  - Name, Surname input fields
  - "Diploma Issued" date (defaults to today, can be changed)
  - Automatic generation of unique diploma IDs

- **Batch Mode**: CSV upload for multiple diplomas
  - Simple CSV format: `Name,Surname`
  - Auto-fills "Diploma Issued" date to today
  - Preview table before generation
  - Progress bar during batch processing
  - Individual success/failure status per diploma

### Data Management
- **Diploma History Table**: Displays all generated diplomas
  - Columns: Name, Surname, Diploma Issued, Actions
  - Download individual PDFs
  - Delete diplomas with confirmation dialog
  - Real-time refresh after generation

### User Experience
- **Password Protection**: Simple frontend authentication
  - Password: GenAITraining2025
  - Session stored in localStorage
  - Logout functionality

- **Responsive Design**: Swedbank-branded UI
  - Clean, professional appearance
  - Orange accent color (#FF5F00)
  - Material-UI components

### Branch Strategy
- **main**: Production branch (currently disabled-sending-diplomas)
- **disabled-sending-diplomas**: Current working branch (no email functionality)
- **enabled-sending-diplomas**: Future branch with email sending capability

---

## 🔧 Current Configuration

### Environment Variables

#### Frontend (.env)
```
REACT_APP_API_URL=https://certificate-functions-app-77132.azurewebsites.net/api
```

#### Backend (Azure Function App Settings)
```
AZURE_STORAGE_CONNECTION_STRING=<storage_connection_string>
RESEND_API_KEY=<resend_api_key>
SENDER_EMAIL=onboarding@resend.dev
NODE_ENV=production
```

### Storage Configuration

#### Azure Table Storage
- **Table Name**: certificates
- **Partition Key**: CERT
- **Row Key**: diploma_{timestamp}_{random}

#### Azure Blob Storage
- **Container Name**: certificates
- **Blob Naming**: {diplomaId}.pdf
- **Content Type**: application/pdf

---

## 🚀 Migration Requirements for Swedbank Azure

### 1. **Domain & DNS Configuration** ⚠️ CRITICAL

#### Current State:
- Using Resend's default domain: `onboarding@resend.dev`
- No custom domain verification
- No SPF/DKIM/DMARC records

#### Required Actions:
```
1. Register subdomain: diplomas.swedbank.se (or similar)
2. Configure DNS records:
   - A Record → Azure Static Web App IP
   - CNAME → Azure endpoint
   - TXT Records for email verification
   
3. Email domain setup:
   - SPF: v=spf1 include:resend.io ~all
   - DKIM: Will be provided by Resend
   - DMARC: v=DMARC1; p=quarantine; rua=mailto:security@swedbank.se
   
4. Update sender email: ai.learning@swedbank.se
```

### 2. **Azure Resource Migration**

#### Resources to Create in Swedbank Azure:
```yaml
Resource Group: rg-genai-diploma-prod
  
Static Web App:
  Name: swa-genai-diploma-prod
  Tier: Standard
  Region: North Europe (or Swedbank's preferred)
  Custom Domain: diplomas.swedbank.se
  
Function App:
  Name: func-genai-diploma-prod
  Runtime: Node.js 18.x
  Plan: Consumption or Premium
  Region: Same as Static Web App
  
Storage Account:
  Name: stgenaidiplomap01 (must be globally unique)
  Replication: LRS or GRS (based on requirements)
  Tables: certificates
  Containers: certificates
  
Application Insights:
  Name: appi-genai-diploma-prod
  For monitoring and diagnostics
```

### 3. **Security & Compliance Requirements**

#### Authentication & Authorization
```yaml
Current Implementation:
  - Frontend password: GenAITraining2025
  - No backend authentication
  - Session storage in localStorage

Recommended Enhancements:
  - Azure AD integration (SSO)
  - Backend API authentication (Function Keys minimum)
  - JWT tokens for session management
  - Role-based access control (RBAC)
```

#### Data Protection
```yaml
Sensitive Data:
  - Personal Information: Names, emails
  - Diploma IDs and completion dates
  
Required Measures:
  - Enable encryption at rest (Azure default)
  - Enable encryption in transit (HTTPS only)
  - Implement data retention policies
  - GDPR compliance for EU residents
  - Audit logging for all operations
```

### 4. **Network & Access Configuration**

#### CORS Settings
```javascript
// Current CORS configuration in Azure Functions
{
  "cors": {
    "allowedOrigins": [
      "https://proud-beach-08943ae0f.1.azurestaticapps.net",
      "https://diplomas.swedbank.se" // Add after migration
    ]
  }
}
```

#### Firewall Rules
```yaml
Recommended:
  - Restrict Function App to Swedbank IP ranges
  - Enable Azure Private Endpoints if required
  - Configure NSG rules for storage accounts
  - Enable DDoS protection
```

### 5. **Email Service Configuration**

#### Resend API Setup
```yaml
Current Configuration:
  Domain: resend.dev (default)
  From: onboarding@resend.dev
  
Migration Requirements:
  1. Add Swedbank domain to Resend account
  2. Verify domain ownership via DNS
  3. Configure SPF, DKIM, DMARC records
  4. Update sender email to ai.learning@swedbank.se
  5. Test email deliverability
  
Alternative: Consider Azure Communication Services
  - Native Azure service
  - Better integration with Azure AD
  - Compliance with Swedbank policies
```

### 6. **Monitoring & Logging**

#### Application Insights Configuration
```javascript
// Add to Function App
{
  "applicationInsights": {
    "samplingSettings": {
      "isEnabled": true,
      "maxTelemetryItemsPerSecond": 20
    }
  }
}
```

#### Log Analytics Workspace
```yaml
Metrics to Track:
  - Diploma generation success/failure rates
  - Email delivery status
  - API response times
  - Storage usage trends
  - User authentication attempts
  - Error rates and exceptions
```

### 7. **Backup & Disaster Recovery**

#### Backup Strategy
```yaml
Table Storage:
  - Enable point-in-time restore
  - Daily automated backups
  - 30-day retention minimum
  
Blob Storage:
  - Soft delete enabled (30 days)
  - Versioning for PDFs
  - Geo-redundant storage (GRS)
  
Code Repository:
  - GitHub (current)
  - Consider Azure DevOps migration
```

### 8. **Cost Optimization**

#### Estimated Monthly Costs (Swedbank Azure)
```yaml
Static Web App (Standard): ~$9/month
Function App (Consumption): ~$20-50/month (based on usage)
Storage Account: ~$5-10/month
Application Insights: ~$5-10/month
Total Estimate: ~$40-80/month

Cost Optimization Tips:
  - Use consumption plan for Functions
  - Implement auto-scaling rules
  - Archive old diplomas to cool storage
  - Monitor and optimize API calls
```

---

## 📋 Migration Checklist

### Phase 1: Preparation (Week 1)
- [ ] Create Swedbank Azure subscription/resource group
- [ ] Set up Azure DevOps or GitHub integration
- [ ] Document all current configurations
- [ ] Backup all data (Table & Blob storage)

### Phase 2: Infrastructure (Week 2)
- [ ] Create all Azure resources in Swedbank tenant
- [ ] Configure networking and security
- [ ] Set up monitoring and logging
- [ ] Configure custom domain and SSL

### Phase 3: Application Migration (Week 3)
- [ ] Deploy frontend to new Static Web App
- [ ] Deploy backend to new Function App
- [ ] Migrate storage data
- [ ] Update all environment variables
- [ ] Configure CORS and authentication

### Phase 4: Email & DNS (Week 4)
- [ ] Configure DNS records for custom domain
- [ ] Set up email domain in Resend
- [ ] Verify SPF/DKIM/DMARC records
- [ ] Test email deliverability
- [ ] Update sender email address

### Phase 5: Testing & Validation (Week 5)
- [ ] End-to-end testing of diploma generation
- [ ] Email delivery testing
- [ ] Performance testing
- [ ] Security scanning
- [ ] User acceptance testing

### Phase 6: Cutover (Week 6)
- [ ] Final data sync
- [ ] DNS cutover to new domain
- [ ] Monitor for issues
- [ ] Decommission old resources
- [ ] Documentation update

---

## 🔐 Security Considerations

### Current Vulnerabilities
1. **Password in frontend code** - Visible in browser
2. **No backend authentication** - APIs are public
3. **Default email domain** - May trigger spam filters
4. **No rate limiting** - Potential for abuse
5. **localStorage for sessions** - XSS vulnerable

### Recommended Mitigations
```yaml
Short-term:
  - Add API keys to Function App
  - Implement rate limiting
  - Add input validation
  - Enable HTTPS only

Long-term:
  - Implement Azure AD authentication
  - Add backend session management
  - Implement proper RBAC
  - Add audit logging
  - Regular security assessments
```

---

## 📞 Key Contacts & Resources

### Technical Contacts
- **Azure Support**: Swedbank Azure team
- **DNS Management**: Swedbank IT Infrastructure
- **Email/Domain**: Swedbank Communications team
- **Security Review**: Swedbank Security team

### Useful Resources
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions Best Practices](https://docs.microsoft.com/en-us/azure/azure-functions/functions-best-practices)
- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [Azure Migration Checklist](https://docs.microsoft.com/en-us/azure/migrate/)

---

## 🚨 Critical Migration Points

### Must-Have Before Go-Live
1. ✅ Custom domain with SSL certificate
2. ✅ Email domain verification and configuration
3. ✅ All data migrated and verified
4. ✅ Security review completed
5. ✅ Backup and recovery tested
6. ✅ Monitoring and alerting configured
7. ✅ User documentation updated
8. ✅ Support team trained

### Risk Mitigation
- **Parallel running** for 1 week minimum
- **Rollback plan** documented and tested
- **Data validation** scripts prepared
- **Communication plan** for users
- **Incident response** procedures defined

---

## 📝 Notes for Technical Team

### Integration Points
- **Active Directory**: Can integrate for SSO
- **Exchange/O365**: Can use for email sending
- **SharePoint**: Can store PDFs if required
- **Power BI**: Can create analytics dashboards
- **Teams**: Can add notifications

### Compliance Requirements
- **GDPR**: Personal data handling
- **ISO 27001**: Information security
- **Banking Regulations**: Data retention
- **Accessibility**: WCAG 2.1 Level AA

---

*Document Version: 1.0*  
*Last Updated: September 2025*  
*Status: Ready for Technical Review*