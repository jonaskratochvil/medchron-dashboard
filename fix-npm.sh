#!/bin/bash

echo "This script will fix npm permissions"
echo "You'll be prompted for your password"
echo ""

# Remove the problematic npm cache
echo "Removing npm cache with sudo..."
sudo rm -rf ~/.npm

# Install dependencies using npx with temporary cache
echo ""
echo "Installing dependencies..."
cd /Users/jonaskratochvil/medchron-dashboard
npx --cache /tmp/npm-cache vite@latest

echo ""
echo "Done! Now you can run: npm run dev"