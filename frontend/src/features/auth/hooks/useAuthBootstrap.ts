import { useEffect } from 'react';
import { refreshAccessToken } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Khi cần xác thực API: thử đổi cookie refresh_token lấy access token mới để
 * khôi phục phiên. Ở nguồn demo, không gọi backend chỉ để mở giao diện công khai.
 */
export function useAuthBootstrap(canKhoiPhucPhien = true): void {
  useEffect(() => {
    const { status, setStatus, clearAuth } = useAuthStore.getState();
    if (!canKhoiPhucPhien) {
      if (status === 'idle' || status === 'loading') setStatus('unauthenticated');
      return;
    }
    if (status !== 'idle') return;

    setStatus('loading');
    refreshAccessToken().catch(() => clearAuth());
  }, [canKhoiPhucPhien]);
}
