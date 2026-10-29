import { useEffect } from 'react';
import { refreshAccessToken } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Khi mở app: thử đổi cookie refresh_token lấy access token mới để khôi phục phiên.
 * Thất bại => coi như chưa đăng nhập.
 */
export function useAuthBootstrap(): void {
  useEffect(() => {
    const { status, setStatus, clearAuth } = useAuthStore.getState();
    if (status !== 'idle') return;

    setStatus('loading');
    refreshAccessToken().catch(() => clearAuth());
  }, []);
}
