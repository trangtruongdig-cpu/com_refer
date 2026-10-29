import { Navigate, Outlet } from 'react-router-dom';
import { FullPageSpinner } from '@/components/common/FullPageSpinner';
import { useAuthStore } from '@/stores/auth.store';

/** Trang login/register: đã đăng nhập thì chuyển về Dashboard */
export function GuestRoute() {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
