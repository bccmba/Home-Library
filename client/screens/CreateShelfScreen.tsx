import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
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
import { useLibraryStore } from "@/store/libraryStore";

const SHELF_SUGGESTIONS = [
  "Living Room",
  "Bedroom",
  "Office",
  "Kids Room",
  "Study",
  "Favorites",
  "To Read",
  "Kitchen",
];

export default function CreateShelfScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { addShelf, shelves } = useLibraryStore();
  const [shelfName, setShelfName] = useState("");

  const existingNames = shelves.map((s) => s.name.toLowerCase());
  const availableSuggestions = SHELF_SUGGESTIONS.filter(
    (s) => !existingNames.includes(s.toLowerCase())
  );

  const handleCreate = async () => {
    if (!shelfName.trim()) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addShelf(shelfName.trim());
    navigation.goBack();
  };

  const handleSuggestionPress = (name: string) => {
    setShelfName(name);
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
      <ThemedText type="h4" style={styles.label}>
        Shelf Name
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
        value={shelfName}
        onChangeText={setShelfName}
        placeholder="e.g., Living Room, Office, Kids Room"
        placeholderTextColor={colors.textSecondary}
        autoFocus
        maxLength={50}
      />

      {availableSuggestions.length > 0 ? (
        <View style={styles.suggestionsSection}>
          <ThemedText
            type="caption"
            style={[styles.suggestionsLabel, { color: colors.textSecondary }]}
          >
            Suggestions
          </ThemedText>
          <View style={styles.suggestionsContainer}>
            {availableSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: colors.secondary },
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <ThemedText type="small">{suggestion}</ThemedText>
              </Button>
            ))}
          </View>
        </View>
      ) : null}

      <Button
        style={styles.createButton}
        onPress={handleCreate}
        disabled={!shelfName.trim()}
      >
        Create Shelf
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  suggestionsSection: {
    marginTop: Spacing["2xl"],
  },
  suggestionsLabel: {
    marginBottom: Spacing.md,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  suggestionChip: {
    height: 36,
    paddingHorizontal: Spacing.lg,
  },
  createButton: {
    marginTop: Spacing["3xl"],
  },
});
