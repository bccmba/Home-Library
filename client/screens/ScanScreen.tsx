import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const RETICLE_WIDTH = 280;
const RETICLE_HEIGHT = 160;

function ScanReticle() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.reticle, animatedStyle]}>
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </Animated.View>
  );
}

async function fetchBookInfo(isbn: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    const data = await response.json();

    if (data.totalItems > 0) {
      const book = data.items[0].volumeInfo;
      return {
        isbn,
        title: book.title || "Unknown Title",
        authors: book.authors || ["Unknown Author"],
        cover:
          book.imageLinks?.thumbnail?.replace("http:", "https:") ||
          "https://via.placeholder.com/128x192?text=No+Cover",
        pageCount: book.pageCount,
        publishedYear: book.publishedDate?.split("-")[0],
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching book info:", error);
    return null;
  }
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (!isScanning || isLoading) return;

    const { data, type } = result;
    if (type === "ean13" || type === "ean8" || type === "upc_a" || type === "upc_e") {
      setIsScanning(false);
      setIsLoading(true);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const bookInfo = await fetchBookInfo(data);

      if (bookInfo) {
        navigation.navigate("BookPreview", bookInfo);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsScanning(true);
      }

      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setIsScanning(true);
    }
  }, [isFocused]);

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={[styles.container, styles.permissionContainer]}>
        <View style={styles.permissionContent}>
          <Feather name="camera-off" size={64} color={colors.primary} />
          <ThemedText type="h3" style={styles.permissionTitle}>
            Camera Access Required
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.permissionText, { color: colors.textSecondary }]}
          >
            My Home Library needs camera access to scan book barcodes and add
            them to your collection.
          </ThemedText>

          {permission.canAskAgain ? (
            <Button style={styles.permissionButton} onPress={requestPermission}>
              Enable Camera
            </Button>
          ) : Platform.OS !== "web" ? (
            <Button
              style={styles.permissionButton}
              onPress={async () => {
                try {
                  await Linking.openSettings();
                } catch (error) {
                  // Settings not available
                }
              }}
            >
              Open Settings
            </Button>
          ) : (
            <ThemedText
              type="small"
              style={[styles.webMessage, { color: colors.textSecondary }]}
            >
              Run in Expo Go to use this feature
            </ThemedText>
          )}
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
          onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        />
      ) : null}

      <View style={styles.overlay}>
        <View
          style={[
            styles.overlayTop,
            { paddingTop: insets.top + Spacing.xl },
          ]}
        >
          <ThemedText type="body" style={styles.instructionText}>
            Position barcode within frame
          </ThemedText>
        </View>

        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <ScanReticle />
          <View style={styles.overlaySide} />
        </View>

        <View
          style={[
            styles.overlayBottom,
            { paddingBottom: insets.bottom + Spacing["5xl"] },
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <ThemedText type="body" style={styles.loadingText}>
                Looking up book...
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  permissionTitle: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  permissionButton: {
    width: "100%",
  },
  webMessage: {
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayTop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: Spacing["2xl"],
  },
  overlayMiddle: {
    flexDirection: "row",
  },
  overlayBottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing["2xl"],
  },
  overlaySide: {
    flex: 1,
  },
  instructionText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  reticle: {
    width: RETICLE_WIDTH,
    height: RETICLE_HEIGHT,
    position: "relative",
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFFFFF",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  loadingContainer: {
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    color: "#FFFFFF",
  },
});
