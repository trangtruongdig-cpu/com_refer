import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import { refreshAccessToken } from '@/api/client';
import { useAuthBootstrap } from './useAuthBootstrap';

vi.mock('@/api/client', () => ({
  refreshAccessToken: vi.fn(),
}));

const refreshAccessTokenMock = vi.mocked(refreshAccessToken);

describe('useAuthBootstrap', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      status: 'idle',
    });
    refreshAccessTokenMock.mockReset();
  });

  afterEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      status: 'idle',
    });
  });

  it('không gọi refresh API khi nguồn demo không cần khôi phục phiên', async () => {
    renderHook(() => useAuthBootstrap(false));

    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });
    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
  });

  it('gọi refresh khi ứng dụng cần xác thực API', async () => {
    refreshAccessTokenMock.mockRejectedValueOnce(new Error('Hết phiên'));
    renderHook(() => useAuthBootstrap(true));

    await waitFor(() => {
      expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });
  });
});
