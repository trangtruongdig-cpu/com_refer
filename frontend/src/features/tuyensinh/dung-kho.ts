/**
 * Hook nhận dạng người đang dùng, cộng cửa vào lớp nguồn dữ liệu.
 *
 * Màn hình nhập từ đây; `nguon/dung-du-lieu.ts` quyết định dữ liệu đến từ kho
 * demo hay từ API.
 */
import { useQuery } from '@tanstack/react-query';
import { layNhanSu, layToiLa } from '@/api/tuyensinh.api';
import { useAuthStore } from '@/stores/auth.store';
import { NHAN_SU, timNhanSu, type NhanSu } from './du-lieu/nhan-su';
import { useKho } from './kho/kho.store';
import { laApi } from './nguon/nguon';

/**
 * Người đang dùng phần mềm.
 *
 *   demo — lấy từ bộ chọn ở thanh trên, đứng chỗ của đăng nhập.
 *   api  — lấy từ phiên đăng nhập; vai trò và phạm vi phụ trách do máy chủ
 *          trả về, client không tự quyết. Trong lúc chờ, tạm hiện tên người
 *          đăng nhập với quyền thấp nhất.
 */
export function useToi(): NhanSu {
  const id = useKho((s) => s.toiLaId);
  const nguoiDung = useAuthStore((s) => s.user);
  const q = useQuery({
    queryKey: ['tuyensinh', 'nhan-su', 'toi'],
    queryFn: layToiLa,
    enabled: laApi,
    staleTime: 5 * 60_000,
  });
  const qNhanSu = useQuery({
    queryKey: ['tuyensinh', 'nhan-su', 'pham-vi'],
    queryFn: layNhanSu,
    enabled: laApi,
    staleTime: 5 * 60_000,
  });

  if (!laApi) return timNhanSu(id) ?? NHAN_SU[0]!;

  const ns = q.data;
  if (ns) {
    const trongPhamVi = qNhanSu.data?.find((n) => n.ma === ns.ma);
    return {
      id: ns.ma,
      hoTen: ns.hoTen,
      vaiTro: ns.vaiTro,
      nhom: trongPhamVi?.nhom ?? (ns.donVi.cap === 'NHOM' ? ns.donVi.ten : '—'),
      phong: trongPhamVi?.phong ?? (ns.donVi.cap === 'PHONG' ? ns.donVi.ten : '—'),
    };
  }
  return {
    id: nguoiDung?.id ?? 'toi',
    hoTen: nguoiDung?.name ?? 'Đang tải…',
    vaiTro: 'NV',
    nhom: '—',
    phong: '—',
  };
}

export {
  useBangLuong,
  useChuongTrinh,
  useDanhMuc,
  useDuLieu,
  useHanhDong,
  useSoCongNo,
  useSoatTran,
  useTongHopThang,
} from './nguon/dung-du-lieu';
