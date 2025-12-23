import React from "react";
import { View, ScrollView, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { LibraryStackParamList } from "@/navigation/LibraryStackNavigator";
import { useLibraryStore, Shelf, Book } from "@/store/libraryStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
}) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
      <View
        style={[styles.statIconContainer, { backgroundColor: colors.primary }]}
      >
        <Feather name={icon} size={18} color="#FFFFFF" />
      </View>
      <ThemedText type="h3" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="caption" style={{ color: colors.textSecondary }}>
        {label}
      </ThemedText>
    </View>
  );
}

function ShelfPreviewCard({
  shelf,
  books,
  onPress,
}: {
  shelf: Shelf;
  books: Book[];
  onPress: () => void;
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

  const shelfBooks = books.filter((b) => b.shelfId === shelf.id);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.shelfCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.shelfHeader}>
        <View>
          <ThemedText type="h4">{shelf.name}</ThemedText>
          <ThemedText type="caption" style={{ color: colors.textSecondary }}>
            {shelfBooks.length} {shelfBooks.length === 1 ? "book" : "books"}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
      </View>

      {shelfBooks.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.booksPreview}
          contentContainerStyle={styles.booksPreviewContent}
        >
          {shelfBooks.slice(0, 5).map((book) => (
            <Image
              key={book.id}
              source={{ uri: book.cover }}
              style={styles.bookThumb}
              resizeMode="cover"
            />
          ))}
          {shelfBooks.length > 5 ? (
            <View
              style={[styles.moreBooks, { backgroundColor: colors.secondary }]}
            >
              <ThemedText type="small">+{shelfBooks.length - 5}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.emptyShelfPreview}>
          <ThemedText type="caption" style={{ color: colors.textSecondary }}>
            Tap Scan to add books
          </ThemedText>
        </View>
      )}
    </AnimatedPressable>
  );
}

function EmptyLibraryState() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.emptyState}>
      <Image
        source={require("../assets/images/empty-shelves.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h3" style={styles.emptyTitle}>
        Welcome to Your Library
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: colors.textSecondary }]}
      >
        Scan your first book to start building your collection
      </ThemedText>
    </View>
  );
}

export default function LibraryHomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();

  const { shelves, books } = useLibraryStore();

  const recentBooks = [...books]
    .sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statsRow}>
        <StatCard label="Books" value={books.length} icon="book" />
        <StatCard label="Shelves" value={shelves.length} icon="grid" />
        <StatCard label="Recent" value={recentBooks.length} icon="clock" />
      </View>

      {shelves.length === 0 ? (
        <EmptyLibraryState />
      ) : (
        <View style={styles.shelvesSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Your Bookshelves
          </ThemedText>
          {shelves.map((shelf) => (
            <ShelfPreviewCard
              key={shelf.id}
              shelf={shelf}
              books={books}
              onPress={() =>
                navigation.navigate("ShelfDetail", {
                  shelfId: shelf.id,
                  shelfName: shelf.name,
                })
              }
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  shelvesSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  shelfCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  shelfHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  booksPreview: {
    marginHorizontal: -Spacing.sm,
  },
  booksPreviewContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  bookThumb: {
    width: 60,
    height: 90,
    borderRadius: BorderRadius.xs,
  },
  moreBooks: {
    width: 60,
    height: 90,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyShelfPreview: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing["2xl"],
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing["2xl"],
  },
});
