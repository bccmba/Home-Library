import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getBooks, deleteBook } from "../../src/services/bookService";

interface Book {
  id: string;
  title?: string;
  author?: string;
  [key: string]: any;
}

export default function BooksListScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.log("Error fetching books:", error);
      Alert.alert("Error", "Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDeleteBook = async (id: string, title?: string) => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${title || "this book"}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBook(id);
              // Refresh the list after deletion
              await fetchBooks();
            } catch (error) {
              console.log("Error deleting book:", error);
              Alert.alert("Error", "Failed to delete book. Please try again.");
            }
          },
        },
      ]
    );
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    return (
      <View
        style={[
          styles.bookItem,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <View style={styles.bookInfo}>
          <ThemedText type="h4" style={styles.bookTitle}>
            {item.title || "Untitled Book"}
          </ThemedText>
          {item.author && (
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              {item.author}
            </ThemedText>
          )}
        </View>
        <Pressable
          onPress={() => handleDeleteBook(item.id, item.title)}
          style={[
            styles.deleteButton,
            { backgroundColor: colors.destructive },
          ]}
        >
          <Feather name="trash-2" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText type="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
            Loading books...
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Feather name="book-open" size={64} color={colors.textSecondary} />
        <ThemedText type="h3" style={styles.emptyText}>
          No books found
        </ThemedText>
        <ThemedText type="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
          Add your first book to get started
        </ThemedText>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot },
        { paddingTop: headerHeight + Spacing.lg },
      ]}
    >
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          books.length === 0 && styles.emptyListContent,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  bookInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  bookTitle: {
    marginBottom: Spacing.xs,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
});

