import { type Book, type Shelf, type InsertBook, type InsertShelf, books, shelves } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getShelves(): Promise<Shelf[]>;
  getShelf(id: string): Promise<Shelf | undefined>;
  createShelf(shelf: InsertShelf): Promise<Shelf>;
  deleteShelf(id: string): Promise<void>;
  
  getBooks(): Promise<Book[]>;
  getBooksByShelf(shelfId: string): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBookNotes(id: string, notes: string): Promise<Book | undefined>;
  updateBookShelf(id: string, shelfId: string): Promise<Book | undefined>;
  deleteBook(id: string): Promise<void>;
  
  clearAll(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getShelves(): Promise<Shelf[]> {
    return db.select().from(shelves);
  }

  async getShelf(id: string): Promise<Shelf | undefined> {
    const [shelf] = await db.select().from(shelves).where(eq(shelves.id, id));
    return shelf;
  }

  async createShelf(shelf: InsertShelf): Promise<Shelf> {
    const [newShelf] = await db.insert(shelves).values(shelf).returning();
    return newShelf;
  }

  async deleteShelf(id: string): Promise<void> {
    await db.delete(shelves).where(eq(shelves.id, id));
  }

  async getBooks(): Promise<Book[]> {
    return db.select().from(books);
  }

  async getBooksByShelf(shelfId: string): Promise<Book[]> {
    return db.select().from(books).where(eq(books.shelfId, shelfId));
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBookNotes(id: string, notes: string): Promise<Book | undefined> {
    const [updated] = await db
      .update(books)
      .set({ notes })
      .where(eq(books.id, id))
      .returning();
    return updated;
  }

  async updateBookShelf(id: string, shelfId: string): Promise<Book | undefined> {
    const [updated] = await db
      .update(books)
      .set({ shelfId })
      .where(eq(books.id, id))
      .returning();
    return updated;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async clearAll(): Promise<void> {
    await db.delete(books);
    await db.delete(shelves);
  }
}

export const storage = new DatabaseStorage();
