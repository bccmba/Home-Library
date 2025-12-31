import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { addBook } from "../../src/services/bookService";

export default function AddBookScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a book title.");
      return;
    }

    if (!author.trim()) {
      Alert.alert("Validation Error", "Please enter an author name.");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare book data
      const bookData: any = {
        title: title.trim(),
        author: author.trim(),
      };

      // Add optional fields if provided
      if (isbn.trim()) {
        bookData.isbn = isbn.trim();
      }
      if (pageCount.trim()) {
        const pages = parseInt(pageCount.trim(), 10);
        if (!isNaN(pages) && pages > 0) {
          bookData.pageCount = pages;
        }
      }
      if (publishedYear.trim()) {
        bookData.publishedYear = publishedYear.trim();
      }

      // Add the book
      await addBook(bookData);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show success message
      Alert.alert("Success", "Book added successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Clear the form
            setTitle("");
            setAuthor("");
            setIsbn("");
            setPageCount("");
            setPublishedYear("");
            // Optionally navigate back
            // navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.log("Error adding book:", error);
      Alert.alert("Error", "Failed to add book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = title.trim() && author.trim() && !loading;

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing["2xl"],
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <ThemedText type="h4" style={styles.label}>
        Title *
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: colors.border,
          },
        ]}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter book title"
        placeholderTextColor={colors.textSecondary}
        autoFocus
        maxLength={200}
        editable={!loading}
      />

      <ThemedText type="h4" style={[styles.label, styles.labelMargin]}>
        Author *
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: colors.border,
          },
        ]}
        value={author}
        onChangeText={setAuthor}
        placeholder="Enter author name"
        placeholderTextColor={colors.textSecondary}
        maxLength={100}
        editable={!loading}
      />

      <ThemedText type="h4" style={[styles.label, styles.labelMargin]}>
        ISBN
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: colors.border,
          },
        ]}
        value={isbn}
        onChangeText={setIsbn}
        placeholder="Enter ISBN (optional)"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
        maxLength={20}
        editable={!loading}
      />

      <ThemedText type="h4" style={[styles.label, styles.labelMargin]}>
        Page Count
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: colors.border,
          },
        ]}
        value={pageCount}
        onChangeText={setPageCount}
        placeholder="Enter page count (optional)"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
        maxLength={10}
        editable={!loading}
      />

      <ThemedText type="h4" style={[styles.label, styles.labelMargin]}>
        Published Year
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: colors.border,
          },
        ]}
        value={publishedYear}
        onChangeText={setPublishedYear}
        placeholder="Enter published year (optional)"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
        maxLength={4}
        editable={!loading}
      />

      {loading ? (
        <View
          style={[
            styles.submitButton,
            styles.loadingButton,
            { backgroundColor: theme.link },
          ]}
        >
          <ActivityIndicator size="small" color="#FFFFFF" />
          <ThemedText
            type="body"
            style={[styles.loadingText, { color: theme.buttonText }]}
          >
            Adding book...
          </ThemedText>
        </View>
      ) : (
        <Button
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          Add Book
        </Button>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.md,
  },
  labelMargin: {
    marginTop: Spacing.xl,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  submitButton: {
    marginTop: Spacing["3xl"],
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    opacity: 0.7,
  },
  loadingText: {
    fontWeight: "600",
  },
});

