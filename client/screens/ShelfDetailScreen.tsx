import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { LibraryStackParamList } from "@/navigation/LibraryStackNavigator";
import { useLibraryStore, Book } from "@/store/libraryStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BookCoverCard({
  book,
  onPress,
  width,
}: {
  book: Book;
  onPress: () => void;
  width: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const coverHeight = (width - Spacing.sm) * 1.5;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.bookCard, { width }, animatedStyle]}
      accessibilityLabel={`${book.title} by ${book.authors.join(", ")}`}
    >
      <Image
        source={{ uri: book.cover }}
        style={[styles.bookCover, { height: coverHeight }]}
        resizeMode="cover"
      />
      <ThemedText type="small" numberOfLines={2} style={styles.bookTitle}>
        {book.title}
      </ThemedText>
      <ThemedText type="caption" numberOfLines={1} style={styles.bookAuthor}>
        {book.authors.join(", ")}
      </ThemedText>
    </AnimatedPressable>
  );
}

function EmptyShelfState() {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.secondary }]}>
        <Feather name="book-open" size={60} color={colors.primary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        This shelf is empty
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        Tap Scan to add books to this shelf
      </ThemedText>
    </View>
  );
}

export default function ShelfDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const route = useRoute<RouteProp<LibraryStackParamList, "ShelfDetail">>();

  const { books } = useLibraryStore();
  const shelfBooks = books.filter((b) => b.shelfId === route.params.shelfId);

  const numColumns = 2;
  const cardWidth =
    (screenWidth - Spacing.lg * 2 - Spacing.md * (numColumns - 1)) / numColumns;

  const renderItem = ({ item }: { item: Book }) => (
    <BookCoverCard
      book={item}
      width={cardWidth}
      onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
    />
  );

  if (shelfBooks.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing.xl,
          },
        ]}
      >
        <EmptyShelfState />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={shelfBooks}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bookCard: {
    marginBottom: Spacing.sm,
  },
  bookCover: {
    width: "100%",
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  bookTitle: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  bookAuthor: {
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
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
