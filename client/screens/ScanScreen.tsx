import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
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
import { useLibraryStore } from "@/store/libraryStore";

const RETICLE_WIDTH = 280;
const RETICLE_HEIGHT = 160;

function ScanReticle() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

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
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
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
  const { books } = useLibraryStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualISBN, setManualISBN] = useState("");
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingBookInfo, setPendingBookInfo] = useState<any>(null);

  const checkDuplicate = (isbn: string) => {
    return books.some((book) => book.isbn === isbn);
  };

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (!isScanning || isLoading) return;

    const { data, type } = result;
    if (
      type === "ean13" ||
      type === "ean8" ||
      type === "upc_a" ||
      type === "upc_e"
    ) {
      await processISBN(data);
    }
  };

  const processISBN = async (isbn: string) => {
    setIsScanning(false);
    setIsLoading(true);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const bookInfo = await fetchBookInfo(isbn);

    if (bookInfo) {
      const isDuplicate = checkDuplicate(isbn);
      if (isDuplicate) {
        setPendingBookInfo(bookInfo);
        setShowDuplicateWarning(true);
      } else {
        navigation.navigate("BookPreview", bookInfo);
      }
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsScanning(true);
    }

    setIsLoading(false);
  };

  const handleManualEntrySubmit = async () => {
    if (!manualISBN.trim()) return;
    setShowManualEntry(false);
    setManualISBN("");
    await processISBN(manualISBN.trim());
  };

  const handleDuplicateConfirm = () => {
    setShowDuplicateWarning(false);
    navigation.navigate("BookPreview", pendingBookInfo);
    setPendingBookInfo(null);
  };

  const handleDuplicateSkip = () => {
    setShowDuplicateWarning(false);
    setPendingBookInfo(null);
    setIsScanning(true);
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
                } catch {
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
          style={[styles.overlayTop, { paddingTop: insets.top + Spacing.xl }]}
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
          ) : (
            <Pressable
              style={[
                styles.manualEntryButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setShowManualEntry(true)}
            >
              <Feather name="type" size={18} color="#FFFFFF" />
              <ThemedText type="body" style={styles.manualEntryButtonText}>
                Manual Entry
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>

      <Modal
        visible={showManualEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="h3" style={styles.modalTitle}>
              Enter ISBN Manually
            </ThemedText>
            <TextInput
              style={[
                styles.isbnInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: colors.border,
                },
              ]}
              value={manualISBN}
              onChangeText={setManualISBN}
              placeholder="Enter ISBN number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              editable={!isLoading}
            />
            <View style={styles.modalButtonContainer}>
              <Button
                onPress={() => {
                  setShowManualEntry(false);
                  setManualISBN("");
                }}
                style={[styles.modalButton, { opacity: isLoading ? 0.5 : 1 }]}
              >
                Cancel
              </Button>
              <Button
                onPress={handleManualEntrySubmit}
                style={[
                  styles.modalButton,
                  { opacity: !manualISBN.trim() || isLoading ? 0.5 : 1 },
                ]}
                disabled={!manualISBN.trim() || isLoading}
              >
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </View>
          </View>
        </ThemedView>
      </Modal>

      <Modal
        visible={showDuplicateWarning}
        transparent
        animationType="fade"
        onRequestClose={() => handleDuplicateSkip()}
      >
        <ThemedView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Feather
              name="alert-circle"
              size={48}
              color={colors.primary}
              style={{ marginBottom: Spacing.lg }}
            />
            <ThemedText type="h3" style={styles.modalTitle}>
              Book Already Added
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.modalMessage, { color: colors.textSecondary }]}
            >
              You already have {`"${pendingBookInfo?.title}"`} in your library.
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.modalSubtext, { color: colors.textSecondary }]}
            >
              Would you like to add another copy?
            </ThemedText>
            <View style={styles.modalButtonContainer}>
              <Button
                onPress={handleDuplicateSkip}
                style={[styles.modalButton, { opacity: 0.7 }]}
              >
                Skip
              </Button>
              <Button
                onPress={handleDuplicateConfirm}
                style={styles.modalButton}
              >
                Add Copy
              </Button>
            </View>
          </View>
        </ThemedView>
      </Modal>
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
  manualEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  manualEntryButtonText: {
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    maxWidth: 350,
    width: "100%",
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  modalMessage: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  modalSubtext: {
    marginBottom: Spacing["2xl"],
    textAlign: "center",
  },
  isbnInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  modalButton: {
    flex: 1,
  },
});
