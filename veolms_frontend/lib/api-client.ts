import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends/receives your httpOnly auth cookies automatically
  headers: { "Content-Type": "application/json" },
});

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error: { message: string; code?: string; path?: string[] }[] | { message: string } | null;
}

export class ApiRequestError extends Error {
  status: number;
  payload: ApiEnvelope<null> | undefined;

  constructor(status: number, message: string, payload?: ApiEnvelope<null>) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

let isRefreshing = false;
let pendingQueue: { resolve: () => void; reject: (err: unknown) => void }[] = [];

const flushQueue = (err: unknown | null) => {
  pendingQueue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve()));
  pendingQueue = [];
};

// If any request comes back 401 (access token expired), this automatically
// calls /auth/refresh once, then retries the original request — so the user
// never gets logged out just because 15 minutes passed.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (error.response?.status !== 401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(normalizeError(error as any));
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve: () => resolve(api(originalRequest)), reject });
      });
    }

    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      flushQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
      return Promise.reject(normalizeError(error as any));
    } finally {
      isRefreshing = false;
    }
  }
);

function normalizeError(error: AxiosError<ApiEnvelope<null>>): ApiRequestError {
  const status = error.response?.status ?? 0;
  const payload = error.response?.data;
  const message =
    payload?.message ??
    (Array.isArray(payload?.error) ? payload?.error[0]?.message : payload?.error?.message) ??
    error.message ??
    "Something went wrong. Please try again.";

  return new ApiRequestError(status, message, payload);
}