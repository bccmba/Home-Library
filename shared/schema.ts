import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shelves = pgTable("shelves", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  isbn: text("isbn").notNull(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull(),
  cover: text("cover").notNull(),
  pageCount: integer("page_count"),
  publishedYear: text("published_year"),
  shelfId: varchar("shelf_id").notNull().references(() => shelves.id, { onDelete: "cascade" }),
  notes: text("notes").default("").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertShelfSchema = createInsertSchema(shelves).pick({
  name: true,
});

export const insertBookSchema = createInsertSchema(books).pick({
  isbn: true,
  title: true,
  authors: true,
  cover: true,
  pageCount: true,
  publishedYear: true,
  shelfId: true,
  notes: true,
});

export type InsertShelf = z.infer<typeof insertShelfSchema>;
export type Shelf = typeof shelves.$inferSelect;

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
