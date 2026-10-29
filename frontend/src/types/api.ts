/** Envelope chuẩn từ backend: { success, data, message, meta } */
export interface ApiSuccess<T, M = undefined> {
  success: true;
  data: T;
  message?: string;
  meta: M;
}

export interface ApiErrorBody {
  success: false;
  data: null;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type SortOrder = 'asc' | 'desc';
