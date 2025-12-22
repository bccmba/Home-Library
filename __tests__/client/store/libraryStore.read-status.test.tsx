import React, { useEffect } from "react";
import { render, act } from "@testing-library/react-native";

jest.mock("@/lib/query-client", () => {
  return {
    getApiUrl: jest.fn(() => "https://example.com"),
    apiRequest: jest.fn(),
  };
});

describe("client/store/libraryStore (isRead)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends isRead when creating a book and stores it locally", async () => {
    const { apiRequest } = require("@/lib/query-client") as {
      apiRequest: jest.Mock;
    };
    const { useLibraryStore } =
      require("@/store/libraryStore") as typeof import("@/store/libraryStore");

    (global.fetch as any) = jest
      .fn()
      .mockResolvedValueOnce({ json: async () => [] })
      .mockResolvedValueOnce({ json: async () => [] });

    let latest: any = null;
    function Harness({ onUpdate }: { onUpdate: (s: any) => void }) {
      const store = useLibraryStore();
      useEffect(() => {
        onUpdate(store);
      }, [store, onUpdate]);
      return null;
    }

    apiRequest.mockImplementation(async (method: string, route: string) => {
      if (method === "DELETE" && route === "/api/library") return {};
      if (method === "POST" && route === "/api/books") {
        return {
          json: async () => ({
            id: "book-1",
            isbn: "9780143127741",
            title: "Test Book",
            authors: ["Someone"],
            cover: "https://example.com/cover.png",
            pageCount: 123,
            publishedYear: "2020",
            shelf_id: "shelf-1",
            is_read: true,
            notes: "",
            added_at: new Date().toISOString(),
          }),
        };
      }
      throw new Error(`Unexpected apiRequest: ${method} ${route}`);
    });

    render(<Harness onUpdate={(s) => (latest = s)} />);

    await act(async () => {
      // make sure any previous state is cleared
      await latest.clearAll();
    });

    await act(async () => {
      await latest.addBook({
        isbn: "9780143127741",
        title: "Test Book",
        authors: ["Someone"],
        cover: "https://example.com/cover.png",
        pageCount: 123,
        publishedYear: "2020",
        shelfId: "shelf-1",
        isRead: true,
        notes: "",
      });
    });

    expect(apiRequest).toHaveBeenCalledWith(
      "POST",
      "/api/books",
      expect.any(Object),
    );
    const postCall = apiRequest.mock.calls.find((c: any[]) => c[0] === "POST");
    const body = postCall[2];
    expect(body.isRead).toBe(true);

    expect(latest.books).toHaveLength(1);
    expect(latest.books[0].isRead).toBe(true);
  });

  it("updates read status locally after API call", async () => {
    const { apiRequest } = require("@/lib/query-client") as {
      apiRequest: jest.Mock;
    };
    const { useLibraryStore } =
      require("@/store/libraryStore") as typeof import("@/store/libraryStore");

    (global.fetch as any) = jest
      .fn()
      .mockResolvedValueOnce({ json: async () => [] })
      .mockResolvedValueOnce({ json: async () => [] });

    let latest: any = null;
    function Harness({ onUpdate }: { onUpdate: (s: any) => void }) {
      const store = useLibraryStore();
      useEffect(() => {
        onUpdate(store);
      }, [store, onUpdate]);
      return null;
    }

    apiRequest.mockImplementation(async (method: string, route: string) => {
      if (method === "DELETE" && route === "/api/library") return {};
      if (method === "POST" && route === "/api/books") {
        return {
          json: async () => ({
            id: "book-1",
            isbn: "x",
            title: "t",
            authors: ["a"],
            cover: "c",
            shelf_id: "shelf-1",
            is_read: false,
            notes: "",
            added_at: new Date().toISOString(),
          }),
        };
      }
      if (method === "PATCH" && route === "/api/books/book-1/read-status")
        return {};
      throw new Error(`Unexpected apiRequest: ${method} ${route}`);
    });

    render(<Harness onUpdate={(s) => (latest = s)} />);

    await act(async () => {
      await latest.clearAll();
    });

    await act(async () => {
      await latest.addBook({
        isbn: "x",
        title: "t",
        authors: ["a"],
        cover: "c",
        shelfId: "shelf-1",
        isRead: false,
        notes: "",
      });
    });

    expect(latest.books[0].isRead).toBe(false);

    await act(async () => {
      await latest.updateBookReadStatus("book-1", true);
    });

    expect(apiRequest).toHaveBeenCalledWith(
      "PATCH",
      "/api/books/book-1/read-status",
      {
        isRead: true,
      },
    );
    expect(latest.books[0].isRead).toBe(true);
  });
});
