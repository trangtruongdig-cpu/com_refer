import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/utils/format';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Xin chào, {user.name} 👋</h1>
        <p className="text-muted-foreground">Đây là trang tổng quan của bạn.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
            <CardDescription>Dữ liệu lấy từ phiên đăng nhập hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
              <dt className="text-muted-foreground">Vai trò</dt>
              <dd>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
              </dd>
              <dt className="text-muted-foreground">Ngày tạo</dt>
              <dd>{formatDateTime(user.createdAt)}</dd>
            </dl>
          </CardContent>
        </Card>

        {user.role === 'ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quản lý người dùng</CardTitle>
              <CardDescription>Xem, tìm kiếm và quản lý tài khoản trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/users">Mở danh sách users</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
