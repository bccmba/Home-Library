import React, { useState } from "react";
import { View, StyleSheet, Image, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useLibraryStore } from "@/store/libraryStore";

export default function BookPreviewScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BookPreview">>();

  const { shelves, addBook } = useLibraryStore();
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(
    shelves.length > 0 ? shelves[0].id : null,
  );
  const [isRead, setIsRead] = useState(false);
  const [notes, setNotes] = useState("");
  const [showShelfPicker, setShowShelfPicker] = useState(false);

  const { isbn, title, authors, cover, pageCount, publishedYear } =
    route.params;

  const selectedShelf = shelves.find((s) => s.id === selectedShelfId);

  const handleCreateShelf = () => {
    navigation.navigate("CreateShelf");
  };

  const handleAddToLibrary = async () => {
    if (!selectedShelfId) {
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    addBook({
      isbn,
      title,
      authors,
      cover,
      pageCount,
      publishedYear,
      shelfId: selectedShelfId,
      isRead,
      notes,
    });

    navigation.popTo("Main");
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing["2xl"],
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.coverSection}>
        <Image
          source={{ uri: cover }}
          style={[styles.cover, Shadows.medium]}
          resizeMode="cover"
        />
      </View>

      <ThemedText type="h2" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.authors, { color: colors.textSecondary }]}
      >
        {authors.join(", ")}
      </ThemedText>

      <View style={styles.metaRow}>
        {pageCount ? (
          <View
            style={[styles.metaItem, { backgroundColor: colors.secondary }]}
          >
            <Feather name="file-text" size={14} color={colors.primary} />
            <ThemedText type="small">{pageCount} pages</ThemedText>
          </View>
        ) : null}
        {publishedYear ? (
          <View
            style={[styles.metaItem, { backgroundColor: colors.secondary }]}
          >
            <Feather name="calendar" size={14} color={colors.primary} />
            <ThemedText type="small">{publishedYear}</ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.formSection}>
        <ThemedText type="h4" style={styles.sectionLabel}>
          Add to Shelf
        </ThemedText>

        {shelves.length === 0 ? (
          <View style={styles.noShelvesContainer}>
            <ThemedText
              type="body"
              style={[styles.noShelvesText, { color: colors.textSecondary }]}
            >
              Create your first bookshelf to organize your books
            </ThemedText>
            <Button onPress={handleCreateShelf}>Create Shelf</Button>
          </View>
        ) : (
          <>
            <Pressable
              style={[
                styles.shelfSelector,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowShelfPicker(!showShelfPicker)}
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
                {shelves.map((shelf) => (
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
                  >
                    <ThemedText type="body">{shelf.name}</ThemedText>
                    {selectedShelfId === shelf.id ? (
                      <Feather name="check" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                ))}
                <Pressable
                  style={[styles.shelfOption, styles.createShelfOption]}
                  onPress={handleCreateShelf}
                >
                  <Feather name="plus" size={18} color={colors.accent} />
                  <ThemedText type="body" style={{ color: colors.accent }}>
                    Create New Shelf
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}
          </>
        )}

        <ThemedText
          type="h4"
          style={[styles.sectionLabel, { marginTop: Spacing["2xl"] }]}
        >
          Reading Status
        </ThemedText>
        <View style={styles.readStatusRow}>
          <Pressable
            style={[
              styles.readStatusOption,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: colors.border,
              },
              !isRead && {
                backgroundColor: colors.secondary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setIsRead(false)}
          >
            <Feather
              name="circle"
              size={18}
              color={!isRead ? colors.primary : colors.textSecondary}
            />
            <ThemedText type="body">Not read</ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.readStatusOption,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: colors.border,
              },
              isRead && {
                backgroundColor: colors.secondary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setIsRead(true)}
          >
            <Feather
              name="check-circle"
              size={18}
              color={isRead ? colors.primary : colors.textSecondary}
            />
            <ThemedText type="body">Read</ThemedText>
          </Pressable>
        </View>

        <ThemedText
          type="h4"
          style={[styles.sectionLabel, { marginTop: Spacing["2xl"] }]}
        >
          Personal Notes
        </ThemedText>
        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: colors.border,
            },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add personal notes about this book..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
      </View>

      <Button
        style={styles.addButton}
        onPress={handleAddToLibrary}
        disabled={!selectedShelfId}
      >
        Add to Library
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  coverSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  cover: {
    width: 160,
    height: 240,
    borderRadius: BorderRadius.xs,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  authors: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  formSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    marginBottom: Spacing.md,
  },
  noShelvesContainer: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  noShelvesText: {
    textAlign: "center",
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
  createShelfOption: {
    gap: Spacing.sm,
    justifyContent: "flex-start",
  },
  notesInput: {
    minHeight: 100,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  readStatusRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  readStatusOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  addButton: {
    marginTop: Spacing.lg,
  },
});
