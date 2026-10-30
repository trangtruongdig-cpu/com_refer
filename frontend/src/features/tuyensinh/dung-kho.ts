/**
 * Hook nhận dạng người đang dùng, cộng cửa vào lớp nguồn dữ liệu.
 *
 * Màn hình nhập từ đây; `nguon/dung-du-lieu.ts` quyết định dữ liệu đến từ kho
 * demo hay từ API.
 */
import { NHAN_SU, timNhanSu, type NhanSu } from './du-lieu/nhan-su';
import { useKho } from './kho/kho.store';

export function useToi(): NhanSu {
  const id = useKho((s) => s.toiLaId);
  return timNhanSu(id) ?? NHAN_SU[0]!;
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
