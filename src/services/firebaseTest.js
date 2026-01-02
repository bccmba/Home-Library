/**
 * Firestore Sanity Test
 * 
 * This file performs a non-destructive test write and read to Firebase Firestore
 * to verify database connectivity and functionality.
 */

import { collection, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const TEST_COLLECTION = "debug_tests";

/**
 * Performs a Firestore sanity test:
 * 1. Writes a document to the debug_tests collection
 * 2. Reads the document back to verify it was written correctly
 * 
 * @returns {Promise<{success: boolean, docId?: string, readData?: object, error?: string, errorCode?: string, errorDetails?: object}>}
 */
export async function testFirestoreConnection() {
  let docId = null;
  
  try {
    console.log("[Firestore Test] Starting sanity test...");
    
    // Validate db instance is available
    if (!db) {
      throw new Error("Firestore db instance is not available. Check Firebase initialization.");
    }
    
    console.log("[Firestore Test] Firestore db instance validated");
    
    // Generate unique test data
    const testId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const testData = {
      status: "ok",
      createdAt: serverTimestamp(),
      testId: testId,
      message: "Firestore sanity test",
      timestamp: new Date().toISOString(),
    };

    // Step 1: Write document
    console.log(`[Firestore Test] Writing to ${TEST_COLLECTION} collection...`);
    const docRef = await addDoc(collection(db, TEST_COLLECTION), testData);
    docId = docRef.id;
    console.log(`[Firestore Test] ✅ Write successful - Document ID: ${docId}`);
    
    // Step 2: Read document back
    console.log(`[Firestore Test] Reading document back to verify...`);
    const docSnap = await getDoc(doc(db, TEST_COLLECTION, docId));
    
    if (!docSnap.exists()) {
      throw new Error(`Document ${docId} was written but could not be read back`);
    }
    
    const readData = docSnap.data();
    console.log(`[Firestore Test] ✅ Read successful - Document data:`, readData);
    
    // Verify testId matches
    if (readData.testId !== testId) {
      console.warn(`[Firestore Test] ⚠️ Warning: testId mismatch (expected: ${testId}, got: ${readData.testId})`);
    }
    
    return {
      success: true,
      docId: docId,
      collection: TEST_COLLECTION,
      readData: readData,
    };
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
    };
    
    console.error("[Firestore Test] ❌ FAILED");
    console.error("[Firestore Test] Error Message:", error.message);
    console.error("[Firestore Test] Error Code:", error.code || "N/A");
    console.error("[Firestore Test] Error Name:", error.name);
    
    // Check for common initialization errors
    if (error.message && error.message.includes("Missing required Firebase")) {
      console.error("[Firestore Test] ⚠️ Configuration Error: Missing Firebase environment variables");
      console.error("[Firestore Test] Check your .env file for: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, etc.");
    }
    
    if (error.code) {
      console.error(`[Firestore Test] Firebase Error Code: ${error.code}`);
      
      // Common error code explanations
      const errorExplanations = {
        "permission-denied": "Firestore security rules are blocking this operation. Check rules for 'debug_tests' collection.",
        "unavailable": "Firestore service is unavailable. Check network connection and Firebase project status.",
        "unauthenticated": "Authentication required. Check Firebase authentication setup.",
        "invalid-argument": "Invalid arguments provided to Firestore operation.",
        "not-found": "Document or collection not found.",
        "already-exists": "Document already exists (should not happen with addDoc).",
        "failed-precondition": "Operation failed due to a precondition check.",
        "aborted": "Operation was aborted.",
        "out-of-range": "Operation arguments are out of range.",
        "unimplemented": "Operation is not implemented or not supported.",
        "internal": "Internal Firestore error.",
        "deadline-exceeded": "Operation deadline exceeded.",
        "resource-exhausted": "Resource exhausted (quota exceeded).",
        "cancelled": "Operation was cancelled.",
      };
      
      if (errorExplanations[error.code]) {
        console.error(`[Firestore Test] Explanation: ${errorExplanations[error.code]}`);
      } else {
        console.error(`[Firestore Test] Unknown error code: ${error.code}`);
      }
    } else if (!error.code && error.message) {
      // Non-Firebase errors (e.g., initialization errors)
      console.error("[Firestore Test] This appears to be a non-Firebase error (possibly initialization or configuration issue)");
    }
    
    if (docId) {
      console.error(`[Firestore Test] Document ID that was written: ${docId}`);
    }
    
    // Additional debugging info
    console.error("[Firestore Test] Full error object:", JSON.stringify(errorDetails, null, 2));
    
    return {
      success: false,
      docId: docId,
      error: error.message,
      errorCode: error.code,
      errorDetails: errorDetails,
    };
  }
}

