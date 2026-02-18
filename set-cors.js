// Firebase Storage CORS Configuration Script
// Run with: node set-cors.js
// Requires: npm install @google-cloud/storage

const { Storage } = require('@google-cloud/storage');

// Configuration - UPDATE THESE IF YOUR PROJECT/BUCKET NAMES ARE DIFFERENT
const PROJECT_ID = 'monody-nasheeds'; // Your Firebase project ID
// Your Storage bucket name - from your audio URL:
// https://firebasestorage.googleapis.com/v0/b/monody-nasheeds.firebasestorage.app/...
// => bucket is "monody-nasheeds.firebasestorage.app"
const BUCKET_NAME = 'monody-nasheeds.firebasestorage.app';

// CORS configuration
const CORS_CONFIG = [
  {
    origin: [
      'https://monody-nasheeds.web.app',
      'https://monody-nasheeds.firebaseapp.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:6969'
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
];

async function setCORS() {
  try {
    console.log('Setting up Firebase Storage CORS...');
    console.log(`Project: ${PROJECT_ID}`);
    console.log(`Bucket: ${BUCKET_NAME}`);
    
    // Initialize Storage (will use default credentials or environment)
    const storage = new Storage({
      projectId: PROJECT_ID
    });
    
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Check if bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
      throw new Error(`Bucket ${BUCKET_NAME} does not exist!`);
    }
    
    // Set CORS configuration
    await bucket.setCorsConfiguration(CORS_CONFIG);
    
    console.log('\n✅ CORS configuration set successfully!');
    console.log('\nAllowed origins:');
    CORS_CONFIG[0].origin.forEach(origin => console.log(`  - ${origin}`));
    
    console.log('\n🎉 CORS is now configured! Audio files should load without CORS errors.');
    console.log('Refresh your app and try playing a nasheed to verify.');
    
  } catch (error) {
    console.error('\n❌ Error setting CORS:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('Could not load the default credentials') || 
        error.message.includes('Could not find the default credentials')) {
      console.log('\n💡 Authentication Required!');
      console.log('\nOption 1: Install Google Cloud SDK (Recommended)');
      console.log('1. Download: https://cloud.google.com/sdk/docs/install-sdk#windows');
      console.log('2. Install with "Add to PATH" checked');
      console.log('3. Run: gcloud auth application-default login');
      console.log('4. Run this script again: node set-cors.js');
      console.log('\nOption 2: Use Service Account Key');
      console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
      console.log('2. Generate new private key (downloads JSON file)');
      console.log('3. Set environment variable:');
      console.log('   set GOOGLE_APPLICATION_CREDENTIALS=path\\to\\service-account-key.json');
      console.log('4. Run this script again');
      console.log('\nOption 3: Use gsutil method');
      console.log('1. Install Google Cloud SDK');
      console.log('2. Run: .\\setup-cors.bat');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Bucket not found!');
      console.log('Please check:');
      console.log(`1. Project ID is correct: ${PROJECT_ID}`);
      console.log(`2. Bucket name is correct: ${BUCKET_NAME}`);
      console.log('3. Go to Firebase Console → Storage to find your bucket name');
    } else if (error.message.includes('Permission denied') || error.message.includes('403')) {
      console.log('\n💡 Permission denied!');
      console.log('Make sure you have Storage Admin role in Firebase Console');
      console.log('Go to: Firebase Console → IAM & Admin → IAM');
      console.log('Find your account and ensure it has "Storage Admin" role');
    }
    
    process.exit(1);
  }
}

setCORS();
