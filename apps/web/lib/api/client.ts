export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  data?: any;
  params?: Record<string, string | number | boolean>;
  requireAuth?: boolean;
}

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  const base =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/v1\/?$/, "") ||
    "http://localhost:4000";
  return `${base}/v1`;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh the access token using the httpOnly refresh cookie (set by the API).
 */
async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function refreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = attemptTokenRefresh().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });
  return refreshPromise;
}

function redirectToSignIn(): void {
  if (typeof window === "undefined") return;
  window.location.href = "/sign-in";
}

export const apiClient = async <T>(
  endpoint: string,
  { data, params, requireAuth = true, ...customConfig }: FetchOptions = {},
): Promise<T> => {
  let url = `${getApiBaseUrl()}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    credentials: "include",
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  let response = await fetch(url, config);

  if (response.status === 401 && requireAuth) {
    const refreshed = await refreshToken();

    if (refreshed) {
      response = await fetch(url, config);
    }

    if (response.status === 401) {
      redirectToSignIn();
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // Not JSON
    }

    throw new ApiError(
      response.status,
      errorData?.message || response.statusText,
      errorData,
    );
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
};

export const api = {
  get: <T>(endpoint: string, options?: Omit<FetchOptions, "method" | "data">) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data: any, options?: Omit<FetchOptions, "method" | "data">) =>
    apiClient<T>(endpoint, { ...options, method: "POST", data }),

  put: <T>(endpoint: string, data: any, options?: Omit<FetchOptions, "method" | "data">) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", data }),

  patch: <T>(endpoint: string, data: any, options?: Omit<FetchOptions, "method" | "data">) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", data }),

  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "method" | "data">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
