# Deploying the latest version to Firebase Hosting

If the live site doesn’t show your latest changes, **always do a clean build first**, then deploy.

## Important: don’t run only `firebase deploy`

Running just `firebase deploy` uploads whatever is **already** in `client/dist`. If you haven’t rebuilt recently, that’s an **old** build, so the live site stays on the old version. **Always use one of the options below** so a fresh build is created before deploy.

---

## Option 1: From project root (recommended)

```bash
npm run deploy
```

This will:

1. Delete `client/dist` (works on Windows and Mac/Linux)
2. Install client deps and run a fresh `npm run build` in `client`
3. Run `firebase deploy --only hosting`

## Option 2: Windows – use the batch file

```cmd
deploy.bat
```

This cleans `client\dist`, builds the client, then deploys.

## Option 3: Manual steps

1. **Delete** the folder `client/dist` completely (if it exists).
2. **Build:**
   ```bash
   cd client
   npm install
   npm run build
   cd ..
   ```
3. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

---

## How to verify the new version is live

1. Open your Hosting URL (e.g. `https://monody-nasheeds.web.app`).
2. **Hard refresh:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac).  
   Or open the site in an **incognito/private** window.
3. Open **Developer Tools** (F12) → **Console** tab.  
   You should see: `Monodify build: 2025-02-15T12-30-00` (or similar).  
   That timestamp is from when the app was **built**; if it matches your latest deploy, the new version is loading.
4. Alternatively, **View Page Source** (Ctrl+U) and look at the `<meta name="version" content="...">` tag. That value is the same build id.

If you still see an old build id after a few minutes, wait 1–2 minutes for Firebase’s CDN to update, then hard refresh again.
