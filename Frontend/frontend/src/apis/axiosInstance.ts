// The ONE axios client of the app. Every API module goes through it
// (directly or via the apiGet/apiPost helpers in academyApi.ts), so:
//  - the base URL, timeout and JWT header are configured in a single place
//  - every failure reaches the UI as an ApiError with a readable message
//  - an expired session (401) is handled the same way everywhere
import axios, { AxiosError } from "axios";

const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://localhost:7001";

export const API_BASE_URL = rawBase.replace(/\/+$/, "");
export const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

export class ApiError extends Error {
  status: number;
  // Raw response body (ProblemDetails / validation errors) for callers that need more than the message.
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

// Readable message for anything a catch block can receive.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// Pulls the most useful sentence out of an ASP.NET ProblemDetails / ValidationProblemDetails body.
function messageFromBody(body: any, status: number): string {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    if (body.errors && typeof body.errors === "object") {
      const first = (Object.values(body.errors).flat() as unknown[])[0];
      if (typeof first === "string" && first) return first;
    }
    for (const key of ["detail", "message", "title"] as const) {
      if (typeof body[key] === "string" && body[key]) return body[key];
    }
  }
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find what you asked for.";
  if (status >= 500) return "Something went wrong on the server. Please try again.";
  return `Request failed (${status})`;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach the JWT to every request.
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Aborted requests are not failures: let the caller's abort handling see them untouched.
    if (axios.isCancel(error)) throw error;

    if (!error.response) {
      throw new ApiError(
        0,
        error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Cannot reach the server. Check that the API is running.",
      );
    }

    const res = error.response;

    // Expired / invalid token on a signed-in session -> clear it and go back to the login page.
    // (A 401 from the login form itself has no token yet, so it just shows "invalid credentials".)
    if (res.status === 401 && getAccessToken()) {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        /* storage unavailable: nothing to clear */
      }
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    throw new ApiError(res.status, messageFromBody(res.data, res.status), res.data);
  },
);

export default axiosInstance;
