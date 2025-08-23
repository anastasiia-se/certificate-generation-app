#!/bin/bash

# App deployment script - deploys built application to existing Static Web App
set -e

echo "🚀 Deploying Certificate Generation App..."

# Get Static Web App name from user
read -p "Enter your Static Web App name: " STATIC_WEB_APP_NAME

# Step 1: Build React frontend
echo "🏗️ Building React frontend..."
cd certificate-app-frontend
npm install
npm run build
cd ..

# Step 2: Build Azure Functions (if needed)
echo "🔧 Preparing Azure Functions..."
cd api
npm install
cd ..

# Step 3: Deploy to Azure Static Web Apps
echo "📤 Deploying to Azure..."
az staticwebapp deploy \
  --name $STATIC_WEB_APP_NAME \
  --app-location "./certificate-app-frontend/build" \
  --api-location "./api" \
  --skip-api-build true

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$STATIC_WEB_APP_NAME.azurestaticapps.net"