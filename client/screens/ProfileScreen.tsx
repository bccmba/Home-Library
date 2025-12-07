import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useLibraryStore } from "@/store/libraryStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AVATARS = [
  require("../assets/images/avatar-reader.png"),
  require("../assets/images/avatar-books.png"),
  require("../assets/images/avatar-bookworm.png"),
];

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  destructive = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[
        styles.settingsRow,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <Feather
          name={icon}
          size={20}
          color={destructive ? colors.destructive : colors.primary}
        />
        <ThemedText
          type="body"
          style={destructive ? { color: colors.destructive } : undefined}
        >
          {label}
        </ThemedText>
      </View>
      <View style={styles.settingsRowRight}>
        {value ? (
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {value}
          </ThemedText>
        ) : null}
        {onPress ? (
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { books, shelves, clearAll } = useLibraryStore();
  const [avatarIndex, setAvatarIndex] = useState(0);

  const handleAvatarPress = () => {
    setAvatarIndex((prev) => (prev + 1) % AVATARS.length);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to remove all books and shelves? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm",
              "This will permanently delete your entire library. Are you absolutely sure?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Everything",
                  style: "destructive",
                  onPress: clearAll,
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.profileSection}>
        <Pressable onPress={handleAvatarPress}>
          <Image
            source={AVATARS[avatarIndex]}
            style={[
              styles.avatar,
              { borderColor: colors.primary },
            ]}
            resizeMode="cover"
          />
        </Pressable>
        <ThemedText type="h3" style={styles.displayName}>
          My Library
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          Tap avatar to change
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionHeader, { color: colors.textSecondary }]}
        >
          LIBRARY STATS
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon="book"
            label="Total Books"
            value={books.length.toString()}
          />
          <SettingsRow
            icon="grid"
            label="Bookshelves"
            value={shelves.length.toString()}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionHeader, { color: colors.textSecondary }]}
        >
          ABOUT
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingsRow icon="info" label="Version" value="1.0.0" />
          <SettingsRow icon="heart" label="Made with love" value="for book lovers" />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="caption"
          style={[styles.sectionHeader, { color: colors.textSecondary }]}
        >
          DATA
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon="trash-2"
            label="Clear All Data"
            onPress={handleClearAll}
            destructive
          />
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    marginBottom: Spacing.lg,
  },
  displayName: {
    marginBottom: Spacing.xs,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    gap: 1,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
