/**
 * Hook đọc kho. Luôn chọn từng nhánh dữ liệu thô rồi mới `useMemo` để ghép:
 * selector trả về mảng mới mỗi lần sẽ làm `useSyncExternalStore` của React báo
 * lỗi "getSnapshot should be cached".
 */
import { useMemo } from 'react';
import { NHAN_SU, timNhanSu, type NhanSu } from './du-lieu/nhan-su';
import { useKho } from './kho/kho.store';
import { ghepLanThu, type LanThuDayDu } from './tinh-toan';

export function useToi(): NhanSu {
  const id = useKho((s) => s.toiLaId);
  return timNhanSu(id) ?? NHAN_SU[0]!;
}

export function useDuLieu() {
  const hoSo = useKho((s) => s.hoSo);
  const lanThu = useKho((s) => s.lanThu);
  const dotDoiSoat = useKho((s) => s.dotDoiSoat);
  const taiKhoan = useKho((s) => s.taiKhoan);
  const coCau = useKho((s) => s.coCau);
  const thamSoCoChe = useKho((s) => s.thamSoCoChe);
  const tatCa: LanThuDayDu[] = useMemo(
    () => ghepLanThu(hoSo, lanThu, dotDoiSoat),
    [hoSo, lanThu, dotDoiSoat],
  );
  return { hoSo, lanThu, dotDoiSoat, taiKhoan, coCau, thamSoCoChe, tatCa };
}
