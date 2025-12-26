import { insertBookSchema } from "../../shared/schema";

describe("shared/schema insertBookSchema (isRead)", () => {
  const base = {
    isbn: "9780143127741",
    title: "Test Book",
    authors: ["Someone"],
    cover: "https://example.com/cover.png",
    pageCount: 123,
    publishedYear: "2020",
    shelfId: "shelf-1",
    notes: "",
  };

  it("accepts isRead: true", () => {
    const parsed = insertBookSchema.safeParse({ ...base, isRead: true });
    expect(parsed.success).toBe(true);
  });

  it("accepts isRead: false", () => {
    const parsed = insertBookSchema.safeParse({ ...base, isRead: false });
    expect(parsed.success).toBe(true);
  });

  it("rejects non-boolean isRead", () => {
    const parsed = insertBookSchema.safeParse({ ...base, isRead: "yes" });
    expect(parsed.success).toBe(false);
  });
});
