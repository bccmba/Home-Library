import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { LibraryStackParamList } from "@/navigation/LibraryStackNavigator";
import { useLibraryStore } from "@/store/libraryStore";

export default function MoveBookScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const route = useRoute<RouteProp<LibraryStackParamList, "MoveBook">>();

  const { bookId } = route.params;
  const { books, shelves, updateBookShelf } = useLibraryStore();
  const book = books.find((b) => b.id === bookId);

  const candidateShelves = useMemo(() => {
    if (!book) return shelves;
    return shelves.filter((s) => s.id !== book.shelfId);
  }, [book, shelves]);

  const defaultShelfId = candidateShelves[0]?.id ?? null;
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(
    defaultShelfId,
  );
  const [showShelfPicker, setShowShelfPicker] = useState(false);

  const selectedShelf = shelves.find((s) => s.id === selectedShelfId);

  if (!book) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <ThemedText>Book not found</ThemedText>
      </View>
    );
  }

  const canMove = Boolean(selectedShelfId);

  const handleMove = async () => {
    if (!selectedShelfId) return;
    await updateBookShelf(book.id, selectedShelfId);
    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: Spacing["2xl"],
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <ThemedText type="h3" style={styles.title}>
        Move “{book.title}”
      </ThemedText>
      <ThemedText type="body" style={{ color: colors.textSecondary }}>
        Choose a destination shelf.
      </ThemedText>

      {candidateShelves.length === 0 ? (
        <View style={styles.noShelves}>
          <ThemedText type="body" style={{ color: colors.textSecondary }}>
            You don’t have another shelf to move this book to.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.formSection}>
          <ThemedText type="h4" style={styles.sectionLabel}>
            Destination Shelf
          </ThemedText>

          <Pressable
            style={[
              styles.shelfSelector,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowShelfPicker(!showShelfPicker)}
            accessibilityLabel="Select destination shelf"
          >
            <View style={styles.shelfSelectorContent}>
              <Feather name="grid" size={18} color={colors.primary} />
              <ThemedText type="body">
                {selectedShelf?.name || "Select a shelf"}
              </ThemedText>
            </View>
            <Feather
              name={showShelfPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          {showShelfPicker ? (
            <View
              style={[
                styles.shelfPickerContainer,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: colors.border,
                },
              ]}
            >
              {candidateShelves.map((shelf) => (
                <Pressable
                  key={shelf.id}
                  style={[
                    styles.shelfOption,
                    selectedShelfId === shelf.id && {
                      backgroundColor: colors.secondary,
                    },
                  ]}
                  onPress={() => {
                    setSelectedShelfId(shelf.id);
                    setShowShelfPicker(false);
                  }}
                  accessibilityLabel={`Move to ${shelf.name}`}
                >
                  <ThemedText type="body">{shelf.name}</ThemedText>
                  {selectedShelfId === shelf.id ? (
                    <Feather name="check" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      )}

      <Button
        style={styles.moveButton}
        onPress={handleMove}
        disabled={!canMove}
      >
        Move Book
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  formSection: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  shelfSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  shelfSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  shelfPickerContainer: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  shelfOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  moveButton: {
    marginTop: "auto",
  },
  noShelves: {
    marginTop: Spacing["2xl"],
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
});
