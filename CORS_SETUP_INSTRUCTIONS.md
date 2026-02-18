# CORS Setup Instructions - Step by Step

## ⚠️ IMPORTANT: CORS must be configured for audio playback to work!

The CORS error you're seeing means Firebase Storage is blocking cross-origin requests. This MUST be fixed using one of the methods below.

---

## 🚀 Method 1: Service Account Key (EASIEST - No Google Cloud SDK needed)

### Step 1: Get Service Account Key
1. Go to: https://console.firebase.google.com/project/monody-nasheeds/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Save the downloaded JSON file in your project root as `firebase-key.json`

### Step 2: Set Environment Variable
Open PowerShell in your project directory and run:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\gonem\Downloads\Monodify liquig glass\liquid-glass-music-player-main\firebase-key.json"
```

**Important:** Use the FULL path to the JSON file!

### Step 3: Install Package and Run Script
```powershell
npm install @google-cloud/storage
node set-cors.js
```

You should see: `✅ CORS configuration set successfully!`

### Step 4: Test
Refresh your app and try playing an audio file. The CORS error should be gone!

---

## 🔧 Method 2: Google Cloud SDK (Alternative)

### Step 1: Install Google Cloud SDK
1. Download: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Run the installer
3. **IMPORTANT:** Check "Add to PATH" during installation
4. Restart your terminal/PowerShell

### Step 2: Authenticate
```powershell
gcloud auth login
```

### Step 3: Set Project and Configure CORS
```powershell
gcloud config set project monody-nasheeds
gsutil cors set storage-cors.json gs://monody-nasheeds.appspot.com
```

### Step 4: Verify
```powershell
gsutil cors get gs://monody-nasheeds.appspot.com
```

---

## ❓ Troubleshooting

### "Could not load the default credentials"
- Make sure you set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Use the FULL path to the JSON file
- Restart your terminal after setting the variable

### "Bucket does not exist"
- Check your bucket name in Firebase Console → Storage
- Update `BUCKET_NAME` in `set-cors.js` if different

### "Permission denied"
- Make sure your Google account has Storage Admin permissions
- Go to Firebase Console → IAM & Admin → IAM
- Ensure your account has "Storage Admin" role

---

## ✅ After CORS is Configured

Once CORS is set up, audio files will load without errors. The configuration allows:
- ✅ GET requests from your deployed domain
- ✅ Audio playback from Firebase Storage
- ✅ No more CORS errors!

---

**Need help?** The easiest method is Method 1 (Service Account Key). It takes about 2 minutes!
