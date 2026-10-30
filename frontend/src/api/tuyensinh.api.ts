/**
 * Lớp gọi API của module tuyển sinh.
 *
 * Đường dẫn bám theo danh sách endpoint ở thuchien.md §9.4; kiểu dữ liệu đầu
 * vào bám theo `backend/src/modules/tuyensinh/tuyensinh.schema.ts`.
 *
 * TIỀN TỐ nằm ở MỘT hằng số: nếu backend mount khác (`/api/ho-so` thay vì
 * `/api/tuyensinh/ho-so`) thì đổi `VITE_TUYENSINH_TIEN_TO`, không phải sửa 20 chỗ.
 *
 * CHƯA ĐỐI CHIẾU VỚI BACKEND ĐANG CHẠY — hình dạng response chỉ mới khớp theo
 * lược đồ Prisma và Zod của module. Khi API bật, kiểm lại từng hàm rồi bỏ dòng
 * ghi chú này.
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

// ---------------------------------------------------------------------------
// Danh mục và tham số
// ---------------------------------------------------------------------------

export interface TruongApi {
  ma: string;
  ten: string;
  loai: string;
  phoenix: boolean;
}

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
  soKy: number;
  hocPhiKy: number;
  tyLeTrichPpm: number;
  thuePpm: number;
  dinhMucKy: number;
  treThang: number;
  nganhSucKhoe: boolean;
}

export const layTruong = () => lay<TruongApi[]>('/danh-muc/truong');

export const layChuongTrinh = (truong?: string) =>
  lay<ChuongTrinhApi[]>('/danh-muc/chuong-trinh', truong ? { truong } : undefined);

export interface ThamSoApi {
  coCau: { ma: string; ten: string; ppm: number; theoHoaDon: boolean }[];
  dauViec: { ma: string; ten: string; trongSo: number }[];
  bieuLuyTien: { ma: string; ten: string; hieuLucTu: string; bac: [number, number][] };
  thuongNguong: [number, number][];
  quyTac: unknown[];
  coChe: { mucSan: number; chiTieuHoSo: number };
}

export const layThamSo = (ngay?: string) => lay<ThamSoApi>('/tham-so', ngay ? { ngay } : undefined);

// ---------------------------------------------------------------------------
// Hồ sơ
// ---------------------------------------------------------------------------

export interface HoSoApi {
  id: string;
  ma: string;
  chuongTrinhMa: string;
  hoTen: string;
  ngaySinh: string;
  soCccd: string;
  dienThoai: string;
  email: string;
  diaChi: string;
  trinhDo: string;
  noiCongTac: string;
  ghiChu: string;
  nhanSuMa: string;
  ngayLap: string;
  trangThai: 'CHO_THANH_TOAN' | 'DANG_HOC' | 'DA_DU_HOC_PHI' | 'THOI_HOC';
  kyDaThu: number;
  tep: { muc: string; ten: string }[];
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

export interface TrangHoSo {
  ds: HoSoApi[];
  meta?: PaginationMeta;
}

export async function layHoSo(query: Record<string, unknown> = {}): Promise<TrangHoSo> {
  const r = await api.get<ApiSuccess<HoSoApi[], PaginationMeta>>(d('/ho-so'), { params: query });
  return { ds: r.data.data, meta: r.data.meta };
}

export const taoHoSo = (body: TaoHoSoInput) => gui<HoSoApi>('/ho-so', body);

/** Tải một tệp đính kèm. Backend trả lại hồ sơ đã có thêm tệp. */
export async function taiTepHoSo(id: string, muc: string, tep: File): Promise<HoSoApi> {
  const form = new FormData();
  form.append('muc', muc);
  form.append('tep', tep);
  const r = await api.post<ApiSuccess<HoSoApi>>(d(`/ho-so/${id}/tep`), form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data.data;
}

// ---------------------------------------------------------------------------
// Lần thu — ghi nhận DOANH SỐ
// ---------------------------------------------------------------------------

export interface LanThuApi {
  id: string;
  ma: string;
  hoSoId: string;
  hoSoMa: string;
  kyThu: number;
  ngayThu: string;
  soTien: number;
  soChungTu: string;
  bienLaiTen: string | null;
  taiKhoanId: string;
  nhanSuMa: string;
  dotDoiSoatId: string | null;
  trangThai: 'CHO_DOI_SOAT' | 'DA_NHAN_TIEN';
}

export interface GhiNhanThuInput {
  soChungTu: string;
  taiKhoanId: string;
  bienLaiTen?: string | null;
  ngayThu?: string;
}

/** Số tiền và số kỳ do MÁY CHỦ suy ra từ chương trình — client không gửi lên. */
export const ghiNhanThu = (hoSoId: string, body: GhiNhanThuInput) =>
  gui<LanThuApi>(`/ho-so/${hoSoId}/lan-thu`, body);

export const layLanThu = (query: Record<string, unknown> = {}) =>
  lay<LanThuApi[]>('/lan-thu', query);

/** Chuỗi VietQR do máy chủ sinh — số tài khoản là tham số của Trường. */
export const layQr = (lanThuId: string) => lay<{ chuoi: string; noiDung: string }>(
  `/lan-thu/${lanThuId}/qr`,
);

// ---------------------------------------------------------------------------
// Đợt đối soát — lập QUỸ CHI
// ---------------------------------------------------------------------------

export interface DotDoiSoatApi {
  id: string;
  ma: string;
  truongMa: string;
  truongTen: string;
  ngayLap: string;
  ngayNhanTien: string | null;
  trangThai: 'CHUA_NHAN_TIEN' | 'DA_NHAN_TIEN';
  lanThuIds: string[];
}

export const layDotDoiSoat = () => lay<DotDoiSoatApi[]>('/dot-doi-soat');

export const taoDotDoiSoat = (body: { truongMa: string; lanThuIds: string[]; ghiChu?: string }) =>
  gui<DotDoiSoatApi>('/dot-doi-soat', body);

/** Khớp đợt ⇒ đánh dấu đã nhận tiền ⇒ máy chủ lập quỹ chi. */
export const khopDotDoiSoat = (id: string, ngayNhanTien?: string) =>
  gui<DotDoiSoatApi>(`/dot-doi-soat/${id}/khop`, ngayNhanTien ? { ngayNhanTien } : {});

// ---------------------------------------------------------------------------
// Tiền: sổ công nợ, bảng lương, soát trần
// ---------------------------------------------------------------------------

export const laySoCongNo = (nhanSuMa: string, den?: string) =>
  lay<unknown[]>(`/nhan-su/${nhanSuMa}/so-cong-no`, den ? { den } : undefined);

export const layDoanhSo = (thang: string, nhanSuMa?: string) =>
  lay<unknown>('/doanh-so', { thang, nhanSuMa });

export const layKyLuong = (thang: string) => lay<unknown>(`/ky-luong/${thang}`);

export const moKyLuong = (thang: string) => gui<unknown>('/ky-luong', { thang });

export const chotKyLuong = (thang: string) => gui<unknown>(`/ky-luong/${thang}/chot`);

export const laySoatTran = (chuongTrinhMa: string, bac = '0,3,6,11', ngay?: string) =>
  lay<unknown>('/tran-chi', { chuongTrinhMa, bac, ngay });

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

export const taoTaiKhoan = (body: Omit<TaiKhoanApi, 'id'>) => gui<TaiKhoanApi>('/tai-khoan', body);
