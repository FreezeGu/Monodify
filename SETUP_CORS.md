# Firebase Storage CORS Configuration

## Problem
Audio files from Firebase Storage are blocked by CORS policy when accessed from your deployed domain.

## Solution
Configure CORS headers for Firebase Storage using `gsutil`.

## Steps

### Option 1: Using gsutil (Recommended)

1. **Install Google Cloud SDK** (if not already installed):
   - Download from: https://cloud.google.com/sdk/docs/install
   - Or use: `npm install -g @google-cloud/storage`

2. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   ```

3. **Set your Firebase project**:
   ```bash
   gcloud config set project monody-nasheeds
   ```
   (Replace `monody-nasheeds` with your actual Firebase project ID)

4. **Apply CORS configuration**:
   ```bash
   gsutil cors set storage-cors.json gs://monody-nasheeds.appspot.com
   ```
   (Replace `monody-nasheeds.appspot.com` with your actual Storage bucket name)

5. **Verify CORS configuration**:
   ```bash
   gsutil cors get gs://monody-nasheeds.appspot.com
   ```

### Option 2: Using Firebase CLI (Alternative)

If you have Firebase CLI installed:

```bash
# Install gsutil if needed
npm install -g @google-cloud/storage

# Set CORS
gsutil cors set storage-cors.json gs://YOUR_BUCKET_NAME.appspot.com
```

### Option 3: Using Firebase Console (Manual)

1. Go to Firebase Console → Storage
2. Click on the "Rules" tab
3. Note: CORS cannot be configured through the console UI, you must use gsutil

## Finding Your Bucket Name

Your Firebase Storage bucket name is usually:
- `YOUR_PROJECT_ID.appspot.com` (default)
- Or check Firebase Console → Storage → Files → URL format

## Troubleshooting

If you get permission errors:
1. Make sure you're authenticated: `gcloud auth login`
2. Make sure you have Storage Admin permissions in Firebase
3. Try: `gcloud auth application-default login`

## After Configuration

Once CORS is configured, your audio files should load without CORS errors. The configuration allows:
- GET and HEAD requests
- From your deployed domains
- With proper CORS headers
