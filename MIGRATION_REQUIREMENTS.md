# Migration Requirements - Priority Checklist

## 🔴 CRITICAL - Must Fix Before Production

### 1. Email Domain Configuration
**Current Issue**: Using `onboarding@resend.dev` (default test domain)

**Required Actions**:
```bash
1. Add domain to Resend account:
   - Domain: swedbank.se
   - Subdomain: mail.swedbank.se (for email sending)

2. DNS Records to Add (in Swedbank DNS):
   # SPF Record
   Type: TXT
   Name: @
   Value: "v=spf1 include:resend.io ~all"
   
   # DKIM Records (provided by Resend after domain add)
   Type: TXT  
   Name: resend._domainkey
   Value: [Provided by Resend]
   
   # DMARC Record
   Type: TXT
   Name: _dmarc
   Value: "v=DMARC1; p=quarantine; rua=mailto:security@swedbank.se"

3. Update Environment Variables:
   SENDER_EMAIL=ai.learning@swedbank.se
```

### 2. Custom Domain for Web Application
**Current URL**: https://proud-beach-08943ae0f.1.azurestaticapps.net

**Required Actions**:
```bash
1. Register subdomain:
   diplomas.swedbank.se or training.swedbank.se

2. DNS Configuration:
   Type: CNAME
   Name: diplomas
   Value: proud-beach-08943ae0f.1.azurestaticapps.net
   
3. SSL Certificate:
   - Automatic via Azure Static Web Apps
   - Or provide Swedbank wildcard cert
```

### 3. API Security
**Current Issue**: APIs are publicly accessible without authentication

**Quick Fix**:
```javascript
// Add to Azure Function App Configuration
"AzureWebJobsSecretStorageType": "files"
"AuthorizationLevel": "function"

// Generate API Key in Azure Portal
// Update frontend to include key in headers:
headers: {
  'x-functions-key': 'YOUR_FUNCTION_KEY'
}
```

---

## 🟡 IMPORTANT - Should Fix Soon

### 4. Authentication Upgrade
**Current**: Password stored in frontend code (GenAITraining2025)

**Options**:
```yaml
Option A - Azure AD Integration:
  - Use Swedbank's existing Azure AD
  - SSO for employees
  - No password management
  
Option B - Backend Authentication:
  - Move password check to backend
  - Use secure session tokens
  - Implement proper logout
```

### 5. Data Residency & Compliance
**Requirements**:
```yaml
Storage Location:
  - Must be in EU (GDPR)
  - Preferred: North Europe region
  
Data Retention:
  - Define retention period (e.g., 2 years)
  - Implement auto-deletion
  - Audit trail for deletions
```

### 6. Monitoring & Alerts
**Setup Required**:
```javascript
// Application Insights
{
  "ConnectionString": "InstrumentationKey=xxx",
  "EnableDependencyTracking": true,
  "EnablePerformanceCounters": true
}

// Alert Rules
- Diploma generation failures > 5 in 5 minutes
- Email delivery failures > 10 in 10 minutes
- API response time > 3 seconds
- Storage usage > 80%
```

---

## 🟢 NICE TO HAVE - Can Implement Later

### 7. Advanced Features
- **Bulk diploma generation** from CSV
- **Template management** for different programs
- **Analytics dashboard** in Power BI
- **Teams integration** for notifications
- **API rate limiting** to prevent abuse

### 8. Cost Optimizations
- **Archive old diplomas** to cool storage
- **Implement caching** for frequently accessed data
- **Auto-scaling rules** for Function App
- **Reserved capacity** for predictable workloads

---

## 📊 Resource Sizing Estimates

Based on expected usage (100-500 diplomas/month):

```yaml
Static Web App:
  Tier: Standard
  Bandwidth: ~10 GB/month
  
Function App:
  Plan: Consumption (pay-per-use)
  Executions: ~2,000/month
  Memory: 512 MB per execution
  
Storage:
  Tables: ~1 GB
  Blobs: ~500 MB (PDFs)
  Transactions: ~10,000/month
  
Total Estimated Cost: $50-100/month
```

---

## 🚀 Migration Timeline

### Week 1-2: Infrastructure Setup
- [ ] Create Azure resources in Swedbank tenant
- [ ] Configure networking and security groups
- [ ] Set up CI/CD pipelines
- [ ] Configure monitoring

### Week 3: Application Deployment
- [ ] Deploy code to new environment
- [ ] Migrate existing data
- [ ] Configure environment variables
- [ ] Test all functionality

### Week 4: Domain & Email
- [ ] Configure DNS records
- [ ] Verify email domain
- [ ] Test email delivery
- [ ] Update documentation

### Week 5: Testing & Validation
- [ ] Security testing
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Disaster recovery test

### Week 6: Go-Live
- [ ] Production cutover
- [ ] Monitor closely
- [ ] Address any issues
- [ ] Decommission old environment

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Email delivery issues | High | Test thoroughly with Swedbank email filters |
| DNS propagation delays | Medium | Plan cutover during low-usage period |
| Data migration errors | High | Validate all records, keep backups |
| Authentication changes | Medium | Communicate to users, provide support |
| API compatibility | Low | Test all endpoints before cutover |

---

## 📝 Contact Information Needed

From Swedbank IT Team:
1. **Azure Subscription ID** and resource group name
2. **DNS administrator** contact for record changes
3. **Email administrator** for domain verification
4. **Security team** for compliance review
5. **Network team** for firewall rules

---

## ✅ Pre-Migration Validation

Run these checks before migration:

```bash
# Check current data count
Table Storage: 
- Total records: [Check in Azure Portal]
- Oldest record: [Note date]

Blob Storage:
- Total PDFs: [Count]
- Total size: [Size in MB]

# Test email delivery
Send test email to:
- Internal address: test@swedbank.se
- External address: gmail/outlook test

# Performance baseline
- Average diploma generation: [X seconds]
- Average PDF size: [X KB]
- API response times: [X ms]
```

---

*This document should be reviewed with Swedbank's:*
- **Security Team** - For compliance and security requirements
- **Infrastructure Team** - For Azure and DNS configuration  
- **Email Team** - For email domain and delivery setup
- **Development Team** - For code migration and testing