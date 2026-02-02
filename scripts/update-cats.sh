#!/bin/bash

# CATS Application Update Script
# This script pulls the latest code from GitHub and updates both frontend and backend

set -e  # Exit on any error

echo "================================================"
echo "  CATS Application Update Script"
echo "================================================"
echo ""

# Navigate to app directory
cd /home/ubuntu/cats-app

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Update Backend
echo ""
echo "🔧 Updating Backend..."
cd backend

# Install any new dependencies
if [ -f "package.json" ]; then
    echo "  Installing npm packages..."
    npm install
fi

# Restart backend service
echo "  Restarting backend API..."
pm2 restart cats-api

# Update Frontend
echo ""
echo "🎨 Updating Frontend..."
cd ../frontend

# Install any new dependencies
if [ -f "package.json" ]; then
    echo "  Installing npm packages..."
    npm install
fi

# Build production frontend
echo "  Building production bundle..."
npm run build

# Deploy to web directory
echo "  Deploying to web server..."
sudo cp -r build/* /var/www/cats/

# Update Database (if schema changed)
echo ""
echo "💾 Checking for database updates..."
cd ../database
if [ -f "schema.sql" ]; then
    read -p "  Do you want to update the database schema? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "  Updating database schema..."
        psql -U cats_user -d cats_db -h localhost -f schema.sql
    else
        echo "  Skipping database update."
    fi
fi

echo ""
echo "================================================"
echo "✅ CATS application updated successfully!"
echo "================================================"
echo ""
echo "Services status:"
pm2 status

echo ""
echo "You can view logs with: pm2 logs cats-api"
