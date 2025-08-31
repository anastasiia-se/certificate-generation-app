#!/bin/bash

echo "Checking Azure Resources for Certificate App..."
echo "=============================================="

# Check for Static Web Apps
echo -e "\n📱 Static Web Apps:"
az staticwebapp list --query "[?contains(name, 'cert') || contains(name, 'salmon') || contains(repositoryUrl, 'certificate')].{Name:name, URL:defaultHostname, Repo:repositoryUrl}" -o table 2>/dev/null || echo "No Static Web Apps found or Azure CLI not configured"

# Check for Function Apps  
echo -e "\n⚡ Function Apps:"
az functionapp list --query "[?contains(name, 'cert')].{Name:name, URL:defaultHostName, State:state, ResourceGroup:resourceGroup}" -o table 2>/dev/null || echo "No Function Apps found or Azure CLI not configured"

# Check all Function Apps (in case name doesn't contain 'cert')
echo -e "\n⚡ All Function Apps:"
az functionapp list --query "[].{Name:name, URL:defaultHostName, State:state}" -o table 2>/dev/null || echo "No Function Apps found"

echo -e "\n🔍 To get more details about a specific app, run:"
echo "az staticwebapp show --name <app-name>"
echo "az functionapp show --name <function-app-name> --resource-group <rg-name>"