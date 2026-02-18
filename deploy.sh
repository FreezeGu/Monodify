#!/bin/bash

# Firebase Deployment Script
# This script ensures a fresh build before deploying

echo "🧹 Cleaning old build..."
rm -rf client/dist

echo "📦 Building client..."
cd client
npm install
npm run build
cd ..

echo "✅ Build complete!"
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo "✨ Deployment complete!"
