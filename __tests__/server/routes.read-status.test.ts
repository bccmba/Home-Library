import express from "express";
import request from "supertest";

import { registerRoutes } from "../../server/routes";
import { storage } from "../../server/storage";

jest.mock("../../server/storage", () => {
  return {
    storage: {
      updateBookReadStatus: jest.fn(),
    },
  };
});

describe("PATCH /api/books/:id/read-status", () => {
  it("updates read status when isRead is boolean", async () => {
    (storage.updateBookReadStatus as jest.Mock).mockResolvedValue({
      id: "book-1",
      isbn: "x",
      title: "t",
      authors: ["a"],
      cover: "c",
      shelfId: "s",
      isRead: true,
      notes: "",
      addedAt: new Date().toISOString(),
    });

    const app = express();
    app.use(express.json());
    await registerRoutes(app);

    const res = await request(app)
      .patch("/api/books/book-1/read-status")
      .send({ isRead: true });

    expect(res.status).toBe(200);
    expect(storage.updateBookReadStatus).toHaveBeenCalledWith("book-1", true);
    expect(res.body.isRead).toBe(true);
  });

  it("rejects non-boolean isRead", async () => {
    const app = express();
    app.use(express.json());
    await registerRoutes(app);

    const res = await request(app)
      .patch("/api/books/book-1/read-status")
      .send({ isRead: "true" });

    expect(res.status).toBe(400);
  });
});
