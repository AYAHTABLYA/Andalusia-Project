// src/apis/academyApi.ts
// Thin typed helpers (GET / POST / PUT / DELETE / upload / download) on top of the single
// axios client in axiosInstance.ts. Auth header, error mapping and 401 handling live there.
import axiosInstance, {
  ACCESS_TOKEN_KEY,
  API_BASE_URL,
  ApiError,
  getAccessToken,
  getErrorMessage,
  isLoggedIn,
} from "./axiosInstance";

// Re-exported so existing imports from "./academyApi" keep working.
export { ACCESS_TOKEN_KEY, API_BASE_URL, ApiError, getAccessToken, getErrorMessage, isLoggedIn };

const apiClient = axiosInstance;

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

// DELETE Request
export async function apiDelete<T = void>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await apiClient.delete<T>(path, { signal });
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
