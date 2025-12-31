import { firebase } from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";

// Firebase configuration object from .env variables
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase if it's not already initialized
// React Native Firebase typically auto-initializes from native config files,
// but we can also initialize programmatically if needed
try {
  // Check if Firebase is already initialized
  if (firebase.apps.length === 0) {
    // Initialize Firebase with config from .env variables
    if (firebase.initializeApp) {
      firebase.initializeApp(firebaseConfig);
    } else {
      // If initializeApp is not available, Firebase is likely auto-initialized
      // from native config files (google-services.json / GoogleService-Info.plist)
      console.log("Firebase will be initialized from native config files");
    }
  } else {
    // Firebase is already initialized
    console.log("Firebase already initialized");
  }
} catch (error) {
  // Handle initialization errors gracefully
  // Firebase might already be initialized from native config files
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (!errorMessage.includes("already exists") && !errorMessage.includes("already initialized")) {
    console.warn("Firebase initialization warning:", errorMessage);
  }
}

// Export the firestore instance as 'db'
// This will work whether Firebase was initialized from native config or programmatically
export const db = firestore();

