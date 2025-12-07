import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertBookSchema, insertShelfSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Shelves API
  app.get("/api/shelves", async (_req, res) => {
    try {
      const shelves = await storage.getShelves();
      res.json(shelves);
    } catch (error) {
      console.error("Error fetching shelves:", error);
      res.status(500).json({ error: "Failed to fetch shelves" });
    }
  });

  app.post("/api/shelves", async (req, res) => {
    try {
      const parsed = insertShelfSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const shelf = await storage.createShelf(parsed.data);
      res.status(201).json(shelf);
    } catch (error) {
      console.error("Error creating shelf:", error);
      res.status(500).json({ error: "Failed to create shelf" });
    }
  });

  app.delete("/api/shelves/:id", async (req, res) => {
    try {
      await storage.deleteShelf(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting shelf:", error);
      res.status(500).json({ error: "Failed to delete shelf" });
    }
  });

  // Books API
  app.get("/api/books", async (_req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const parsed = insertBookSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const book = await storage.createBook(parsed.data);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  app.patch("/api/books/:id/notes", async (req, res) => {
    try {
      const { notes } = req.body;
      if (typeof notes !== "string") {
        return res.status(400).json({ error: "Notes must be a string" });
      }
      const book = await storage.updateBookNotes(req.params.id, notes);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error updating book notes:", error);
      res.status(500).json({ error: "Failed to update book notes" });
    }
  });

  app.patch("/api/books/:id/shelf", async (req, res) => {
    try {
      const { shelfId } = req.body;
      if (typeof shelfId !== "string") {
        return res.status(400).json({ error: "shelfId must be a string" });
      }
      const book = await storage.updateBookShelf(req.params.id, shelfId);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error updating book shelf:", error);
      res.status(500).json({ error: "Failed to update book shelf" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      await storage.deleteBook(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Clear all data
  app.delete("/api/library", async (_req, res) => {
    try {
      await storage.clearAll();
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing library:", error);
      res.status(500).json({ error: "Failed to clear library" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
