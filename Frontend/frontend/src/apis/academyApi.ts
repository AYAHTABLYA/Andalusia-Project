// src/apis/academyApi.ts
import axios, { AxiosError } from "axios";

const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://localhost:7001";

export const API_BASE_URL = rawBase.replace(/\/+$/, "");
export const ACCESS_TOKEN_KEY = "access_token";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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

// 1. إنشاء نسخة Axios المركزية
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 2. Request Interceptor: لإرسال توكن الـ JWT تلقائياً
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response Interceptor: لمعالجة ProblemDetails والـ Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (axios.isCancel(error)) {
      throw error;
    }

    if (!error.response) {
      throw new ApiError(
        0,
        "Cannot reach the server. Check that the API is running.",
      );
    }

    const res = error.response;

    // Expired / invalid token on a logged-in session -> back to the login page.
    if (res.status === 401 && getAccessToken()) {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem("user");
      } catch {
        /* ignore */
      }
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    let message = `Request failed (${res.status})`;

    if (res.data) {
      const body = res.data;
      if (body.errors) {
        message = Object.values(body.errors).flat()[0] as string;
      } else if (body.detail) {
        message = body.detail;
      } else if (body.title) {
        message = body.title;
      } else if (body.message) {
        message = body.message;
      } else if (typeof body === "string") {
        message = body;
      }
    }

    throw new ApiError(res.status, message);
  },
);

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

// GET Request
export async function apiGet<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  const response = await apiClient.get<T>(path, {
    params,
    signal,
  });
  return response.data;
}

// POST Request
export async function apiPost<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await apiClient.post<T>(path, body ?? {}, {
    signal,
  });
  return response.data;
}

// PUT Request
export async function apiPut<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await apiClient.put<T>(path, body ?? {}, { signal });
  return response.data;
}

// Multipart upload (profile photo)
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  signal?: AbortSignal,
): Promise<T> {
  const response = await apiClient.post<T>(path, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
  return response.data;
}

// File Download (Syllabus)
export async function downloadFile(
  path: string,
  fallbackName: string,
): Promise<void> {
  try {
    const response = await apiClient.get(path, {
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"] ?? "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    const fileName = match ? decodeURIComponent(match[1]) : fallbackName;

    const blobUrl = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "Could not download the file.");
  }
}
