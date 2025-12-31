import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Platform } from "react-native";

/**
 * Gets the base URL for the Express API server
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;

  // If EXPO_PUBLIC_DOMAIN is set, use it
  if (host) {
    // If host doesn't include protocol, add https (for production) or http (for dev)
    if (!host.startsWith("http://") && !host.startsWith("https://")) {
      // Use http in development, https in production
      const protocol = __DEV__ ? "http" : "https";
      return `${protocol}://${host}`;
    }
    return host;
  }

  // Default to localhost for local development
  if (__DEV__) {
    // For Android emulator, use 10.0.2.2 instead of localhost
    // Note: For physical Android devices, you need to set EXPO_PUBLIC_DOMAIN
    // to your computer's local IP address (e.g., http://192.168.1.100:5000)
    if (Platform.OS === "android") {
      const androidHost = "10.0.2.2";
      const url = `http://${androidHost}:5000`;
      console.log(
        `[API] Using Android emulator address: ${url}. ` +
        `For physical devices, set EXPO_PUBLIC_DOMAIN to your computer's IP address.`
      );
      return url;
    }

    // For iOS simulator and web, localhost works
    // Note: For physical iOS devices, you need to set EXPO_PUBLIC_DOMAIN
    // to your computer's local IP address
    const iosHost = "localhost";
    const url = `http://${iosHost}:5000`;
    console.log(
      `[API] Using localhost: ${url}. ` +
      `For physical devices, set EXPO_PUBLIC_DOMAIN to your computer's IP address.`
    );
    return url;
  }

  throw new Error("EXPO_PUBLIC_DOMAIN is not set");
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  let url: URL;
  
  try {
    url = new URL(route, baseUrl);
  } catch (error) {
    throw new Error(
      `Invalid API URL: ${baseUrl}. ` +
      `Make sure the server is running and EXPO_PUBLIC_DOMAIN is set correctly. ` +
      `For physical devices, use your computer's IP address (e.g., http://192.168.1.100:5000)`
    );
  }

  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Improve error messages for network failures
    if (error instanceof TypeError && error.message.includes("Network request failed")) {
      throw new Error(
        `Network request failed. Make sure the server is running at ${baseUrl}. ` +
        `If using a physical device, ensure EXPO_PUBLIC_DOMAIN is set to your computer's IP address.`
      );
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    let url: URL;
    
    try {
      url = new URL(queryKey.join("/") as string, baseUrl);
    } catch (error) {
      throw new Error(
        `Invalid API URL: ${baseUrl}. ` +
        `Make sure the server is running and EXPO_PUBLIC_DOMAIN is set correctly.`
      );
    }

    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Improve error messages for network failures
      if (error instanceof TypeError && error.message.includes("Network request failed")) {
        throw new Error(
          `Network request failed. Make sure the server is running at ${baseUrl}. ` +
          `If using a physical device, ensure EXPO_PUBLIC_DOMAIN is set to your computer's IP address.`
        );
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
