/**
 * API Base URL Configuration
 * 
 * This is the single source of truth for the API base URL.
 * It reads from the EXPO_PUBLIC_DOMAIN environment variable.
 * 
 * For physical devices, set EXPO_PUBLIC_DOMAIN to your computer's IP address:
 * EXPO_PUBLIC_DOMAIN=http://YOUR_IP_ADDRESS:3000
 */

if (!process.env.EXPO_PUBLIC_DOMAIN) {
  throw new Error(
    "EXPO_PUBLIC_DOMAIN is not defined. " +
    "Please set it in your .env file (e.g., EXPO_PUBLIC_DOMAIN=http://YOUR_IP_ADDRESS:3000)"
  );
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_DOMAIN;

// Log the API base URL for debugging (only in development)
if (__DEV__) {
  console.log(`[Config] API_BASE_URL: ${API_BASE_URL}`);
}
