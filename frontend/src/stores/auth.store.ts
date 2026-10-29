import { create } from 'zustand';
import type { User } from '@/types/user';

/**
 * idle            : chưa kiểm tra phiên
 * loading         : đang thử refresh token lúc khởi động
 * authenticated   : đã đăng nhập
 * unauthenticated : chưa đăng nhập / hết phiên
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  /** Access token chỉ giữ trong bộ nhớ (không lưu localStorage để tránh XSS) */
  accessToken: string | null;
  user: User | null;
  status: AuthStatus;
  setAuth: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  setStatus: (status: AuthStatus) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  status: 'idle',
  setAuth: (accessToken, user) => set({ accessToken, user, status: 'authenticated' }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clearAuth: () => set({ accessToken: null, user: null, status: 'unauthenticated' }),
}));
