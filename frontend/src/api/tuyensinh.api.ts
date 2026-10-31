/**
 * Lớp gọi API của module tuyển sinh.
 *
 * Đường dẫn và hình dạng dữ liệu ở đây ĐÃ ĐỐI CHIẾU với
 * `backend/src/modules/tuyensinh/tuyensinh.route.ts` và `.service.ts`
 * (mount tại `/api/tuyensinh`). Chưa chạy thử với máy chủ đang bật — xem mục
 * "Còn thiếu" trong README của module.
 *
 * TIỀN TỐ nằm ở MỘT hằng số: backend mount đường khác thì đổi
 * `VITE_TUYENSINH_TIEN_TO`, không phải sửa hai mươi chỗ.
 */
import type { ApiSuccess, PaginationMeta } from '@/types/api';
import { api } from './client';

const TIEN_TO = import.meta.env.VITE_TUYENSINH_TIEN_TO ?? '/tuyensinh';
const d = (duong: string) => `${TIEN_TO}${duong}`;

async function lay<T>(duong: string, params?: Record<string, unknown>): Promise<T> {
  const r = await api.get<ApiSuccess<T>>(d(duong), { params });
  return r.data.data;
}

async function gui<T>(duong: string, body?: unknown): Promise<T> {
  const r = await api.post<ApiSuccess<T>>(d(duong), body);
  return r.data.data;
}

export type VaiTroApi = 'NV' | 'TN' | 'TP' | 'ADMIN';

// ---------------------------------------------------------------------------
// Người dùng và nhân sự
// ---------------------------------------------------------------------------

export interface ToiLaApi {
  id: string;
  ma: string;
  hoTen: string;
  vaiTro: VaiTroApi;
  donVi: { ma: string; ten: string; cap: string };
  soNhanSuTrongPhamVi: number;
  quyenHeThong: string;
}

/** Người đang đăng nhập: vai trò nghiệp vụ và phạm vi phụ trách do máy chủ quyết. */
export const layToiLa = () => lay<ToiLaApi>('/toi-la');

export interface NhanSuApi {
  id: string;
  ma: string;
  hoTen: string;
  vaiTro: VaiTroApi;
  nhom: string;
  phong: string;
}

export const layNhanSu = () => lay<NhanSuApi[]>('/nhan-su');

// ---------------------------------------------------------------------------
// Danh mục và tham số — mọi con số dẫn xuất đều do máy chủ tính
// ---------------------------------------------------------------------------

export interface ChuongTrinhApi {
  ma: string;
  truongMa: string;
  truongTen: string;
  truongPhoenix: boolean;
  he: string;
  maNganh: string;
  tenNganh: string;
  tuTrinhDo: string;
  thoiLuongThang: number;
  treThang: number;
  nganhSucKhoe: boolean;
  daDoiChieu: boolean;
  soKy: number;
  hocPhiKy: number;
  hocPhiToanKhoa: number;
  tyLeTrichPpm: number;
  thuePpm: number;
  dinhMucKy: number;
  tienTrichKy: number;
  thueKy: number;
  nopDoiTacKy: number;
  quyChiKy: number;
  pv: number;
  heSoQuyDoi: number;
  doanhSoQuyDoiKy: number;
  baoToan: boolean;
}

export const layDanhMuc = () => lay<ChuongTrinhApi[]>('/danh-muc');

export interface ThamSoApi {
  ngay: string;
  coCau: { ma: string; ten: string; ppm: number; theoHoaDon: boolean }[];
  tongCoCauPpm: number;
  dauViec: { ma: string; ten: string; trongSoPpm: number }[];
  tongDauViecPpm: number;
  bieuLuongMem: unknown;
  moiBieuLuongMem: unknown[];
  thuongNguong: unknown[];
  quyTac: unknown[];
  thamSoCoChe: { mucSan: number; chiTieuHoSo: number } | null;
  giaDinh: { so: number; thamSo: string; dangDung: string; trangThai: string }[];
}

export const layThamSo = (ngay?: string) => lay<ThamSoApi>('/tham-so', ngay ? { ngay } : undefined);

export interface CoCauChuongTrinhApi {
  chuongTrinhMa: string;
  tenNganh: string;
  truongTen: string;
  quyChiKy: number;
  coCau: { ma: string; ten: string; ppm: number; theoHoaDon: boolean; soTien: number }[];
  tongChiaCoCau: number;
  khoanMangLuoi: number;
  dauViec: { ma: string; ten: string; trongSo: number; soTien: number }[];
}

export const layCoCau = (chuongTrinhMa: string, ngay?: string) =>
  lay<CoCauChuongTrinhApi>('/co-cau', { chuongTrinhMa, ngay });

