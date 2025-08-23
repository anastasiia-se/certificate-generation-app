#!/bin/bash

# Azure CLI deployment script for Certificate Generation App
# This script sets up everything needed for Azure Static Web Apps Standard tier

set -e

echo "🚀 Starting Azure CLI deployment for Certificate App..."

# Configuration
RESOURCE_GROUP="rg-certificate-app"
LOCATION="East US 2"
STATIC_WEB_APP_NAME="certificate-app-$(date +%s)"
STORAGE_ACCOUNT_NAME="certstore$(date +%s | cut -c6-10)"
COSMOSDB_ACCOUNT_NAME="cert-cosmos-$(date +%s | cut -c6-10)"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Static Web App: $STATIC_WEB_APP_NAME"
echo "  Storage Account: $STORAGE_ACCOUNT_NAME"
echo "  Cosmos DB: $COSMOSDB_ACCOUNT_NAME"

# Step 1: Login and set subscription
echo "🔐 Logging into Azure..."
az login
az account list --output table
read -p "Enter subscription ID to use: " SUBSCRIPTION_ID
az account set --subscription $SUBSCRIPTION_ID

# Step 2: Create Resource Group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Step 3: Create Storage Account for certificates
echo "💾 Creating storage account..."
az storage account create \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2

# Create container for certificates
echo "📁 Creating storage container..."
STORAGE_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP --account-name $STORAGE_ACCOUNT_NAME --query '[0].value' -o tsv)
az storage container create \
  --name certificates \
  --account-name $STORAGE_ACCOUNT_NAME \
  --account-key $STORAGE_KEY \
  --public-access off

# Step 4: Create Cosmos DB for certificate records
echo "🌐 Creating Cosmos DB..."
az cosmosdb create \
  --name $COSMOSDB_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --locations regionName="$LOCATION" failoverPriority=0 isZoneRedundant=False

az cosmosdb sql database create \
  --account-name $COSMOSDB_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --name CertificatesDB

az cosmosdb sql container create \
  --account-name $COSMOSDB_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --database-name CertificatesDB \
  --name certificates \
  --partition-key-path "/certificateId"

# Step 5: Create Static Web App
echo "🌐 Creating Static Web App..."
az staticwebapp create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku Standard

# Step 6: Get connection strings
echo "🔗 Getting connection strings..."
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --resource-group $RESOURCE_GROUP --name $STORAGE_ACCOUNT_NAME --query connectionString -o tsv)
COSMOS_CONNECTION_STRING=$(az cosmosdb keys list --resource-group $RESOURCE_GROUP --name $COSMOSDB_ACCOUNT_NAME --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv)

# Step 7: Set application settings
echo "⚙️ Configuring application settings..."
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --setting-names \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    COSMOS_DB_CONNECTION_STRING="$COSMOS_CONNECTION_STRING" \
    SENDGRID_API_KEY="your-sendgrid-key-here"

echo "✅ Azure resources created successfully!"
echo ""
echo "📋 Summary:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Static Web App: $STATIC_WEB_APP_NAME"
echo "  Storage Account: $STORAGE_ACCOUNT_NAME" 
echo "  Cosmos DB: $COSMOSDB_ACCOUNT_NAME"
echo ""
echo "🔗 Static Web App URL: https://$STATIC_WEB_APP_NAME.azurestaticapps.net"
echo ""
echo "📝 Next steps:"
echo "1. Build your React app: cd certificate-app-frontend && npm run build"
echo "2. Deploy: az staticwebapp deploy --name $STATIC_WEB_APP_NAME --app-location ./certificate-app-frontend/build --api-location ./C:GenAI_Certificate_SWE_APPcertificate-app-v2"
echo "3. Update SendGrid API key in Azure portal"
echo ""
echo "🎉 Ready for deployment!"