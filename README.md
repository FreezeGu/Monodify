# Monody — Nasheeds with liquid glass

A Spotify-style app for nasheeds with a **liquid glass** UI, custom backgrounds, featured artists, uploads, and an Apple Music–style full-screen player with live subtitles.

## Features

- **Liquid glass design** — Glassmorphism with backdrop blur and optional SVG distortion (inspired by [freefrontend.com/css-liquid-glass](https://freefrontend.com/css-liquid-glass/)).
- **Custom + default backgrounds** — Upload your own image (stored on Imgur) or pick a default; the whole app overlays as liquid glass on top.
- **Home** — Featured artists and playlists; tap to open the player.
- **Profile** — Public profile (name, handle, bio); stored locally (account sync coming later).
- **Upload** — Pick an audio file; metadata and artwork are read in the browser and the track plays in the app.
- **Full-screen player** — Apple-style slide-up from the bottom (Framer Motion), liquid glass card, progress bar, play/pause, and **live subtitles** toggle (placeholder for AI subtitles).
- **Mobile-first** — Safe area insets, touch-friendly, feels like a native iOS app.

## Tech

- **Frontend:** React 18, React Router, Framer Motion, Vite.
- **Backend:** Express (serves built React app + static assets).
- **No FFmpeg** — Metadata/artwork via jsmediatags in the browser; playback via blob URLs.
- **ImgBB API** — Custom backgrounds are uploaded to ImgBB for permanent storage.

## Run

### Option A — Development (React dev server + API proxy)

1. **Backend (API):**
   ```bash
   npm install
   npm start
   ```
   Server runs at `http://127.0.0.1:6969`.

2. **Frontend (Monody):**
   ```bash
  cd client
  npm install
  npm run dev
  ```
   App runs at `http://localhost:5173`. Vite proxies `/api` and `/static` to the server.

3. **ImgBB API (Optional):**
   - The app includes a default ImgBB API key for image uploads.
   - For production or higher rate limits, get your own API key:
     1. Go to https://api.imgbb.com/
     2. Sign up and get your free API key
     3. Create a `.env` file in the `client` folder: `VITE_IMGBB_API_KEY=your_api_key_here`

### Option B — Production (single server)

1. **Build the client:**
   ```bash
  npm run build
  ```
   (Installs client deps and runs `vite build`.)

2. **Start the server:**
   ```bash
  npm start
  ```
   Open `http://127.0.0.1:6969`. The server serves the built React app from `client/dist`.

If you don’t build the client, the server still runs and serves the legacy liquid glass player at `/`.

## Project layout

- `client/` — React (Vite) app: Home, Profile, Upload, MiniPlayer, FullScreenPlayer.
- `server.js` — Express: static files, optional `client/dist` SPA, `/api` routes.
- `static/` — Shared assets (e.g. legacy player).
- `public/` — Legacy player HTML (used when `client/dist` is missing).

## Liquid glass variants (CSS)

- `.glass` — Base blur + border.
- `.glass-card` — Rounded panel with stronger blur.
- `.glass-bar` — Nav / bottom bar.
- `.glass-distort` — Blur + border for the full-screen player (can be combined with SVG filters).

SVG filters (e.g. `#liquid-distortion`) are defined in the app for distortion-style glass where needed.
