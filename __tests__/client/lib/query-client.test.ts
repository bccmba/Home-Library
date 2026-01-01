import { apiRequest, getQueryFn } from "@/lib/query-client";

// Mock the env config
jest.mock("@/config/env", () => ({
  API_BASE_URL: "http://192.168.68.50:5000",
}));

// Mock fetch
global.fetch = jest.fn();

describe("query-client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("apiRequest", () => {

    it("should make a successful GET request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(""),
        statusText: "OK",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("GET", "/api/test");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          credentials: "include",
        }),
      );
      expect(result).toBe(mockResponse);
    });

    it("should make a POST request with data", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(""),
        statusText: "OK",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const data = { title: "Test" };
      await apiRequest("POST", "/api/test", data);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      );
    });

    it("should throw error for non-OK responses", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue("Not Found"),
        statusText: "Not Found",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(apiRequest("GET", "/api/test")).rejects.toThrow("404: Not Found");
    });

    it("should handle network errors with helpful message", async () => {
      const networkError = new TypeError("Network request failed");
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(apiRequest("GET", "/api/test")).rejects.toThrow(
        expect.stringContaining("Network request failed"),
      );
    });
  });

  describe("getQueryFn", () => {

    it("should fetch data successfully", async () => {
      const mockData = { id: "1", title: "Test" };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
        text: jest.fn().mockResolvedValue(""),
        statusText: "OK",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const queryFn = getQueryFn({ on401: "throw" });
      const result = await queryFn({ queryKey: ["api", "test"] } as any);

      expect(result).toEqual(mockData);
    });

    it("should return null for 401 when on401 is returnNull", async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue("Unauthorized"),
        statusText: "Unauthorized",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const queryFn = getQueryFn({ on401: "returnNull" });
      const result = await queryFn({ queryKey: ["api", "test"] } as any);

      expect(result).toBeNull();
    });

    it("should throw error for 401 when on401 is throw", async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue("Unauthorized"),
        statusText: "Unauthorized",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const queryFn = getQueryFn({ on401: "throw" });
      await expect(queryFn({ queryKey: ["api", "test"] } as any)).rejects.toThrow();
    });
  });
});

