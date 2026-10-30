/**
 * Tham số chính sách. Mọi bảng đều có hiệu lực theo thời gian: KHÔNG SỬA TẠI
 * CHỖ, KHÔNG XOÁ — ban hành phiên bản mới bằng cách đóng khoảng cũ và mở khoảng
 * mới (LOGIC.md §10). Khoá nghiệp vụ là `(mã, hiệu lực từ)`, không phải `mã`.
 *
 * Khi backend lên, các bảng này đọc từ `co_cau_quy_chi`, `dau_viec`,
 * `bieu_luy_tien`, `thuong_nguong`, `quy_tac_tinh_tien` và được CHỤP ẢNH vào
 * `snapshot_tham_so` trước khi tính kỳ lương.
 */
import type { KhoanCoCau, DauViec } from '../engine/quy-chi';
import type { BacThuong, BacRutGon } from '../engine/luy-tien';
import type { QuyTac } from '../engine/quy-tac';
import type { ThamSoCoChe } from '../engine/ung-truoc';

/** Cơ cấu quỹ chi — bảy khoản, tổng đúng 1.000.000 ppm, hiệu lực 2026-01-01. */
export const CO_CAU_QUY_CHI: readonly KhoanCoCau[] = [
  {
    ma: 'KHOAN_MANG_LUOI',
    ten: 'Khoản mạng lưới',
    ppm: 600_000,
    theoHoaDon: false,
  },
  { ma: 'THU_LAO_TP', ten: 'Thù lao trưởng phòng', ppm: 104_000, theoHoaDon: false },
  { ma: 'THU_LAO_TN', ten: 'Thù lao trưởng nhóm', ppm: 96_000, theoHoaDon: false },
  { ma: 'DOI_NGOAI', ten: 'Đối ngoại', ppm: 50_000, theoHoaDon: true },
  { ma: 'MARKETING', ten: 'Marketing', ppm: 50_000, theoHoaDon: true },
  { ma: 'QUANG_CAO', ten: 'Quảng cáo', ppm: 50_000, theoHoaDon: true },
  { ma: 'SU_KIEN', ten: 'Sự kiện', ppm: 50_000, theoHoaDon: true },
];

/** Mười một đầu việc chia khoản mạng lưới 60%. Tổng trọng số đúng 1,00. */
export const DAU_VIEC: readonly DauViec[] = [
  { ma: 'T02', ten: 'Tư vấn trực tiếp, giải đáp, định hướng ngành', trongSo: 0.15 },
  { ma: 'T01', ten: 'Tạo nguồn, tiếp cận phụ huynh – học sinh', trongSo: 0.12 },
  { ma: 'T03', ten: 'Đối ngoại cơ sở: làm việc với trường phổ thông', trongSo: 0.1 },
  { ma: 'T04', ten: 'Tổ chức buổi tư vấn, sự kiện tại địa bàn', trongSo: 0.1 },
  { ma: 'T07', ten: 'Hướng dẫn và kiểm tra hồ sơ đầu vào', trongSo: 0.1 },
  { ma: 'T09', ten: 'Chốt hồ sơ nhập học', trongSo: 0.1 },
  { ma: 'T05', ten: 'Quảng cáo tại địa phương', trongSo: 0.08 },
  { ma: 'T06', ten: 'Nội dung, hình ảnh, kênh online địa phương', trongSo: 0.08 },
  { ma: 'T08', ten: 'Hướng dẫn nộp học phí vào Trường, theo dõi thu', trongSo: 0.07 },
  { ma: 'T10', ten: 'Chăm sóc 30 ngày đầu, giữ học viên', trongSo: 0.06 },
  { ma: 'T11', ten: 'Điều hành địa bàn, báo cáo, đối soát', trongSo: 0.04 },
];

export interface PhienBanBieu {
  readonly ma: string;
  readonly ten: string;
  readonly hieuLucTu: string;
  readonly hieuLucDen: string | null;
  readonly bac: readonly BacRutGon[];
  readonly ghiChu?: string;
}

/**
 * Biểu lương mềm cán bộ tuyển sinh. Hai phiên bản song song trong
 * `bieu_luy_tien` — bản cũ không xoá để tính lại được các kỳ đã chạy.
 */
