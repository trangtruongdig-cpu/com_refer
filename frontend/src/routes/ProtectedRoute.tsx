import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '@/components/common/FullPageSpinner';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types/user';

interface ProtectedRouteProps {
  /** Bỏ trống = chỉ cần đăng nhập */
  roles?: Role[];
}

/** Chặn route khi chưa đăng nhập hoặc không đúng role */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
