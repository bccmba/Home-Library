import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import LibraryHomeScreen from "@/screens/LibraryHomeScreen";
import ShelfDetailScreen from "@/screens/ShelfDetailScreen";
import BookDetailScreen from "@/screens/BookDetailScreen";
import MoveBookScreen from "@/screens/MoveBookScreen";
import { HeaderTitle } from "@/components/HeaderTitle";

export type LibraryStackParamList = {
  LibraryHome: undefined;
  ShelfDetail: { shelfId: string; shelfName: string };
  BookDetail: { bookId: string };
  MoveBook: { bookId: string };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="LibraryHome"
        component={LibraryHomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="My Library" />,
        }}
      />
      <Stack.Screen
        name="ShelfDetail"
        component={ShelfDetailScreen}
        options={({ route }) => ({
          headerTitle: route.params.shelfName,
        })}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{
          headerTitle: "Book Details",
        }}
      />
      <Stack.Screen
        name="MoveBook"
        component={MoveBookScreen}
        options={{
          headerTitle: "Move Book",
        }}
      />
    </Stack.Navigator>
  );
}