export const BIEU_LUONG_MEM: readonly PhienBanBieu[] = [
  {
    ma: 'LUONG_MEM_CB',
    ten: 'Lương mềm cán bộ tuyển sinh — hiệu chỉnh liên kết',
    hieuLucTu: '2026-07-01',
    hieuLucDen: null,
    bac: [
      [16_000_000, 16_000],
      [25_000_000, 28_000],
      [35_000_000, 36_000],
      [50_000_000, 40_000],
      [70_000_000, 45_000],
      [100_000_000, 50_000],
      [140_000_000, 56_000],
      [200_000_000, 62_000],
    ],
  },
  {
    ma: 'LUONG_MEM_CB',
    ten: 'Lương mềm cán bộ tuyển sinh — bản Sapo 2015',
    hieuLucTu: '2026-01-01',
    hieuLucDen: '2026-07-01',
    bac: [
      [16_000_000, 56_000],
      [25_000_000, 100_000],
      [35_000_000, 130_000],
    ],
    ghiChu:
      'LOGIC.md §6 chỉ ghi lại ba bậc đầu của bản gốc. Nạp đủ từ bảng ' +
      'bieu_luy_tien khi có cơ sở dữ liệu; đừng tính kỳ cũ bằng bản rút gọn này.',
  },
];

/** Biểu đang hiệu lực tại một ngày. Một request chỉ nạp MỘT phiên bản. */
export function bieuLuongMemTai(ngay: string): PhienBanBieu {
  const b = BIEU_LUONG_MEM.find(
    (x) => x.hieuLucTu <= ngay && (x.hieuLucDen === null || x.hieuLucDen > ngay),
  );
  if (!b) throw new Error(`Không có biểu lương mềm hiệu lực tại ${ngay}`);
  return b;
}

/** Thưởng đạt ngưỡng — số tiền phẳng trả một lần khi vượt mốc. */
export const THUONG_NGUONG: readonly BacThuong[] = [
  [25_000_000, 150_000],
  [35_000_000, 300_000],
  [50_000_000, 400_000],
  [70_000_000, 800_000],
  [100_000_000, 1_000_000],
  [140_000_000, 1_400_000],
  [200_000_000, 2_000_000],
];

/** Quy tắc tính tiền đang hiệu lực (LOGIC.md §7). Cụ thể thắng rộng. */
export const QUY_TAC: readonly QuyTac[] = [
  {
    ma: 'NV-DHCNVT-NNA',
    vaiTro: 'NV',
    phamVi: { nganh: 'DHCNVT-NNA' },
    coSo: 'KHONG',
    loaiGiaTri: 'SO_TIEN',
    cachXacDinh: 'CO_DINH',
    soTien: 1_500_000,
    tranPpm: 600_000,
    hieuLucTu: '2026-07-01',
    ghiChu: 'Ngành này trả số tiền cố định thay vì 60% quỹ chi.',
  },
  {
    ma: 'NV-DH-DT02',
    vaiTro: 'NV',
    phamVi: { truong: 'DH-DT02' },
    coSo: 'HOC_PHI',
    loaiGiaTri: 'TY_LE',
    cachXacDinh: 'CO_DINH',
    giaTriPpm: 80_000,
    tranPpm: 600_000,
    hieuLucTu: '2026-07-01',
    ghiChu: '8% HỌC PHÍ MỘT KỲ — không phải học phí toàn khoá. Trần 60% quỹ chi chặn lại.',
  },
  {
    ma: 'NV-HE-DH',
    vaiTro: 'NV',
    phamVi: { he: 'DH' },
    coSo: 'QUY_CHI',
    loaiGiaTri: 'TY_LE',
    cachXacDinh: 'BAC_THEO_SO_LUONG',
    bacSoLuong: [
      [0, 480_000],
      [3, 520_000],
      [6, 560_000],
      [11, 600_000],
    ],
    tranPpm: 600_000,
    hieuLucTu: '2026-07-01',
  },
  {
    ma: 'NV-MAC-DINH',
    vaiTro: 'NV',
    phamVi: {},
    coSo: 'QUY_CHI',
    loaiGiaTri: 'TY_LE',
    cachXacDinh: 'CO_DINH',
    giaTriPpm: 600_000,
    tranPpm: null,
    hieuLucTu: '2026-01-01',
  },
  {
    ma: 'TN-MAC-DINH',
    vaiTro: 'TN',
    phamVi: {},
    coSo: 'QUY_CHI',
    loaiGiaTri: 'TY_LE',
    cachXacDinh: 'CO_DINH',
    giaTriPpm: 96_000,
    tranPpm: null,
    hieuLucTu: '2026-01-01',
    ghiChu: 'Chỉ trên học viên của nhân sự mình phụ trách — không theo số người.',
  },
  {
    ma: 'TP-MAC-DINH',
    vaiTro: 'TP',
    phamVi: {},
    coSo: 'QUY_CHI',
    loaiGiaTri: 'TY_LE',
    cachXacDinh: 'CO_DINH',
    giaTriPpm: 104_000,
    tranPpm: null,
    hieuLucTu: '2026-01-01',
    ghiChu: 'Chỉ trên học viên của các nhóm mình phụ trách.',
  },
  {
    ma: 'CTV-HE-DH',
    vaiTro: 'CTV',
    phamVi: { he: 'DH' },
    coSo: 'HOC_PHI',
    loaiGiaTri: 'TY_LE',
    cachXacDinh: 'LUY_TIEN_THEO_TIEN',
    bacTien: [
      [0, 50_000],
      [25_000_000, 60_000],
      [50_000_000, 70_000],
      [100_000_000, 80_000],
    ],
    tranPpm: 600_000,
    hieuLucTu: '2026-07-01',
    ghiChu:
      'GIẢ ĐỊNH: LOGIC.md chỉ ghi dải tỷ lệ 5%→6%→7%→8%, không ghi ngưỡng. ' +
      'Ngưỡng ở đây là tạm, phải thay bằng số trong hợp đồng cộng tác viên.',
  },
];

