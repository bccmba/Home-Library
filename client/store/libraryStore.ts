import { useState, useCallback } from "react";

export interface Book {
  id: string;
  isbn: string;
  title: string;
  authors: string[];
  cover: string;
  pageCount?: number;
  publishedYear?: string;
  shelfId: string;
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
}

let globalState: LibraryState = {
  books: [],
  shelves: [],
};

let listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function useLibraryStore() {
  const [, forceUpdate] = useState({});

  const subscribe = useCallback(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  useState(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  });

  const addBook = useCallback(
    (bookData: Omit<Book, "id" | "addedAt" | "notes"> & { notes?: string }) => {
      const newBook: Book = {
        ...bookData,
        id: generateId(),
        notes: bookData.notes || "",
        addedAt: new Date().toISOString(),
      };
      globalState = {
        ...globalState,
        books: [...globalState.books, newBook],
      };
      notifyListeners();
      return newBook;
    },
    []
  );

  const removeBook = useCallback((bookId: string) => {
    globalState = {
      ...globalState,
      books: globalState.books.filter((b) => b.id !== bookId),
    };
    notifyListeners();
  }, []);

  const updateBookNotes = useCallback((bookId: string, notes: string) => {
    globalState = {
      ...globalState,
      books: globalState.books.map((b) =>
        b.id === bookId ? { ...b, notes } : b
      ),
    };
    notifyListeners();
  }, []);

  const updateBookShelf = useCallback((bookId: string, shelfId: string) => {
    globalState = {
      ...globalState,
      books: globalState.books.map((b) =>
        b.id === bookId ? { ...b, shelfId } : b
      ),
    };
    notifyListeners();
  }, []);

  const addShelf = useCallback((name: string) => {
    const newShelf: Shelf = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
    };
    globalState = {
      ...globalState,
      shelves: [...globalState.shelves, newShelf],
    };
    notifyListeners();
    return newShelf;
  }, []);

  const removeShelf = useCallback((shelfId: string) => {
    globalState = {
      ...globalState,
      shelves: globalState.shelves.filter((s) => s.id !== shelfId),
      books: globalState.books.filter((b) => b.shelfId !== shelfId),
    };
    notifyListeners();
  }, []);

  const clearAll = useCallback(() => {
    globalState = {
      books: [],
      shelves: [],
    };
    notifyListeners();
  }, []);

  return {
    books: globalState.books,
    shelves: globalState.shelves,
    addBook,
    removeBook,
    updateBookNotes,
    updateBookShelf,
    addShelf,
    removeShelf,
    clearAll,
  };
}
