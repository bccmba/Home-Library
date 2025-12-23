import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockUpdateBookReadStatus = jest.fn();
const mockNavigate = jest.fn();

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
    useNavigation: () => ({ goBack: jest.fn(), navigate: mockNavigate }),
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
    ],
    updateBookNotes: jest.fn(),
    updateBookReadStatus: mockUpdateBookReadStatus,
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
    },
  }),
}));

describe("BookDetailScreen (Reading Status)", () => {
  beforeEach(() => {
    mockUpdateBookReadStatus.mockClear();
    mockNavigate.mockClear();
    mockRouteParams = { bookId: "book-1" };
  });

  it("calls updateBookReadStatus(true) when 'Read' pressed", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/BookDetailScreen")
      .default as React.ComponentType;
    const { getByText } = render(<Screen />);

    fireEvent.press(getByText("Read"));
    expect(mockUpdateBookReadStatus).toHaveBeenCalledWith("book-1", true);
  });

  it("calls updateBookReadStatus(false) when 'Not read' pressed", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/BookDetailScreen")
      .default as React.ComponentType;
    const { getByText } = render(<Screen />);

    fireEvent.press(getByText("Not read"));
    expect(mockUpdateBookReadStatus).toHaveBeenCalledWith("book-1", false);
  });

  it("navigates to MoveBook when 'Move to Shelf' pressed", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/BookDetailScreen")
      .default as React.ComponentType;
    const { getByText } = render(<Screen />);

    fireEvent.press(getByText("Move to Shelf"));
    expect(mockNavigate).toHaveBeenCalledWith("MoveBook", { bookId: "book-1" });
  });
});
