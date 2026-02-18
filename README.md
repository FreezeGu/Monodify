# Monodify — Nasheeds with liquid glass

A Spotify-style app for nasheeds with a **liquid glass** UI, custom backgrounds, featured artists, uploads, and an Apple Music–style full-screen player with live subtitles.

## Features

- **Liquid glass design** — Glassmorphism with backdrop blur and optional SVG distortion (inspired by [freefrontend.com/css-liquid-glass](https://freefrontend.com/css-liquid-glass/)).
- **Firebase Authentication** — Sign up and log in with email/password.
- **Firebase Firestore** — User profiles, settings, preferences, and backgrounds stored in `/users` collection.
- **Firebase Storage** — Music files stored in `/nasheeds/{userId}/` and images in `/nasheeds/{userId}/`.
- **Custom + default backgrounds** — Upload your own image (stored on ImgBB) or pick a default; backgrounds sync to Firebase.
- **Featured Tab** — Discover nasheeds with search, recommendations, new releases, and popular artists.
- **Playlists Tab** — Create playlists, manage liked songs, and organize your library.
- **Profile** — Edit profile, view public playlists, upload nasheeds, and customize background.
- **Nasheed Upload** — Multi-step form with audio, image, subtitles, translation, author info, and genre selection.
- **Admin Panel** — Moderate uploaded nasheeds (approve/reject) for users with `admin: true` in their profile.
- **Recommendation Algorithm** — Personalized recommendations based on listening history, genre preferences, and popularity.
- **Full-screen player** — Apple-style slide-up from the bottom (Framer Motion), liquid glass card, progress bar, play/pause, and synchronized subtitles.
- **Mobile-first** — Safe area insets, touch-friendly, feels like a native iOS app.

## Tech

- **Frontend:** React 18, React Router, Framer Motion, Vite.
- **Backend:** Express (serves built React app + static assets).
- **Firebase:** Authentication, Firestore (user data, nasheeds), Storage (audio/images).
- **No FFmpeg** — Metadata/artwork via jsmediatags in the browser; playback via Firebase Storage URLs.
- **ImgBB API** — Custom backgrounds are uploaded to ImgBB for permanent storage.

## Run

### Option A — Development (React dev server + API proxy)

1. **Backend (API):**
   ```bash
   npm install
   npm start
   ```
   Server runs at `http://127.0.0.1:6969`.

2. **Frontend (Monodify):**
   ```bash
  cd client
  npm install
  npm run dev
  ```
   App runs at `http://localhost:5173`. Vite proxies `/api` and `/static` to the server.

3. **Environment Variables:**
   - Create a `.env` file in the `client` folder (copy from `.env.example`):
   ```bash
   cd client
   cp .env.example .env
   ```
   
   - **ImgBB API (Optional):**
     - The app includes a default ImgBB API key for image uploads.
     - For production or higher rate limits, get your own API key:
       1. Go to https://api.imgbb.com/
       2. Sign up and get your free API key
       3. Add to `.env`: `VITE_IMGBB_API_KEY=your_api_key_here`
   
   - **Firebase Configuration (Required):**
     1. Go to https://console.firebase.google.com/
     2. Create a new project or use an existing one
     3. Enable Authentication (Email/Password)
     4. Create a Firestore database (start in test mode for development)
     5. Enable Storage (set up rules for `/nasheeds/{userId}/{allFiles}` and `/users/{userId}/{allFiles}`)
     6. Go to Project Settings > General > Your apps > Web app
     7. Copy the Firebase config values
     8. Add to `.env`:
        ```
        VITE_FIREBASE_API_KEY=your-api-key
        VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your-project-id
        VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
        VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
        VITE_FIREBASE_APP_ID=your-app-id
        ```

4. **Firebase Security Rules (Firestore):**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own profile
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Nasheeds: public read, authenticated write
       match /nasheeds/{nasheedId} {
         allow read: if resource.data.status == 'approved' || request.auth != null;
         allow create: if request.auth != null;
         allow update: if request.auth != null && 
           (request.auth.uid == resource.data.uploadedBy || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true);
       }
       
       // Playlists: users can manage their own
       match /playlists/{playlistId} {
         allow read: if resource.data.public == true || request.auth.uid == resource.data.userId;
         allow write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

5. **Firebase Storage Rules:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Nasheeds: authenticated users can upload, public can read approved
       match /nasheeds/{userId}/{allPaths=**} {
         allow read: if true; // Public read for approved nasheeds
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // User backgrounds: users can manage their own
       match /users/{userId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

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

- `client/` — React (Vite) app:
  - `src/pages/` — Featured, Playlists, Profile, UploadNasheed, AdminPanel
  - `src/components/` — MiniPlayer, FullScreenPlayer, ScreenLayout, BottomTabBar, etc.
  - `src/context/` — AuthContext, PlayerContext, BackgroundContext, TabNavigationContext
  - `src/config/` — Firebase config, ImgBB config
  - `src/utils/` — Recommendation algorithm
- `server.js` — Express: static files, optional `client/dist` SPA, `/api` routes.
- `static/` — Shared assets (e.g. legacy player).
- `public/` — Legacy player HTML (used when `client/dist` is missing).

## Firebase Collections Structure

- **`users/{userId}`** — User profiles:
  - `name`, `handle`, `bio`, `background`, `admin` (boolean), `createdAt`
  
- **`nasheeds/{nasheedId}`** — Nasheed metadata:
  - `title`, `artist`, `isAuthor`, `authorName`, `genre`, `description`
  - `audioUrl` (Firebase Storage), `imageUrl` (Firebase Storage)
  - `subtitles` (array of `{time, text, translation}`)
  - `status` ('pending', 'approved', 'rejected')
  - `uploadedBy` (userId), `uploadedAt`, `views`, `likes`

- **`playlists/{playlistId}`** — User playlists:
  - `title`, `userId`, `public` (boolean), `songCount`, `imageUrl`, `nasheedIds` (array)

## Liquid glass variants (CSS)

- `.glass` — Base blur + border.
- `.glass-card` — Rounded panel with stronger blur.
- `.glass-bar` — Nav / bottom bar.
- `.glass-distort` — Blur + border for the full-screen player (can be combined with SVG filters).

SVG filters (e.g. `#liquid-distortion`) are defined in the app for distortion-style glass where needed.
# liquid-glass-music-player-main
