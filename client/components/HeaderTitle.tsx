import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <Feather name="book" size={24} color={colors.primary} style={styles.icon} />
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
});
