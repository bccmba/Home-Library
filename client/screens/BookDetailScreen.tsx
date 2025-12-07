import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { LibraryStackParamList } from "@/navigation/LibraryStackNavigator";
import { useLibraryStore } from "@/store/libraryStore";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={18} color={colors.primary} />
      <View style={styles.infoContent}>
        <ThemedText type="caption" style={{ color: colors.textSecondary }}>
          {label}
        </ThemedText>
        <ThemedText type="body">{value}</ThemedText>
      </View>
    </View>
  );
}

export default function BookDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const route = useRoute<RouteProp<LibraryStackParamList, "BookDetail">>();
  const colors = isDark ? Colors.dark : Colors.light;

  const { books, shelves, updateBookNotes, removeBook } = useLibraryStore();
  const book = books.find((b) => b.id === route.params.bookId);
  const shelf = shelves.find((s) => s.id === book?.shelfId);

  const [notes, setNotes] = useState(book?.notes || "");
  const [isEditing, setIsEditing] = useState(false);

  if (!book) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Book not found</ThemedText>
      </ThemedView>
    );
  }

  const handleSaveNotes = () => {
    updateBookNotes(book.id, notes);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Remove Book",
      `Are you sure you want to remove "${book.title}" from your library?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeBook(book.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingBottom: tabBarHeight + Spacing["3xl"],
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <Image
          source={{ uri: book.cover }}
          style={styles.coverBackground}
          blurRadius={20}
        />
        <LinearGradient
          colors={["transparent", theme.backgroundRoot]}
          style={styles.gradient}
        />
        <View style={[styles.coverContainer, { marginTop: headerHeight }]}>
          <Image
            source={{ uri: book.cover }}
            style={styles.cover}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.contentSection}>
        <ThemedText type="h2" style={styles.title}>
          {book.title}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.authors, { color: colors.textSecondary }]}
        >
          {book.authors.join(", ")}
        </ThemedText>

        <View style={styles.infoSection}>
          <InfoRow icon="hash" label="ISBN" value={book.isbn} />
          {book.pageCount ? (
            <InfoRow
              icon="file-text"
              label="Pages"
              value={book.pageCount.toString()}
            />
          ) : null}
          {book.publishedYear ? (
            <InfoRow icon="calendar" label="Published" value={book.publishedYear} />
          ) : null}
          <InfoRow icon="grid" label="Shelf" value={shelf?.name || "Unknown"} />
        </View>

        <View style={styles.notesSection}>
          <View style={styles.noteHeader}>
            <ThemedText type="h4">Personal Notes</ThemedText>
            {!isEditing ? (
              <Button
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Button style={styles.editButton} onPress={handleSaveNotes}>
                Save
              </Button>
            )}
          </View>
          {isEditing ? (
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
          ) : (
            <ThemedText
              type="body"
              style={[
                styles.notesText,
                !notes && { color: colors.textSecondary },
              ]}
            >
              {notes || "No notes yet"}
            </ThemedText>
          )}
        </View>

        <Button
          style={[styles.deleteButton, { backgroundColor: colors.destructive }]}
          onPress={handleDelete}
        >
          Remove from Library
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    height: 320,
    position: "relative",
  },
  coverBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  coverContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    width: 160,
    height: 240,
    borderRadius: BorderRadius.xs,
  },
  contentSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  authors: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  infoSection: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  notesSection: {
    marginBottom: Spacing["2xl"],
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  editButton: {
    paddingHorizontal: Spacing.lg,
    height: 36,
  },
  notesInput: {
    minHeight: 100,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  notesText: {
    lineHeight: 24,
  },
  deleteButton: {
    marginTop: Spacing.lg,
  },
});
