var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  books: () => books,
  insertBookSchema: () => insertBookSchema,
  insertShelfSchema: () => insertShelfSchema,
  shelves: () => shelves
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var shelves = pgTable("shelves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isbn: text("isbn").notNull(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull(),
  cover: text("cover").notNull(),
  pageCount: integer("page_count"),
  publishedYear: text("published_year"),
  shelfId: varchar("shelf_id").notNull().references(() => shelves.id, { onDelete: "cascade" }),
  notes: text("notes").default("").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull()
});
var insertShelfSchema = createInsertSchema(shelves).pick({
  name: true
});
var insertBookSchema = createInsertSchema(books).pick({
  isbn: true,
  title: true,
  authors: true,
  cover: true,
  pageCount: true,
  publishedYear: true,
  shelfId: true,
  notes: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getShelves() {
    return db.select().from(shelves);
  }
  async getShelf(id) {
    const [shelf] = await db.select().from(shelves).where(eq(shelves.id, id));
    return shelf;
  }
  async createShelf(shelf) {
    const [newShelf] = await db.insert(shelves).values(shelf).returning();
    return newShelf;
  }
  async deleteShelf(id) {
    await db.delete(shelves).where(eq(shelves.id, id));
  }
  async getBooks() {
    return db.select().from(books);
  }
  async getBooksByShelf(shelfId) {
    return db.select().from(books).where(eq(books.shelfId, shelfId));
  }
  async getBook(id) {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }
  async createBook(book) {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }
  async updateBookNotes(id, notes) {
    const [updated] = await db.update(books).set({ notes }).where(eq(books.id, id)).returning();
    return updated;
  }
  async updateBookShelf(id, shelfId) {
    const [updated] = await db.update(books).set({ shelfId }).where(eq(books.id, id)).returning();
    return updated;
  }
  async deleteBook(id) {
    await db.delete(books).where(eq(books.id, id));
  }
  async clearAll() {
    await db.delete(books);
    await db.delete(shelves);
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/shelves", async (_req, res) => {
    try {
      const shelves2 = await storage.getShelves();
      res.json(shelves2);
    } catch (error) {
      console.error("Error fetching shelves:", error);
      res.status(500).json({ error: "Failed to fetch shelves" });
    }
  });
  app2.post("/api/shelves", async (req, res) => {
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
  app2.delete("/api/shelves/:id", async (req, res) => {
    try {
      await storage.deleteShelf(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting shelf:", error);
      res.status(500).json({ error: "Failed to delete shelf" });
    }
  });
  app2.get("/api/books", async (_req, res) => {
    try {
      const books2 = await storage.getBooks();
      res.json(books2);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });
  app2.get("/api/books/:id", async (req, res) => {
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
  app2.post("/api/books", async (req, res) => {
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
  app2.patch("/api/books/:id/notes", async (req, res) => {
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
  app2.patch("/api/books/:id/shelf", async (req, res) => {
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
  app2.delete("/api/books/:id", async (req, res) => {
    try {
      await storage.deleteBook(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  });
  app2.delete("/api/library", async (_req, res) => {
    try {
      await storage.clearAll();
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing library:", error);
      res.status(500).json({ error: "Failed to clear library" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    if (origin && origins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, req, res, next) => {
    const error = err;
    if (res.headersSent) {
      return next(err);
    }
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Unhandled error:", {
      method: req.method,
      path: req.path,
      status,
      message
    });
    res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  const server = await registerRoutes(app);
  configureExpoAndLanding(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
