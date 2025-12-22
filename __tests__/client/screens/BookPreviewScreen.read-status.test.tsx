import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";

const mockAddBook = jest.fn();
const mockPopTo = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "Success" },
}));

jest.mock("@/components/KeyboardAwareScrollViewCompat", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    KeyboardAwareScrollViewCompat: ({ children }: any) =>
      React.createElement(View, null, children),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

let mockRouteParams: any = null;
jest.mock("@react-navigation/native", () => {
  return {
    useNavigation: () => ({ popTo: mockPopTo }),
    useRoute: () => ({ params: mockRouteParams }),
  };
});

jest.mock("@/store/libraryStore", () => ({
  useLibraryStore: () => ({
    shelves: [
      { id: "shelf-1", name: "Shelf 1", createdAt: new Date().toISOString() },
    ],
    addBook: mockAddBook,
    addShelf: jest.fn(),
    books: [],
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    theme: {
      backgroundRoot: "#fff",
      backgroundDefault: "#fff",
      text: "#111",
      link: "#00f",
    },
  }),
}));

describe("BookPreviewScreen (Reading Status)", () => {
  beforeEach(() => {
    mockAddBook.mockClear();
    mockPopTo.mockClear();
    mockRouteParams = {
      isbn: "9780143127741",
      title: "Test Book",
      authors: ["Someone"],
      cover: "https://example.com/cover.png",
      pageCount: 123,
      publishedYear: "2020",
    };
  });

  it("calls addBook with isRead=true when 'Read' is selected", async () => {
    const Screen = require("@/screens/BookPreviewScreen")
      .default as React.ComponentType;
    const { getByText } = render(<Screen />);

    await act(async () => {
      fireEvent.press(getByText("Read").parent as any);
    });
    await act(async () => {
      fireEvent.press(getByText("Add to Library").parent as any);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockAddBook).toHaveBeenCalledWith(
      expect.objectContaining({
        isbn: "9780143127741",
        shelfId: "shelf-1",
        isRead: true,
      }),
    );
    expect(mockPopTo).toHaveBeenCalledWith("Main");
  });

  it("defaults to isRead=false when not changed", async () => {
    const Screen = require("@/screens/BookPreviewScreen")
      .default as React.ComponentType;
    const { getByText } = render(<Screen />);

    await act(async () => {
      fireEvent.press(getByText("Add to Library").parent as any);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockAddBook).toHaveBeenCalledWith(
      expect.objectContaining({
        isRead: false,
      }),
    );
  });
});
