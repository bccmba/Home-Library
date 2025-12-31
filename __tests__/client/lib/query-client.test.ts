import { Platform } from "react-native";
import { getApiUrl, apiRequest, getQueryFn } from "@/lib/query-client";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock __DEV__
declare global {
  var __DEV__: boolean;
}
global.__DEV__ = true;

describe("query-client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_DOMAIN;
  });

  describe("getApiUrl", () => {
    it("should return the URL from EXPO_PUBLIC_DOMAIN when set", () => {
      process.env.EXPO_PUBLIC_DOMAIN = "https://example.com";
      const result = getApiUrl();
      expect(result).toBe("https://example.com");
    });

    it("should add http protocol for dev when EXPO_PUBLIC_DOMAIN is set without protocol", () => {
      global.__DEV__ = true;
      process.env.EXPO_PUBLIC_DOMAIN = "localhost:5000";
      const result = getApiUrl();
      expect(result).toBe("http://localhost:5000");
    });

    it("should add https protocol for production when EXPO_PUBLIC_DOMAIN is set without protocol", () => {
      global.__DEV__ = false;
      process.env.EXPO_PUBLIC_DOMAIN = "example.com";
      const result = getApiUrl();
      expect(result).toBe("https://example.com");
    });

    it("should return localhost for iOS in dev mode", () => {
      global.__DEV__ = true;
      (Platform.OS as any) = "ios";
      const result = getApiUrl();
      expect(result).toBe("http://localhost:5000");
    });

    it("should return 10.0.2.2 for Android in dev mode", () => {
      global.__DEV__ = true;
      (Platform.OS as any) = "android";
      const result = getApiUrl();
      expect(result).toBe("http://10.0.2.2:5000");
    });

    it("should throw error when EXPO_PUBLIC_DOMAIN is not set in production", () => {
      global.__DEV__ = false;
      expect(() => getApiUrl()).toThrow("EXPO_PUBLIC_DOMAIN is not set");
    });
  });

  describe("apiRequest", () => {
    beforeEach(() => {
      global.__DEV__ = true;
      (Platform.OS as any) = "ios";
    });

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
    beforeEach(() => {
      global.__DEV__ = true;
      (Platform.OS as any) = "ios";
    });

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

