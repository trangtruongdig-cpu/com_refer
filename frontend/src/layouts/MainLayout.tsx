import { GraduationCap, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/hooks/useAuthMutations';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/utils/cn';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
  );

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between gap-4">
          <nav className="flex items-center gap-1">
            <span className="mr-4 text-lg font-bold">Base Project</span>
            <NavLink to="/tong-quan" end className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/tuyensinh" className={navLinkClass}>
              <GraduationCap className="h-4 w-4" />
              Tuyển sinh
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/users" className={navLinkClass}>
                <Users className="h-4 w-4" />
                Users
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}
