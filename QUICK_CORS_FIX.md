# Quick CORS Fix for Firebase Storage

## The Problem
Audio files are blocked by CORS policy. Firebase Storage needs CORS headers configured.

## Easiest Solution: Use Service Account Key

### Step 1: Get Service Account Key
1. Go to: https://console.firebase.google.com/project/monody-nasheeds/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Save the downloaded JSON file (e.g., `firebase-key.json`) in your project root

### Step 2: Set Environment Variable
In PowerShell:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\gonem\Downloads\Monodify liquig glass\liquid-glass-music-player-main\firebase-key.json"
```

### Step 3: Run CORS Setup
```powershell
npm install @google-cloud/storage
node set-cors.js
```

That's it! CORS will be configured.

---

## Alternative: Install Google Cloud SDK

1. **Download**: https://cloud.google.com/sdk/docs/install-sdk#windows
2. **Install** with "Add to PATH" checked
3. **Restart** your terminal/PowerShell
4. **Run**:
   ```powershell
   gcloud auth login
   gcloud config set project monody-nasheeds
   gsutil cors set storage-cors.json gs://monody-nasheeds.appspot.com
   ```

---

## Verify It Worked

After running the setup, test by playing an audio file. The CORS error should be gone!
