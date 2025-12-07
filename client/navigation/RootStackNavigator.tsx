import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import BookPreviewScreen from "@/screens/BookPreviewScreen";
import CreateShelfScreen from "@/screens/CreateShelfScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  BookPreview: {
    isbn: string;
    title: string;
    authors: string[];
    cover: string;
    pageCount?: number;
    publishedYear?: string;
  };
  CreateShelf: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookPreview"
        component={BookPreviewScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Book",
        }}
      />
      <Stack.Screen
        name="CreateShelf"
        component={CreateShelfScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Shelf",
        }}
      />
    </Stack.Navigator>
  );
}
