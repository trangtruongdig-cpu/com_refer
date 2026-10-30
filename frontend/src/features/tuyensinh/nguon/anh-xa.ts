/**
 * Lớp chống hỏng: đổi hình dạng của API sang kiểu nghiệp vụ mà màn hình dùng.
 *
 * Backend khác tên trường một chỗ nào đó thì sửa ĐÚNG Ở ĐÂY, không rải ra
 * tám màn hình.
 */
import type {
  ChuongTrinhApi,
  DotDoiSoatApi,
  HoSoApi,
  LanThuApi,
  TaiKhoanApi,
} from '@/api/tuyensinh.api';
import type { ChuongTrinh, MaHe } from '../du-lieu/danh-muc';
import type { DotDoiSoat, HoSo, LanThu, TaiKhoan } from '../kho/kho.types';

export const chuongTrinhTuApi = (c: ChuongTrinhApi): ChuongTrinh => ({
  ma: c.ma,
  truongMa: c.truongMa,
  truongTen: c.truongTen,
  truongPhoenix: c.truongPhoenix,
  he: c.he as MaHe,
  maNganh: c.maNganh,
  tenNganh: c.tenNganh,
  tuTrinhDo: c.tuTrinhDo as ChuongTrinh['tuTrinhDo'],
  thoiLuongThang: c.thoiLuongThang,
  soKy: c.soKy,
  hocPhiKy: c.hocPhiKy,
  tyLeTrichPpm: c.tyLeTrichPpm,
  thuePpm: c.thuePpm,
  dinhMucKy: c.dinhMucKy,
  treThang: c.treThang,
  nganhSucKhoe: c.nganhSucKhoe,
});

export const hoSoTuApi = (h: HoSoApi): HoSo => ({
  id: h.id,
  ma: h.ma,
  chuongTrinhMa: h.chuongTrinhMa,
  hoTen: h.hoTen,
  ngaySinh: h.ngaySinh,
  soCccd: h.soCccd,
  dienThoai: h.dienThoai,
  email: h.email,
  diaChi: h.diaChi,
  trinhDo: h.trinhDo,
  noiCongTac: h.noiCongTac,
  ghiChu: h.ghiChu,
  nhanSuId: h.nhanSuMa,
  ngayLap: h.ngayLap,
  trangThai: h.trangThai,
  tep: h.tep,
  kyDaThu: h.kyDaThu,
});

export const lanThuTuApi = (l: LanThuApi): LanThu => ({
  id: l.id,
  ma: l.ma,
  hoSoMa: l.hoSoMa,
  kyThu: l.kyThu,
  ngayThu: l.ngayThu,
  soTien: l.soTien,
  soChungTu: l.soChungTu,
  bienLaiTen: l.bienLaiTen,
  taiKhoanId: l.taiKhoanId,
  nhanSuId: l.nhanSuMa,
  dotDoiSoatMa: l.dotDoiSoatId,
  trangThai: l.trangThai,
});

export const dotTuApi = (d: DotDoiSoatApi, lanThuMa: string[]): DotDoiSoat => ({
  id: d.id,
  ma: d.ma,
  truongMa: d.truongMa,
  truongTen: d.truongTen,
  ngayLap: d.ngayLap,
  ngayNhanTien: d.ngayNhanTien,
  trangThai: d.trangThai,
  lanThuMa,
});

export const taiKhoanTuApi = (t: TaiKhoanApi): TaiKhoan => ({
  id: t.id,
  tenChu: t.tenChu,
  tenNganHang: t.tenNganHang,
  bin: t.bin,
  soTaiKhoan: t.soTaiKhoan,
});
