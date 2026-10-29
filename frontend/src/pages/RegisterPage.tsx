import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo tài khoản</CardTitle>
        <CardDescription>Điền thông tin bên dưới để đăng ký</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
