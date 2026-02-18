# Deploying the latest version to Firebase Hosting

If the live site doesn’t show your latest changes, use a **clean build** then deploy.

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

1. **Clean and build the client**
   - Delete the folder `client/dist` (if it exists).
   - In a terminal:
     ```bash
     cd client
     npm install
     npm run build
     cd ..
     ```
2. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

## After deploying

- **Hard refresh** the site: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac).
- Or open the site in an **incognito/private** window.
- Firebase’s CDN can take 1–2 minutes to update; wait a bit and refresh again if needed.

## Don’t

- Run only `firebase deploy` without building first — that deploys whatever is already in `client/dist`, which may be old.
- Rely on `npm run build` without deleting `client/dist` first if you’re unsure; `npm run deploy` or `deploy.bat` do a clean build for you.
