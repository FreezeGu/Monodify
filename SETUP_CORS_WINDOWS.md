# Firebase Storage CORS Setup for Windows

## Quick Method: Install Google Cloud SDK

### Option 1: Install via Installer (Easiest)

1. **Download Google Cloud SDK for Windows:**
   - Go to: https://cloud.google.com/sdk/docs/install-sdk#windows
   - Download the installer (`.exe` file)

2. **Run the installer:**
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option

3. **Open a NEW PowerShell/Command Prompt** (important - restart terminal after installation)

4. **Run the setup script:**
   ```powershell
   .\setup-cors.bat
   ```

### Option 2: Install via npm (Alternative)

```powershell
# Install Google Cloud SDK tools via npm
npm install -g @google-cloud/storage

# Then use gsutil (may need to add to PATH)
```

### Option 3: Use Firebase CLI with gcloud (If Firebase CLI is installed)

If you have Firebase CLI installed, you can try:

```powershell
# Install gcloud component
firebase login:ci
# Then follow Firebase Console method below
```

## Alternative: Configure via Firebase Console (Manual)

Unfortunately, **CORS cannot be configured through Firebase Console UI**. You must use `gsutil`.

However, you can use **Firebase Extensions** or configure it programmatically.

## Programmatic Method (Using Node.js)

Create a script to set CORS:

```javascript
// set-cors.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: 'monody-nasheeds', // Your project ID
  keyFilename: 'path/to/service-account-key.json' // Optional: service account
});

async function setCORS() {
  const bucket = storage.bucket('monody-nasheeds.appspot.com');
  
  await bucket.setCorsConfiguration([
    {
      origin: [
        'https://monody-nasheeds.web.app',
        'https://monody-nasheeds.firebaseapp.com',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ],
      method: ['GET', 'HEAD'],
      responseHeader: [
        'Content-Type',
        'Content-Range',
        'Content-Length',
        'Access-Control-Allow-Origin'
      ],
      maxAgeSeconds: 3600
    }
  ]);
  
  console.log('CORS configuration set successfully!');
}

setCORS().catch(console.error);
```

Run with:
```powershell
node set-cors.js
```

## Simplest Solution: Install Google Cloud SDK

**Recommended steps:**

1. Download installer: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Install with "Add to PATH" checked
3. Restart your terminal/PowerShell
4. Run: `.\setup-cors.bat`

This is the most reliable method for configuring Firebase Storage CORS.
