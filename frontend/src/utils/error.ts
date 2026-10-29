import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '@/types/api';

/** Lấy thông báo lỗi dễ đọc từ lỗi axios / lỗi bất kỳ */
export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra'): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === 'ERR_NETWORK') return 'Không kết nối được tới server';
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
