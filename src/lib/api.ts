type JsonRecord = Record<string, unknown>;
const LOCAL_API_TIMEOUT_MS = 4500;
const REMOTE_API_TIMEOUT_MS = 10000;

// Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_CACHE_TTL = 60 * 1000;

// Security utilities
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, 2048);
};

const validatePath = (path: string): boolean => {
  if (typeof path !== 'string') return false;

  if (
    path.length > 300 ||
    path.includes('\\') ||
    path.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(path)
  ) {
    return false;
  }

  try {
    const url = new URL(path.replace(/^\/+/, ''), 'https://local.invalid/');
    const validPathPattern = /^[a-zA-Z0-9_/-]*$/;
    const validQueryPattern = /^[a-zA-Z0-9\-_.:, ]*$/;

    if (!validPathPattern.test(url.pathname)) {
      return false;
    }

    for (const [key, value] of url.searchParams.entries()) {
      if (!validQueryPattern.test(key) || !validQueryPattern.test(value)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Cache utilities
const getCachedData = (key: string) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    apiCache.delete(key);
  }
  return null;
};

const setCachedData = (key: string, data: any, ttl: number = DEFAULT_CACHE_TTL) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, cached] of apiCache.entries()) {
    if (now - cached.timestamp >= cached.ttl) {
      apiCache.delete(key);
    }
  }
}, 60000); // Clean every minute

const deriveFallbackBaseUrl = () => {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_API_URL || "https://shivarpanfoundation.org/api";
  }

  const { hostname, protocol } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://127.0.0.1:8000/api";
  }

  return import.meta.env.VITE_API_URL || `${protocol}//${window.location.host}/api`;
};

const rawBaseUrl =
  (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_API_BASE_URL ?? deriveFallbackBaseUrl();

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
export const API_ORIGIN = API_BASE_URL.replace(/\/api(?:\/.*)?$/, "").replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  if (!validatePath(path)) {
    throw new Error('Invalid API path');
  }
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

const getRequestTimeoutMs = () => {
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(?::\d+)?\/api\b/i.test(API_BASE_URL)) {
    return LOCAL_API_TIMEOUT_MS;
  }

  return REMOTE_API_TIMEOUT_MS;
};

const createTimeoutSignal = () => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), getRequestTimeoutMs());

  return { controller, timeoutId };
};

export const assetUrl = (path?: string | null) => {
  if (!path) {
    return "";
  }

  const sanitizedPath = sanitizeInput(path);
  
  if (/^https?:\/\//i.test(sanitizedPath)) {
    // Validate the URL format
    if (!isValidUrl(sanitizedPath)) {
      return "";
    }
    // If the current page is HTTPS, ensure the asset URL is also HTTPS
    if (typeof window !== "undefined" && window.location.protocol === "https:" && sanitizedPath.startsWith("http:")) {
      return sanitizedPath.replace("http:", "https:");
    }
    return sanitizedPath;
  }

  const origin = typeof window !== "undefined" && window.location.protocol === "https:" 
    ? API_ORIGIN.replace(/^http:/, "https:") 
    : API_ORIGIN;

  return `${origin}/${sanitizedPath.replace(/^\/+/, "")}`;
};

export const isApiUnavailableError = (error: unknown) =>
  error instanceof Error && error.name === "ApiUnavailableError";

const isNetworkError = (error: unknown) =>
  error instanceof TypeError ||
  (error instanceof Error &&
    (error.message === "Failed to fetch" ||
      error.name === "AbortError" ||
      ("code" in error && error.code === "ERR_NETWORK")));

export const reportApiError = (label: string, error: unknown) => {
  if (isApiUnavailableError(error) || isNetworkError(error)) {
    return;
  }

  console.error(label, error);
};

function extractErrorMessage(data: unknown): string {
  if (Array.isArray(data) && data.length > 0) {
    return data
      .map((item) => extractErrorMessage(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    if ("detail" in data && typeof data.detail === "string") {
      return data.detail;
    }

    const values = Object.values(data)
      .map((item) => extractErrorMessage(item))
      .filter(Boolean);

    if (values.length > 0) {
      return values.join(", ");
    }
  }

  return "Request failed";
}

export async function postJson<TResponse = JsonRecord>(
  path: string,
  payload: JsonRecord
): Promise<TResponse> {
  // Validate inputs
  if (!validatePath(path)) {
    throw new Error('Invalid API path');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload');
  }

  let response: Response;
  const { controller, timeoutId } = createTimeoutSignal();
  try {
    response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest", // CSRF protection
      },
      body: JSON.stringify(payload),
      credentials: 'include',
      mode: 'cors',
      cache: 'no-cache',
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }

  let data: TResponse | JsonRecord | null;
  try {
    data = (await response.json()) as TResponse;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data as TResponse;
}

export async function getJson<TResponse = JsonRecord>(path: string, options?: { cache?: boolean; cacheTTL?: number }): Promise<TResponse> {
  // Validate input
  if (!validatePath(path)) {
    throw new Error('Invalid API path');
  }

  // Check cache first
  const cacheKey = `GET:${path}`;
  if (options?.cache !== false) {
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  let response: Response;
  const { controller, timeoutId } = createTimeoutSignal();
  try {
    response = await fetch(apiUrl(path), {
      method: "GET",
      headers: { 
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest", // CSRF protection
      },
      credentials: 'include',
      mode: 'cors',
      cache: options?.cache === false ? 'no-store' : 'default',
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }

  let data: TResponse | JsonRecord | null;
  try {
    data = (await response.json()) as TResponse;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  // Cache the response
  if (options?.cache !== false && data) {
    setCachedData(cacheKey, data, options?.cacheTTL);
  }

  return data as TResponse;
}
