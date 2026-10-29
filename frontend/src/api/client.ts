import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiSuccess } from '@/types/api';
import type { AuthPayload } from '@/types/user';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Axios instance dùng chung: tự gắn access token và tự refresh khi gặp 401 */
export const api = axios.create({
  baseURL: API_URL,
  // Gửi kèm cookie refresh_token (httpOnly)
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

/**
 * Gọi /auth/refresh — dùng chung một promise để nhiều request 401 cùng lúc
 * chỉ refresh một lần. Dùng axios gốc để không đi qua interceptor (tránh lặp vô hạn).
 */
export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= axios
    .post<ApiSuccess<AuthPayload>>(`${API_URL}/auth/refresh`, null, { withCredentials: true })
    .then((response) => {
      const { accessToken, user } = response.data.data;
      useAuthStore.getState().setAuth(accessToken, user);
      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// Các endpoint này trả 401 là lỗi nghiệp vụ, không cần refresh
const SKIP_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequestConfig | undefined;
    const shouldSkip = SKIP_REFRESH_URLS.some((url) => original?.url?.includes(url));

    if (error.response?.status === 401 && original && !original._retry && !shouldSkip) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        // Hết phiên: xóa state => ProtectedRoute tự chuyển về /login
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
