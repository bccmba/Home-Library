import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

const mockUpdateBookShelf = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

let mockRouteParams: any = null;
jest.mock("@react-navigation/native", () => {
  return {
    useNavigation: () => ({ goBack: mockGoBack }),
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
    updateBookShelf: mockUpdateBookShelf,
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

describe("MoveBookScreen", () => {
  beforeEach(() => {
    mockUpdateBookShelf.mockClear();
    mockGoBack.mockClear();
    mockRouteParams = { bookId: "book-1" };
  });

  it("moves the book to selected shelf and returns", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/MoveBookScreen")
      .default as React.ComponentType;

    const { getByText } = render(<Screen />);

    fireEvent.press(getByText("Move Book"));

    await waitFor(() => {
      expect(mockUpdateBookShelf).toHaveBeenCalledWith("book-1", "shelf-2");
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});
