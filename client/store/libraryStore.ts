import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/query-client";

export interface Book {
  id: string;
  isbn: string;
  title: string;
  authors: string[];
  cover: string;
  pageCount?: number;
  publishedYear?: string;
  shelfId: string;
  isRead: boolean;
  notes: string;
  addedAt: string;
}

export interface Shelf {
  id: string;
  name: string;
  createdAt: string;
}

interface LibraryState {
  books: Book[];
  shelves: Shelf[];
  isLoading: boolean;
}

let globalState: LibraryState = {
  books: [],
  shelves: [],
  isLoading: true,
};

let listeners: Set<() => void> = new Set();
let initCompleted = false;
let initInFlight: Promise<void> | null = null;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

async function fetchInitialData() {
  if (initCompleted) return;
  if (initInFlight) return initInFlight;

  // Mark loading true on first load and on retries
  globalState = { ...globalState, isLoading: true };
  notifyListeners();

  initInFlight = (async () => {
    try {
      // Use the shared apiRequest helper so behavior is consistent with
      // other client requests and tests can mock `apiRequest` reliably.
      const [shelvesRes, booksRes] = await Promise.all([
        apiRequest("GET", "/api/shelves"),
        apiRequest("GET", "/api/books"),
      ]);

      const shelves = await shelvesRes.json();
      const books = await booksRes.json();

      globalState = {
        shelves: shelves.map((s: any) => ({
          ...s,
          createdAt: s.createdAt || s.created_at,
        })),
        books: books.map((b: any) => ({
          ...b,
          shelfId: b.shelfId || b.shelf_id,
          pageCount: b.pageCount || b.page_count,
          publishedYear: b.publishedYear || b.published_year,
          addedAt: b.addedAt || b.added_at,
        })),
        isLoading: false,
      };

      initCompleted = true;
      notifyListeners();
    } catch (error) {
      // Allow future retries if the initial load fails (e.g., network/env issues).
      console.error("Failed to fetch library data:", error);
      globalState = { ...globalState, isLoading: false };
      initCompleted = false;
      initInFlight = null;
      notifyListeners();
    }
  })();

  return initInFlight;
}

export function useLibraryStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    fetchInitialData();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addBook = useCallback(
    async (bookData: Omit<Book, "id" | "addedAt">) => {
      try {
        const response = await apiRequest("POST", "/api/books", {
          isbn: bookData.isbn,
          title: bookData.title,
          authors: bookData.authors,
          cover: bookData.cover,
          pageCount: bookData.pageCount,
          publishedYear: bookData.publishedYear,
          shelfId: bookData.shelfId,
          isRead: bookData.isRead,
          notes: bookData.notes || "",
        });

        const newBook = await response.json();
        const book: Book = {
          ...newBook,
          shelfId: newBook.shelfId || newBook.shelf_id,
          pageCount: newBook.pageCount || newBook.page_count,
          publishedYear: newBook.publishedYear || newBook.published_year,
          isRead: newBook.isRead ?? newBook.is_read ?? false,
          addedAt: newBook.addedAt || newBook.added_at,
        };

        globalState = {
          ...globalState,
          books: [...globalState.books, book],
        };
        notifyListeners();
        return book;
      } catch (error) {
        console.error("Failed to add book:", error);
        throw error;
      }
    },
    [],
  );

  const removeBook = useCallback(async (bookId: string) => {
    try {
      await apiRequest("DELETE", `/api/books/${bookId}`);
      globalState = {
        ...globalState,
        books: globalState.books.filter((b) => b.id !== bookId),
      };
      notifyListeners();
    } catch (error) {
      console.error("Failed to remove book:", error);
      throw error;
    }
  }, []);

  const updateBookNotes = useCallback(async (bookId: string, notes: string) => {
    try {
      await apiRequest("PATCH", `/api/books/${bookId}/notes`, { notes });
      globalState = {
        ...globalState,
        books: globalState.books.map((b) =>
          b.id === bookId ? { ...b, notes } : b,
        ),
      };
      notifyListeners();
    } catch (error) {
      console.error("Failed to update book notes:", error);
      throw error;
    }
  }, []);

  const updateBookReadStatus = useCallback(
    async (bookId: string, isRead: boolean) => {
      try {
        await apiRequest("PATCH", `/api/books/${bookId}/read-status`, {
          isRead,
        });
        globalState = {
          ...globalState,
          books: globalState.books.map((b) =>
            b.id === bookId ? { ...b, isRead } : b,
          ),
        };
        notifyListeners();
      } catch (error) {
        console.error("Failed to update book read status:", error);
        throw error;
      }
    },
    [],
  );

  const updateBookShelf = useCallback(
    async (bookId: string, shelfId: string) => {
      try {
        await apiRequest("PATCH", `/api/books/${bookId}/shelf`, { shelfId });
        globalState = {
          ...globalState,
          books: globalState.books.map((b) =>
            b.id === bookId ? { ...b, shelfId } : b,
          ),
        };
        notifyListeners();
      } catch (error) {
        console.error("Failed to update book shelf:", error);
        throw error;
      }
    },
    [],
  );

  const addShelf = useCallback(async (name: string) => {
    try {
      const response = await apiRequest("POST", "/api/shelves", { name });
      const newShelf = await response.json();
      const shelf: Shelf = {
        ...newShelf,
        createdAt: newShelf.createdAt || newShelf.created_at,
      };

      globalState = {
        ...globalState,
        shelves: [...globalState.shelves, shelf],
      };
      notifyListeners();
      return shelf;
    } catch (error) {
      console.error("Failed to add shelf:", error);
      throw error;
    }
  }, []);

  const removeShelf = useCallback(async (shelfId: string) => {
    try {
      await apiRequest("DELETE", `/api/shelves/${shelfId}`);
      globalState = {
        ...globalState,
        shelves: globalState.shelves.filter((s) => s.id !== shelfId),
        books: globalState.books.filter((b) => b.shelfId !== shelfId),
      };
      notifyListeners();
    } catch (error) {
      console.error("Failed to remove shelf:", error);
      throw error;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await apiRequest("DELETE", "/api/library");
      globalState = {
        books: [],
        shelves: [],
        isLoading: false,
      };
      notifyListeners();
    } catch (error) {
      console.error("Failed to clear library:", error);
      throw error;
    }
  }, []);

  return {
    books: globalState.books,
    shelves: globalState.shelves,
    isLoading: globalState.isLoading,
    addBook,
    removeBook,
    updateBookNotes,
    updateBookReadStatus,
    updateBookShelf,
    addShelf,
    removeShelf,
    clearAll,
  };
}
