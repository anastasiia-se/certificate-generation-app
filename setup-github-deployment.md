# GitHub Actions Deployment Setup

## Prerequisites
1. GitHub repository for your code
2. Azure CLI installed and logged in
3. Azure Static Web Apps resource created

## Setup Steps

### 1. Create GitHub Repository
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
gh repo create certificate-generation-app --public
git remote add origin https://github.com/yourusername/certificate-generation-app.git
git push -u origin main
```

### 2. Create Static Web App with GitHub Integration
```bash
# Create Static Web App connected to GitHub
az staticwebapp create \
  --name "certificate-app-github" \
  --resource-group "rg-certificate-app" \
  --source "https://github.com/yourusername/certificate-generation-app" \
  --location "East US 2" \
  --branch "main" \
  --app-location "/certificate-app-frontend" \
  --api-location "/api" \
  --output-location "build" \
  --sku "Standard"
```

### 3. Configure GitHub Secrets
The Azure CLI command above automatically:
- Creates the GitHub workflow file
- Adds the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret to your repository

### 4. Environment Variables in Azure Portal
Set these in Azure Portal > Static Web App > Configuration:
- `AZURE_STORAGE_CONNECTION_STRING`
- `COSMOS_DB_CONNECTION_STRING` 
- `SENDGRID_API_KEY`

### 5. Automatic Deployment
Every push to `main` branch will:
1. Build the React frontend
2. Package the Azure Functions API
3. Deploy both to Azure Static Web Apps
4. Run any tests (if configured)

## Benefits of GitHub Actions Approach
✅ **Automatic deployments** on every push
✅ **Pull request previews** for testing
✅ **Rollback capabilities** via git history  
✅ **CI/CD pipeline** with testing
✅ **Team collaboration** via pull requests
✅ **Deployment history** and logs