export interface DongChiApi {
  ma: string;
  ten: string;
  soTien: number;
  biChan: boolean;
  mucTruocTran: number;
}

export interface BacSoatApi {
  soHoSoThang: number;
  quyChi: number;
  chi: DongChiApi[];
  tongChi: number;
  conLai: number;
  tyLe: number;
  vuotTran: boolean;
  coBiChan: boolean;
}

export interface TranChiApi {
  chuongTrinhMa: string;
  tenNganh: string;
  truongTen: string;
  ngay: string;
  quyChiKy: number;
  bac: BacSoatApi[];
  coBacVuotTran: boolean;
}

export const laySoatTran = (chuongTrinhMa: string, bac = '0,3,6,11', ngay?: string) =>
  lay<TranChiApi>('/tran-chi', { chuongTrinhMa, bac, ngay });

// ---------------------------------------------------------------------------
// Hồ sơ
// ---------------------------------------------------------------------------

export interface LanThuTrongHoSoApi {
  id: string;
  ma: string;
  kyThu: number;
  ngayThu: string;
  soTien?: number;
  trangThai?: 'CHO_DOI_SOAT' | 'DA_NHAN_TIEN';
}

export interface HoSoApi {
  id: string;
  ma: string;
  hoTen: string;
  ngaySinh: string | null;
  soCccd: string;
  dienThoai: string;
  email: string;
  diaChi: string;
  trinhDo: string;
  ghiChu: string;
  ngayLap: string;
  trangThai: 'CHO_THANH_TOAN' | 'DANG_HOC' | 'DA_DU_HOC_PHI' | 'THOI_HOC';
  kyDaThu: number;
  soKy: number;
  chuongTrinhMa: string;
  tenNganh: string;
  truongTen: string;
  he: string;
  hocPhiKy: number;
  quyChiKy: number;
  canBo: { ma: string; hoTen: string };
  lanThu: LanThuTrongHoSoApi[];
}

export interface TaoHoSoInput {
  chuongTrinhMa: string;
  hoTen: string;
  ngaySinh?: string;
  soCccd: string;
  dienThoai: string;
  email: string;
  diaChi: string;
  trinhDo: string;
  noiCongTac: string;
  ghiChu: string;
  tep: { muc: string; ten: string }[];
}

export async function layHoSo(
  query: Record<string, unknown> = {},
): Promise<{ ds: HoSoApi[]; meta?: PaginationMeta }> {
  const r = await api.get<ApiSuccess<HoSoApi[], { meta: PaginationMeta }>>(d('/ho-so'), {
    params: query,
  });
  return { ds: r.data.data, meta: r.data.meta?.meta };
}

export const taoHoSo = (body: TaoHoSoInput) =>
  gui<{ id: string; ma: string; hoTen: string; chuongTrinhMa: string }>('/ho-so', body);

/**
 * Tải một tệp đính kèm.
 *
 * CHƯA CÓ Ở BACKEND (`POST /ho-so/:id/tep` chưa được khai trong route). Giữ sẵn
 * để bật khi endpoint có; lỗi gọi hàm này không được làm hỏng việc lưu hồ sơ.
 */
