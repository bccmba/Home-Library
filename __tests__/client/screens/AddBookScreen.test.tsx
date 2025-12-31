import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";

const mockAddBook = jest.fn();
const mockGoBack = jest.fn();

jest.mock("../../src/services/bookService", () => ({
  addBook: (...args: any[]) => mockAddBook(...args),
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: "success",
  },
}));

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    theme: {
      backgroundRoot: "#fff",
      backgroundDefault: "#fff",
      text: "#111",
      link: "#00f",
      buttonText: "#fff",
    },
  }),
}));

jest.mock("@/components/KeyboardAwareScrollViewCompat", () => ({
  KeyboardAwareScrollViewCompat: ({ children }: any) => children,
}));

// Mock Alert
jest.spyOn(Alert, "alert");

describe("AddBookScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockClear();
  });

  it("renders the form with all input fields", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByPlaceholderText } = render(<Screen />);

    expect(getByPlaceholderText("Enter book title")).toBeTruthy();
    expect(getByPlaceholderText("Enter author name")).toBeTruthy();
    expect(getByPlaceholderText("Enter ISBN (optional)")).toBeTruthy();
    expect(getByPlaceholderText("Enter page count (optional)")).toBeTruthy();
    expect(getByPlaceholderText("Enter published year (optional)")).toBeTruthy();
  });

  it("disables submit button when title is empty", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText, getByPlaceholderText } = render(<Screen />);

    const titleInput = getByPlaceholderText("Enter book title");
    const submitButton = getByText("Add Book");

    fireEvent.changeText(titleInput, "");
    expect(submitButton.props.disabled).toBe(true);
  });

  it("disables submit button when author is empty", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText, getByPlaceholderText } = render(<Screen />);

    const titleInput = getByPlaceholderText("Enter book title");
    const authorInput = getByPlaceholderText("Enter author name");

    fireEvent.changeText(titleInput, "Test Title");
    fireEvent.changeText(authorInput, "");
    expect(getByText("Add Book").props.disabled).toBe(true);
  });

  it("shows validation error when title is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText } = render(<Screen />);

    fireEvent.press(getByText("Add Book"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Validation Error",
        "Please enter a book title.",
      );
    });
    expect(mockAddBook).not.toHaveBeenCalled();
  });

  it("shows validation error when author is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText, getByPlaceholderText } = render(<Screen />);

    const titleInput = getByPlaceholderText("Enter book title");
    fireEvent.changeText(titleInput, "Test Title");
    fireEvent.press(getByText("Add Book"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Validation Error",
        "Please enter an author name.",
      );
    });
    expect(mockAddBook).not.toHaveBeenCalled();
  });

  it("submits the form with all required fields", async () => {
    mockAddBook.mockResolvedValue("book-123");

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText, getByPlaceholderText } = render(<Screen />);

    const titleInput = getByPlaceholderText("Enter book title");
    const authorInput = getByPlaceholderText("Enter author name");

    fireEvent.changeText(titleInput, "Test Book");
    fireEvent.changeText(authorInput, "Test Author");
    fireEvent.press(getByText("Add Book"));

    await waitFor(() => {
      expect(mockAddBook).toHaveBeenCalledWith({
        title: "Test Book",
        author: "Test Author",
      });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Book added successfully!",
        expect.any(Array),
      );
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
  });

  it("submits the form with optional fields", async () => {
    mockAddBook.mockResolvedValue("book-123");

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText, getByPlaceholderText } = render(<Screen />);

    fireEvent.changeText(getByPlaceholderText("Enter book title"), "Test Book");
    fireEvent.changeText(getByPlaceholderText("Enter author name"), "Test Author");
    fireEvent.changeText(getByPlaceholderText("Enter ISBN (optional)"), "1234567890");
    fireEvent.changeText(getByPlaceholderText("Enter page count (optional)"), "300");
    fireEvent.changeText(getByPlaceholderText("Enter published year (optional)"), "2020");

    fireEvent.press(getByText("Add Book"));

    await waitFor(() => {
      expect(mockAddBook).toHaveBeenCalledWith({
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
        pageCount: 300,
        publishedYear: "2020",
      });
    });
  });

  it("handles errors when adding book fails", async () => {
    const error = new Error("Failed to add book");
    mockAddBook.mockRejectedValue(error);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText, getByPlaceholderText } = render(<Screen />);

    fireEvent.changeText(getByPlaceholderText("Enter book title"), "Test Book");
    fireEvent.changeText(getByPlaceholderText("Enter author name"), "Test Author");
    fireEvent.press(getByText("Add Book"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to add book. Please try again.");
    });
  });

  it("clears form after successful submission", async () => {
    mockAddBook.mockResolvedValue("book-123");

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Screen = require("@/screens/AddBookScreen").default as React.ComponentType;

    const { getByText, getByPlaceholderText } = render(<Screen />);

    const titleInput = getByPlaceholderText("Enter book title");
    const authorInput = getByPlaceholderText("Enter author name");

    fireEvent.changeText(titleInput, "Test Book");
    fireEvent.changeText(authorInput, "Test Author");
    fireEvent.press(getByText("Add Book"));

    await waitFor(() => {
      expect(mockAddBook).toHaveBeenCalled();
    });

    // Simulate pressing OK on the success alert
    const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
      (call) => call[0] === "Success",
    );
    if (alertCall && alertCall[2] && alertCall[2][0]) {
      alertCall[2][0].onPress();
    }

    await waitFor(() => {
      expect(titleInput.props.value).toBe("");
      expect(authorInput.props.value).toBe("");
    });
  });
});

