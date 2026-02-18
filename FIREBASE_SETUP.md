# Firebase Setup Guide

## Prerequisites

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

## Step 1: Get Firebase Configuration

1. Go to Firebase Console > Project Settings > General
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app (you can skip hosting for now)
5. Copy the Firebase configuration object

## Step 2: Set Environment Variables

Create `client/.env` file (copy from `client/.env.example`):

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 3: Enable Authentication

1. Go to Firebase Console > Authentication
2. Click "Get started"
3. Enable **"Email/Password"** sign-in method
4. Enable **"Google"** sign-in method:
   - Click on "Google"
   - Toggle "Enable"
   - Set your project support email (required)
   - Click "Save"
5. Save all changes

## Step 4: Create Firestore Database

1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Start in **test mode** for development (or production mode with rules below)
4. Choose a location (closest to your users)
5. Click "Enable"

## Step 5: Set Firestore Security Rules

Go to Firestore Database > Rules tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read any profile, write only their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Nasheeds: public read for approved, authenticated write
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

**Note:** For production, you'll need to create a Firestore index for the compound query in Featured.jsx:
- Collection: `nasheeds`
- Fields: `status` (Ascending), `uploadedAt` (Descending)

## Step 6: Set Up Storage

1. Go to Firebase Console > Storage
2. Click "Get started"
3. Start in **test mode** for development (or production mode with rules below)
4. Choose a location (same as Firestore)
5. Click "Done"

## Step 7: Set Storage Security Rules

Go to Storage > Rules tab and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Nasheeds: public read, authenticated users can upload
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

## Step 8: Create Firestore Index (Optional but Recommended)

For better performance on the Featured page:

1. Go to Firestore Database > Indexes
2. Click "Create Index"
3. Collection ID: `nasheeds`
4. Fields:
   - `status` (Ascending)
   - `uploadedAt` (Descending)
5. Click "Create"

## Step 9: Make a User Admin (Optional)

To grant admin privileges:

1. Go to Firestore Database > Data
2. Navigate to `users/{userId}`
3. Add/edit field: `admin` = `true` (boolean)

Or do it programmatically after creating the user document.

## Testing

1. Run the app: `cd client && npm run dev`
2. Sign up with a test account
3. Upload a nasheed (it will be pending)
4. Set yourself as admin in Firestore
5. Go to Admin Panel and approve the nasheed
6. It should appear in Featured tab

## Troubleshooting

- **"Missing or insufficient permissions"**: Check Firestore rules
- **"Index required"**: Create the compound index mentioned above
- **Upload fails**: Check Storage rules and file size limits
- **Auth errors**: Ensure Email/Password is enabled in Authentication