export async function taiTepHoSo(id: string, muc: string, tep: File): Promise<void> {
  const form = new FormData();
  form.append('muc', muc);
  form.append('tep', tep);
  await api.post(d(`/ho-so/${id}/tep`), form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// ---------------------------------------------------------------------------
// Lần thu — ghi nhận DOANH SỐ, tiền chưa về
// ---------------------------------------------------------------------------

export interface LanThuApi {
  id: string;
  ma: string;
  kyThu: number;
  ngayThu: string;
  soTien: number;
  soChungTu: string;
  trangThai: 'CHO_DOI_SOAT' | 'DA_NHAN_TIEN';
  hoSoMa: string;
  hocVien: string;
  chuongTrinhMa: string;
  tenNganh: string;
  truongMa: string;
  truongTen: string;
  canBo: { ma: string; hoTen: string };
  dot: { id: string; ma: string; trangThai: string } | null;
}

export interface GhiNhanThuInput {
  soChungTu: string;
  taiKhoanId: string;
  bienLaiTen?: string | null;
  ngayThu?: string;
}

/** Số tiền và số kỳ do MÁY CHỦ suy ra từ chương trình — client không gửi lên. */
export const ghiNhanThu = (hoSoId: string, body: GhiNhanThuInput) =>
  gui<{
    id: string;
    ma: string;
    kyThu: number;
    soTien: number;
    ngayThu: string;
    trangThai: string;
    ghiChu: string;
  }>(`/ho-so/${hoSoId}/lan-thu`, body);

export const layLanThu = (query: Record<string, unknown> = {}) =>
  lay<LanThuApi[]>('/lan-thu', query);

// ---------------------------------------------------------------------------
// Đợt đối soát — mốc duy nhất sinh ra QUỸ CHI
// ---------------------------------------------------------------------------

export interface DotDoiSoatApi {
  id: string;
  ma: string;
  truongMa: string;
  truongTen: string;
  ngayLap: string;
  ngayNhanTien: string | null;
  trangThai: 'CHUA_NHAN_TIEN' | 'DA_NHAN_TIEN';
  ghiChu: string;
  soLanThu: number;
  tongHocPhi: number;
  quyChiDuKien: number;
}

export const layDotDoiSoat = () => lay<DotDoiSoatApi[]>('/dot-doi-soat');

export const taoDotDoiSoat = (body: { truongMa: string; lanThuIds: string[]; ghiChu?: string }) =>
  gui<{ id: string; ma: string; trangThai: string; ghiChu: string }>('/dot-doi-soat', body);

/** Xác nhận tiền thật đã về ⇒ máy chủ lập quỹ chi cho các kỳ trong đợt. */
export const nhanTienDot = (id: string, ngayNhanTien?: string) =>
  gui<{ id: string; ma: string; trangThai: string; ngayNhanTien: string | null; ghiChu: string }>(
    `/dot-doi-soat/${id}/nhan-tien`,
    ngayNhanTien ? { ngayNhanTien } : {},
  );

// ---------------------------------------------------------------------------
// Tài khoản nhận tiền
// ---------------------------------------------------------------------------

export interface TaiKhoanApi {
  id: string;
  tenChu: string;
  tenNganHang: string;
  bin: string;
  soTaiKhoan: string;
}

export const layTaiKhoan = () => lay<TaiKhoanApi[]>('/tai-khoan');

export const taoTaiKhoan = (body: Omit<TaiKhoanApi, 'id'>) =>
  gui<{ id: string; tenChu: string; soTaiKhoan: string }>('/tai-khoan', body);

// ---------------------------------------------------------------------------
// Kỳ lương
// ---------------------------------------------------------------------------

export interface DongBangLuongApi {
  nhanSuMa: string;
  hoTen: string;
  vaiTro: VaiTroApi;
  nhom: string;
  soHoSoMoi: number;
  soKyThu: number;
  hocPhiThucThu: number;
  doanhSoQuyDoi: number;
  luongMem: number;
  thuongNguong: number;
  quyenLoi: number;
  ungThem: number;
  thuHoi: number;
  thucNhan: number;
  noCuoiKy: number;
  nhanh: 'THU_HOI' | 'UNG_THEM' | 'CHI_DUY_TRI';
}

export interface KyLuongApi {
  thang: string;
  trangThai: 'MO' | 'DA_CHOT';
  ngayMo: string;
  ngayChot: string | null;
  tongThucNhan: number;
  thuLaoTn: number;
  thuLaoTp: number;
  quyChiPhatSinh: number;
  vuotTran: boolean;
  snapshot: string;
  bang: DongBangLuongApi[];
}

export interface KyLuongTomTatApi extends Omit<KyLuongApi, 'snapshot' | 'bang'> {
  soDong: number;
}

export const layDsKyLuong = () => lay<KyLuongTomTatApi[]>('/ky-luong');

export const layKyLuong = (thang: string) => lay<KyLuongApi>(`/ky-luong/${thang}`);

/** Tính (hoặc tính lại) kỳ lương — máy chủ chụp ảnh tham số trước khi tính. */
export const tinhKyLuong = (thang: string) => gui<KyLuongApi>(`/ky-luong/${thang}/tinh`);

/** Chốt kỳ — máy chủ chặn nếu vượt trần chi, và kỳ đã chốt là bất biến. */
export const chotKyLuong = (thang: string) => gui<KyLuongApi>(`/ky-luong/${thang}/chot`);

// ---------------------------------------------------------------------------
// Tổng quan — CHỈ tháng hiện tại, chỉ phạm vi của người gọi
// ---------------------------------------------------------------------------

export interface TongQuanApi {
  thang: string;
  vaiTro: VaiTroApi;
  phamVi: number;
  soHoSoMoi: number;
  chiTieuHoSo: number | null;
  datChiTieu: boolean | null;
  mucSan: number | null;
  soKyThu: number;
  hocPhiThucThu: number;
  doanhSoQuyDoi: number;
  quyChiDaVe: number;
  soKyChoDoiSoat: number;
  luongMem: number;
  thuongNguong: number;
  nguongKeTiep: [number, number] | null;
}

export const layTongQuan = () => lay<TongQuanApi>('/tong-quan');
