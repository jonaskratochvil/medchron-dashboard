#!/bin/bash

echo "MedChron Dashboard Setup Script"
echo "================================"
echo ""

# Fix npm permissions
echo "Fixing npm permissions..."
sudo chown -R $(whoami) ~/.npm

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Start the development server
echo ""
echo "Starting development server..."
echo "The application will be available at http://localhost:5173"
echo ""
npm run dev