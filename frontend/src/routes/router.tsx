import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { ChiTietChuongTrinh } from '@/features/tuyensinh/man-hinh/ChiTietChuongTrinh';
import { DoanhSo } from '@/features/tuyensinh/man-hinh/DoanhSo';
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
 * Nguồn `demo` mở công khai để xem được ngay: dữ liệu nằm trong localStorage,
 * không gọi API nào. Nguồn `api` bắt buộc đăng nhập — vai trò NV / TN / TP /
 * admin do máy chủ quyết (thuchien.md §10), và bộ chọn người dùng ở thanh trên
 * tự ẩn.
 */
const nhanhTuyenSinh: RouteObject = {
  path: '/tuyensinh',
  element: <TuyenSinhLayout />,
  children: [
    { index: true, element: <MangLuoi /> },
    { path: 'chuong-trinh/:ma', element: <ChiTietChuongTrinh /> },
    { path: 'lap-ho-so', element: <LapHoSo /> },
    { path: 'ho-so', element: <HoSoCuaToi /> },
    { path: 'thu-hoc-phi/:ma', element: <ThuHocPhi /> },
    { path: 'doanh-so', element: <DoanhSo /> },
    { path: 'doi-soat', element: <DoiSoat /> },
    { path: 'quan-tri', element: <QuanTri /> },
  ],
};

const nhanhTuyenSinhCoQuyen: RouteObject = laApi
  ? { element: <ProtectedRoute />, children: [nhanhTuyenSinh] }
  : nhanhTuyenSinh;

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/tuyensinh" replace /> },

  nhanhTuyenSinhCoQuyen,

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
