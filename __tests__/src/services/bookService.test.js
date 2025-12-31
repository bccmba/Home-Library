import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { addBook, getBooks, updateBook, deleteBook } from "../../../src/services/bookService";

// Mock Firebase Firestore functions
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
}));

// Mock the db instance
jest.mock("../../../firebase", () => ({
  db: {},
}));

describe("bookService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log to avoid test output noise
  });

  describe("addBook", () => {
    it("should add a book and return the document ID", async () => {
      const mockBook = {
        title: "Test Book",
        author: "Test Author",
        isbn: "1234567890",
      };
      const mockDocRef = { id: "book-123" };

      collection.mockReturnValue("mockCollection");
      addDoc.mockResolvedValue(mockDocRef);

      const result = await addBook(mockBook);

      expect(collection).toHaveBeenCalledWith(db, "books");
      expect(addDoc).toHaveBeenCalledWith("mockCollection", mockBook);
      expect(result).toBe("book-123");
    });

    it("should handle errors when adding a book", async () => {
      const mockBook = { title: "Test Book", author: "Test Author" };
      const mockError = new Error("Firebase error");

      collection.mockReturnValue("mockCollection");
      addDoc.mockRejectedValue(mockError);

      await expect(addBook(mockBook)).rejects.toThrow("Firebase error");
      expect(console.log).toHaveBeenCalledWith("Error adding book:", mockError);
    });
  });

  describe("getBooks", () => {
    it("should fetch all books sorted by title", async () => {
      const mockBooks = [
        { id: "book-1", data: () => ({ title: "A Book", author: "Author 1" }) },
        { id: "book-2", data: () => ({ title: "B Book", author: "Author 2" }) },
      ];

      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          mockBooks.forEach((book) => callback(book));
        }),
      };

      collection.mockReturnValue("mockCollection");
      orderBy.mockReturnValue("mockOrderBy");
      query.mockReturnValue("mockQuery");
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getBooks();

      expect(collection).toHaveBeenCalledWith(db, "books");
      expect(orderBy).toHaveBeenCalledWith("title");
      expect(query).toHaveBeenCalledWith("mockCollection", "mockOrderBy");
      expect(getDocs).toHaveBeenCalledWith("mockQuery");
      expect(result).toEqual([
        { id: "book-1", title: "A Book", author: "Author 1" },
        { id: "book-2", title: "B Book", author: "Author 2" },
      ]);
    });

    it("should handle errors when fetching books", async () => {
      const mockError = new Error("Firebase error");

      collection.mockReturnValue("mockCollection");
      orderBy.mockReturnValue("mockOrderBy");
      query.mockReturnValue("mockQuery");
      getDocs.mockRejectedValue(mockError);

      await expect(getBooks()).rejects.toThrow("Firebase error");
      expect(console.log).toHaveBeenCalledWith("Error fetching books:", mockError);
    });

    it("should return empty array when no books exist", async () => {
      const mockSnapshot = {
        forEach: jest.fn(),
      };

      collection.mockReturnValue("mockCollection");
      orderBy.mockReturnValue("mockOrderBy");
      query.mockReturnValue("mockQuery");
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getBooks();

      expect(result).toEqual([]);
    });
  });

  describe("updateBook", () => {
    it("should update a book with the given ID", async () => {
      const bookId = "book-123";
      const updatedData = { title: "Updated Title", author: "Updated Author" };

      doc.mockReturnValue("mockDoc");
      updateDoc.mockResolvedValue(undefined);

      await updateBook(bookId, updatedData);

      expect(doc).toHaveBeenCalledWith(db, "books", bookId);
      expect(updateDoc).toHaveBeenCalledWith("mockDoc", updatedData);
    });

    it("should handle errors when updating a book", async () => {
      const bookId = "book-123";
      const updatedData = { title: "Updated Title" };
      const mockError = new Error("Firebase error");

      doc.mockReturnValue("mockDoc");
      updateDoc.mockRejectedValue(mockError);

      await expect(updateBook(bookId, updatedData)).rejects.toThrow("Firebase error");
      expect(console.log).toHaveBeenCalledWith("Error updating book:", mockError);
    });
  });

  describe("deleteBook", () => {
    it("should delete a book with the given ID", async () => {
      const bookId = "book-123";

      doc.mockReturnValue("mockDoc");
      deleteDoc.mockResolvedValue(undefined);

      await deleteBook(bookId);

      expect(doc).toHaveBeenCalledWith(db, "books", bookId);
      expect(deleteDoc).toHaveBeenCalledWith("mockDoc");
    });

    it("should handle errors when deleting a book", async () => {
      const bookId = "book-123";
      const mockError = new Error("Firebase error");

      doc.mockReturnValue("mockDoc");
      deleteDoc.mockRejectedValue(mockError);

      await expect(deleteBook(bookId)).rejects.toThrow("Firebase error");
      expect(console.log).toHaveBeenCalledWith("Error deleting book:", mockError);
    });
  });
});

