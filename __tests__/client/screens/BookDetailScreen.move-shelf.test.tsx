import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockUpdateBookShelf = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 0,
}));

jest.mock("@react-navigation/bottom-tabs", () => ({
  useBottomTabBarHeight: () => 0,
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: any) => children ?? null,
}));

let mockRouteParams: any = null;
jest.mock("@react-navigation/native", () => {
  return {
    useNavigation: () => ({ goBack: jest.fn() }),
    useRoute: () => ({ params: mockRouteParams }),
  };
});

jest.mock("@/store/libraryStore", () => ({
  useLibraryStore: () => ({
    books: [
      {
        id: "book-1",
        isbn: "x",
        title: "t",
        authors: ["a"],
        cover: "c",
        shelfId: "shelf-1",
        isRead: false,
        notes: "",
        addedAt: new Date().toISOString(),
      },
    ],
    shelves: [
      { id: "shelf-1", name: "Shelf 1", createdAt: new Date().toISOString() },
      { id: "shelf-2", name: "Shelf 2", createdAt: new Date().toISOString() },
    ],
    updateBookNotes: jest.fn(),
    updateBookReadStatus: jest.fn(),
    updateBookShelf: mockUpdateBookShelf,
    removeBook: jest.fn(),
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
      textSecondary: "#666",
      buttonText: "#fff",
    },
  }),
}));

describe("BookDetailScreen (Move to Shelf)", () => {
  beforeEach(() => {
    mockUpdateBookShelf.mockClear();
    mockRouteParams = { bookId: "book-1" };
  });

  it("calls updateBookShelf when selecting a different shelf", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/BookDetailScreen")
      .default as React.ComponentType;
    const { getByLabelText } = render(<Screen />);

    fireEvent.press(getByLabelText("MoveShelfSelector"));
    fireEvent.press(getByLabelText("MoveShelfOption:shelf-2"));

    expect(mockUpdateBookShelf).toHaveBeenCalledWith("book-1", "shelf-2");
  });
});
