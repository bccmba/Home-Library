import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// Initialize Firebase early in the app lifecycle
import "../firebase";

// Firestore sanity test on app startup (dev mode only)
if (__DEV__) {
  import("../src/services/firebaseTest")
    .then(({ testFirestoreConnection }) => {
      // Run test after a short delay to ensure Firebase is fully initialized
      setTimeout(() => {
        testFirestoreConnection()
          .then((result) => {
            if (result.success) {
              console.log(
                `[Firestore Test] ✅ Sanity test passed!`
              );
              console.log(
                `[Firestore Test] Document ID: ${result.docId}`
              );
              console.log(
                `[Firestore Test] Collection: ${result.collection}`
              );
              console.log(
                `[Firestore Test] Read-back data:`,
                result.readData
              );
            } else {
              console.error(
                `[Firestore Test] ❌ Sanity test failed!`
              );
              console.error(
                `[Firestore Test] Error: ${result.error}`
              );
              if (result.errorCode) {
                console.error(
                  `[Firestore Test] Error Code: ${result.errorCode}`
                );
              }
              if (result.errorDetails) {
                console.error(
                  `[Firestore Test] Error Details:`,
                  result.errorDetails
                );
              }
            }
          })
          .catch((err) => {
            console.error("[Firestore Test] ❌ Unexpected error:", err);
          });
      }, 1000);
    })
    .catch((importError) => {
      console.error("[Firestore Test] ❌ Failed to import test module:", importError);
      console.error("[Firestore Test] This may indicate:", {
        fileNotFound: "Check that src/services/firebaseTest.js exists",
        syntaxError: "Check for syntax errors in firebaseTest.js",
        moduleError: "Check that testFirestoreConnection is exported correctly",
        errorMessage: importError.message,
        errorStack: importError.stack,
      });
    });
}

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <NavigationContainer>
                <RootStackNavigator />
              </NavigationContainer>
              <StatusBar style="auto" />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
