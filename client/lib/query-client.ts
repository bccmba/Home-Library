import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Test server connectivity with a simple GET request
 * This helps diagnose network issues
 */
export async function testServerConnectivity(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const testUrl = new URL("/api/shelves", API_BASE_URL);
    console.log(`[Connectivity Test] Testing connection to ${testUrl.toString()}`);
    
    const res = await fetch(testUrl.toString(), {
      method: "GET",
      signal: controller.signal,
    });
    
    console.log(`[Connectivity Test] Success! Status: ${res.status}`);
    return res.ok;
  } catch (error) {
    console.error(`[Connectivity Test] Failed:`, error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  let url: URL;
  
  try {
    // Ensure route starts with / for proper URL construction
    const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
    url = new URL(normalizedRoute, API_BASE_URL);
  } catch (error) {
    console.error("URL construction error:", error, { API_BASE_URL, route });
    throw new Error(
      `Invalid API URL: ${API_BASE_URL}. ` +
      `Make sure the server is running and EXPO_PUBLIC_DOMAIN is set correctly.`
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const urlString = url.toString();
    console.log(`[API] ${method} ${urlString}`);
    
    const fetchOptions: RequestInit = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
      credentials: "include",
    };

    // Pass URL object to fetch (tests expect URL object, and fetch accepts both URL and string)
    const res = await fetch(url, fetchOptions);

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("API request error:", error, { url: url.toString(), method, route });
    
    // Check for specific network error types
    if (error instanceof TypeError || error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const isAbortError = error.name === "AbortError" || errorMessage.includes("aborted");
      
      if (isAbortError) {
        throw new Error(
          `Request timeout. The server at ${API_BASE_URL} did not respond within 10 seconds. ` +
          `\n1. Make sure the server is running: npm run server:dev` +
          `\n2. Check server logs for errors` +
          `\n3. Verify the server is accessible: curl ${API_BASE_URL}/api/shelves` +
          `\n4. Check firewall settings on your computer`
        );
      }
      
      if (errorMessage.includes("network request failed") || 
          errorMessage.includes("failed to fetch") ||
          errorMessage.includes("networkerror")) {
        throw new Error(
          `Network request failed. ` +
          `\n1. Make sure the server is running: npm run server:dev` +
          `\n2. Verify server is listening on port 3000 (check server console)` +
          `\n3. Test connectivity: curl ${API_BASE_URL}/api/shelves` +
          `\n4. Check firewall allows port 3000` +
          `\n5. Verify EXPO_PUBLIC_DOMAIN=http://192.168.68.63:3000 in .env` +
          `\n6. Ensure device and computer are on the same WiFi network` +
          `\n7. Try accessing ${url.toString()} in a browser on your device` +
          `\n\nAttempted URL: ${url.toString()}`
        );
      }
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url: URL;
    
    try {
      // Ensure queryKey creates a proper path starting with /
      const path = queryKey.join("/");
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      url = new URL(normalizedPath, API_BASE_URL);
    } catch (error) {
      console.error("URL construction error:", error, { API_BASE_URL, queryKey });
      throw new Error(
        `Invalid API URL: ${API_BASE_URL}. ` +
        `Make sure the server is running and EXPO_PUBLIC_DOMAIN is set correctly.`
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const urlString = url.toString();
      console.log(`[API] GET ${urlString}`);
      
      const fetchOptions: RequestInit = {
        signal: controller.signal,
        credentials: "include",
      };

      // Pass URL object to fetch (tests expect URL object, and fetch accepts both URL and string)
      const res = await fetch(url, fetchOptions);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error("API query error:", error, { url: url.toString(), queryKey });
      
      // Check for specific network error types
      if (error instanceof TypeError || error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        const isAbortError = error.name === "AbortError" || errorMessage.includes("aborted");
        
        if (isAbortError) {
          throw new Error(
            `Request timeout. The server at ${API_BASE_URL} did not respond within 10 seconds. ` +
            `\n1. Make sure the server is running: npm run server:dev` +
            `\n2. Check server logs for errors` +
            `\n3. Verify the server is accessible: curl ${API_BASE_URL}/api/shelves` +
            `\n4. Check firewall settings on your computer`
          );
        }
        
        if (errorMessage.includes("network request failed") || 
            errorMessage.includes("failed to fetch") ||
            errorMessage.includes("networkerror")) {
          throw new Error(
            `Network request failed. ` +
            `\n1. Make sure the server is running: npm run server:dev` +
            `\n2. Verify server is listening on port 3000 (check server console)` +
            `\n3. Test connectivity: curl ${API_BASE_URL}/api/shelves` +
            `\n4. Check firewall allows port 3000` +
            `\n5. Verify EXPO_PUBLIC_DOMAIN=http://192.168.68.63:3000 in .env` +
            `\n6. Ensure device and computer are on the same WiFi network` +
            `\n7. Try accessing ${url.toString()} in a browser on your device` +
            `\n\nAttempted URL: ${url.toString()}`
          );
        }
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
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
