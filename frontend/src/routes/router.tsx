import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { ChiTietChuongTrinh } from '@/features/tuyensinh/man-hinh/ChiTietChuongTrinh';
import { DoanhSo } from '@/features/tuyensinh/man-hinh/DoanhSo';
import { DanhBaDoiTac } from '@/features/tuyensinh/man-hinh/DanhBaDoiTac';
import { DoiSoat } from '@/features/tuyensinh/man-hinh/DoiSoat';
import { HoSoCuaToi } from '@/features/tuyensinh/man-hinh/HoSoCuaToi';
import { LapHoSo } from '@/features/tuyensinh/man-hinh/LapHoSo';
import { MangLuoi } from '@/features/tuyensinh/man-hinh/MangLuoi';
import { QuanTri } from '@/features/tuyensinh/man-hinh/QuanTri';
import { ThuHocPhi } from '@/features/tuyensinh/man-hinh/ThuHocPhi';
import { laApi } from '@/features/tuyensinh/nguon/nguon';
import { TuyenSinhLayout } from '@/features/tuyensinh/TuyenSinhLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { UsersPage } from '@/pages/UsersPage';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Phần mềm tuyển sinh liên kết.
 *
 * Danh bạ trường tham khảo luôn công khai. Các màn hình nghiệp vụ tuyển sinh
 * ở nguồn API cần đăng nhập; vai trò do máy chủ quyết.
 */
const manHinhCanDangNhap: RouteObject[] = [
  { index: true, element: <MangLuoi /> },
  { path: 'chuong-trinh/:ma', element: <ChiTietChuongTrinh /> },
  { path: 'lap-ho-so', element: <LapHoSo /> },
  { path: 'ho-so', element: <HoSoCuaToi /> },
  { path: 'thu-hoc-phi/:ma', element: <ThuHocPhi /> },
  { path: 'doanh-so', element: <DoanhSo /> },
  { path: 'doi-soat', element: <DoiSoat /> },
  { path: 'quan-tri', element: <QuanTri /> },
];

const nhanhTuyenSinh: RouteObject = {
  path: '/tuyensinh',
  element: <TuyenSinhLayout />,
  children: [
    { path: 'doi-tac-tham-khao', element: <DanhBaDoiTac /> },
    ...(laApi
      ? [{ element: <ProtectedRoute />, children: manHinhCanDangNhap }]
      : manHinhCanDangNhap),
  ],
};

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/tuyensinh" replace /> },

  nhanhTuyenSinh,

  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/tong-quan', element: <DashboardPage /> },
          {
            element: <ProtectedRoute roles={['ADMIN']} />,
            children: [{ path: '/users', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
