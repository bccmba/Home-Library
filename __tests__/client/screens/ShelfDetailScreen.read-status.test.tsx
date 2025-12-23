import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockUpdateBookReadStatus = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-native-reanimated", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native-reanimated/mock"),
);

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

let mockRouteParams: any = null;
jest.mock("@react-navigation/native", () => {
  return {
    useNavigation: () => ({ navigate: mockNavigate }),
    useRoute: () => ({ params: mockRouteParams }),
  };
});

jest.mock("@/store/libraryStore", () => ({
  useLibraryStore: () => ({
    books: [
      {
        id: "book-1",
        isbn: "x",
        title: "Test Book",
        authors: ["A"],
        cover: "c",
        shelfId: "shelf-1",
        isRead: false,
        notes: "",
        addedAt: new Date().toISOString(),
      },
    ],
    updateBookReadStatus: mockUpdateBookReadStatus,
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
    },
  }),
}));

describe("ShelfDetailScreen (Read toggle)", () => {
  beforeEach(() => {
    mockUpdateBookReadStatus.mockClear();
    mockNavigate.mockClear();
    mockRouteParams = { shelfId: "shelf-1", shelfName: "Shelf 1" };
  });

  it("calls updateBookReadStatus when toggle is pressed", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/ShelfDetailScreen")
      .default as React.ComponentType;
    const { getByLabelText } = render(<Screen />);

    fireEvent.press(getByLabelText("Mark Test Book as read"));
    expect(mockUpdateBookReadStatus).toHaveBeenCalledWith("book-1", true);
  });
});