/** Tham số cơ chế lương hai phần, hiệu lực 01/07/2026 (LOGIC.md §8). */
export const THAM_SO_CO_CHE: ThamSoCoChe = {
  mucSan: 5_000_000,
  chiTieuHoSo: 3,
};

/**
 * Mốc tiền về theo lịch đối soát của một hồ sơ, tính từ tháng thu kỳ 1.
 * LOGIC.md §8.1: kỳ 1 về T+5, kỳ 2 T+10, kỳ 3 T+14, kỳ 4 T+19.
 */
export const MOC_DOI_SOAT: readonly number[] = [5, 10, 14, 19, 24, 29];

/** Tỷ lệ học viên còn theo học mỗi kỳ, dùng cho bản mô phỏng dòng tiền. */
export const TY_LE_GIU_HOC_VIEN = 0.9;

export interface GiaDinh {
  readonly so: number;
  readonly thamSo: string;
  readonly dangDung: string;
  readonly trangThai: string;
}

/** LOGIC.md §15 — đọc trước khi tin con số nào. Hiện ngay trong màn Quản trị. */
export const GIA_DINH: readonly GiaDinh[] = [
  {
    so: 1,
    thamSo: 'Thuế trên phần đối tác trích về',
    dangDung: '0',
    trangThai: 'Cần kế toán xác nhận: doanh thu dịch vụ hay hoạt động giáo dục',
  },
  {
    so: 2,
    thamSo: 'Định mức Trường giữ lại mỗi kỳ',
    dangDung: '500.000đ (hệ liên kết)',
    trangThai: 'Giả định',
  },
  {
    so: 3,
    thamSo: 'Độ trễ đối soát',
    dangDung: '5–6 tháng',
    trangThai: 'Giả định, cần đối chiếu từng hợp đồng',
  },
  {
    so: 4,
    thamSo: 'Chỉ tiêu được ứng của thử việc',
    dangDung: '3 hồ sơ',
    trangThai: 'Nên hạ xuống 2 — xem LOGIC.md §8.4',
  },
  {
    so: 5,
    thamSo: 'Mức sàn ứng trước',
    dangDung: '5.000.000đ',
    trangThai: 'Cần Hiệu trưởng duyệt',
  },
  {
    so: 6,
    thamSo: 'Vốn lưu động mỗi cán bộ',
    dangDung: '25.000.000đ',
    trangThai: 'Điều kiện bắt buộc, cần xác nhận nguồn',
  },
  {
    so: 7,
    thamSo: 'Hoàn ứng khi nghỉ việc giữa chừng',
    dangDung: 'chưa có',
    trangThai: 'Rủi ro hở — xem LOGIC.md §8.6',
  },
  {
    so: 8,
    thamSo: 'Học phí và tỷ lệ trích từng ngành',
    dangDung: 'dữ liệu mẫu',
    trangThai: 'Phải nhập số thật theo hợp đồng',
  },
  {
    so: 9,
    thamSo: 'Ngưỡng tiền của quy tắc cộng tác viên',
    dangDung: '0 / 25 / 50 / 100 triệu',
    trangThai: 'Giả định của bản dựng này — LOGIC.md chỉ ghi dải tỷ lệ',
  },
];
