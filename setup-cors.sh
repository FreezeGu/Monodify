#!/bin/bash

# Firebase Storage CORS Setup Script
# This script configures CORS for Firebase Storage to allow audio playback

echo "========================================"
echo "Firebase Storage CORS Configuration"
echo "========================================"
echo ""

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    echo "ERROR: gsutil is not found!"
    echo ""
    echo "Please install Google Cloud SDK:"
    echo "1. Download from: https://cloud.google.com/sdk/docs/install"
    echo "2. Or install via npm: npm install -g @google-cloud/storage"
    echo ""
    exit 1
fi

echo "Step 1: Authenticating with Google Cloud..."
echo "Please log in when prompted..."
gcloud auth login

echo ""
echo "Step 2: Setting Firebase project..."
read -p "Enter your Firebase project ID (e.g., monody-nasheeds): " PROJECT_ID
gcloud config set project "$PROJECT_ID"

echo ""
echo "Step 3: Finding Storage bucket..."
echo "Your bucket name is likely: ${PROJECT_ID}.appspot.com"
read -p "Enter bucket name (or press Enter for default): " BUCKET_NAME
if [ -z "$BUCKET_NAME" ]; then
    BUCKET_NAME="${PROJECT_ID}.appspot.com"
fi

echo ""
echo "Step 4: Applying CORS configuration..."
gsutil cors set storage-cors.json "gs://${BUCKET_NAME}"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "SUCCESS! CORS configuration applied."
    echo "========================================"
    echo ""
    echo "Verifying configuration..."
    gsutil cors get "gs://${BUCKET_NAME}"
else
    echo ""
    echo "ERROR: Failed to apply CORS configuration."
    echo "Please check:"
    echo "1. You have Storage Admin permissions"
    echo "2. The bucket name is correct"
    echo "3. You're authenticated: gcloud auth login"
fi

echo ""
