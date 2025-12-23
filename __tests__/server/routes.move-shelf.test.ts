import express from "express";
import request from "supertest";

import { registerRoutes } from "../../server/routes";
import { storage } from "../../server/storage";

jest.mock("../../server/storage", () => {
  return {
    storage: {
      updateBookShelf: jest.fn(),
    },
  };
});

describe("PATCH /api/books/:id/shelf", () => {
  it("updates shelf when shelfId is string", async () => {
    (storage.updateBookShelf as jest.Mock).mockResolvedValue({
      id: "book-1",
      isbn: "x",
      title: "t",
      authors: ["a"],
      cover: "c",
      shelfId: "shelf-2",
      isRead: false,
      notes: "",
      addedAt: new Date().toISOString(),
    });

    const app = express();
    app.use(express.json());
    await registerRoutes(app);

    const res = await request(app)
      .patch("/api/books/book-1/shelf")
      .send({ shelfId: "shelf-2" });

    expect(res.status).toBe(200);
    expect(storage.updateBookShelf).toHaveBeenCalledWith("book-1", "shelf-2");
    expect(res.body.shelfId).toBe("shelf-2");
  });

  it("rejects non-string shelfId", async () => {
    const app = express();
    app.use(express.json());
    await registerRoutes(app);

    const res = await request(app)
      .patch("/api/books/book-1/shelf")
      .send({ shelfId: 123 });

    expect(res.status).toBe(400);
  });
});
