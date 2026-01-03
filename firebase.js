// Firebase initialization
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";

// Debug: Log environment variable status (only in dev mode)
if (__DEV__) {
  console.log("[Firebase] Environment variable status:", {
    FIREBASE_API_KEY: FIREBASE_API_KEY ? "✓ Set" : "✗ Missing",
    FIREBASE_AUTH_DOMAIN: FIREBASE_AUTH_DOMAIN ? "✓ Set" : "✗ Missing",
    FIREBASE_PROJECT_ID: FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing",
    FIREBASE_STORAGE_BUCKET: FIREBASE_STORAGE_BUCKET ? "✓ Set" : "✗ Missing",
    FIREBASE_MESSAGING_SENDER_ID: FIREBASE_MESSAGING_SENDER_ID ? "✓ Set" : "✗ Missing",
    FIREBASE_APP_ID: FIREBASE_APP_ID ? "✓ Set" : "✗ Missing",
    FIREBASE_MEASUREMENT_ID: FIREBASE_MEASUREMENT_ID ? "✓ Set" : "✗ Missing (optional)",
  });
}

// Validate required environment variables
const requiredEnvVars = {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => {
    // Check if value is undefined, null, or empty string
    return value === undefined || value === null || value === "";
  })
  .map(([key]) => key);

if (missingVars.length > 0) {
  const missingList = missingVars.join(", ");
  const errorMessage = 
    `Missing required Firebase environment variables: ${missingList}. ` +
    `\n\nPlease add these to your .env file in the project root:` +
    `\nFIREBASE_API_KEY=your_api_key` +
    `\nFIREBASE_AUTH_DOMAIN=your_auth_domain` +
    `\nFIREBASE_PROJECT_ID=your_project_id` +
    `\nFIREBASE_STORAGE_BUCKET=your_storage_bucket` +
    `\nFIREBASE_MESSAGING_SENDER_ID=your_sender_id` +
    `\nFIREBASE_APP_ID=your_app_id` +
    `\nFIREBASE_MEASUREMENT_ID=your_measurement_id (optional)` +
    `\n\nAfter adding variables, restart Metro bundler with: npm start -- --clear`;
  
  console.error("[Firebase] Configuration Error:");
  console.error(errorMessage);
  
  throw new Error(errorMessage);
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase only if not already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("[Firebase] Initialized successfully");
} else {
  app = getApps()[0];
  console.log("[Firebase] Using existing Firebase app instance");
}

// Initialize Firestore and export it
export const db = getFirestore(app);

// Export the app instance
export { app };
