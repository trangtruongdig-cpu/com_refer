/**
 * Danh mục mạng lưới liên kết: trường, hệ, ngành, học phí, điều kiện dự tuyển.
 *
 * Điều kiện dự tuyển và danh mục hồ sơ soạn theo Thông tư 52/2026/TT-BGDĐT
 * (hiệu lực 15/8/2026) về liên thông giữa trung học nghề, trung cấp, cao đẳng và
 * đại học. Mỗi trường đối tác có quy định riêng về ngành gần, môn thi và giấy tờ
 * bổ sung — phải đối chiếu lại thông báo chính thức trước khi tư vấn.
 *
 * SỐ TIỀN Ở ĐÂY LÀ DỮ LIỆU MẪU, trừ bốn sản phẩm đã đối chiếu trong LOGIC.md
 * (NH-CSSD-PTTM, TC-DD, DH-DT02-GDMN, DHCNVT-NNA). Chỉ `DHCNVT` là trường thật.
 */
import type { CauTrucHocPhi } from '../engine/quy-chi';

export type MaHe = 'NH' | 'SC' | 'TC' | 'CD' | 'DH';

export interface He {
  readonly ma: MaHe;
  readonly ten: string;
  readonly thuTu: number;
}

export const HE: readonly He[] = [
  { ma: 'NH', ten: 'Ngắn hạn', thuTu: 1 },
  { ma: 'SC', ten: 'Sơ cấp', thuTu: 2 },
  { ma: 'TC', ten: 'Trung cấp', thuTu: 3 },
  { ma: 'CD', ten: 'Cao đẳng', thuTu: 4 },
  { ma: 'DH', ten: 'Đại học', thuTu: 5 },
];

export const tenHe = (ma: string): string => HE.find((h) => h.ma === ma)?.ten ?? ma;

export interface ChuongTrinh extends CauTrucHocPhi {
  /** Khoá nghiệp vụ dạng `TRUONG-NGANH`, ví dụ `DHCNVT-NNA` */
  readonly ma: string;
  readonly truongMa: string;
  readonly truongTen: string;
  /** `true` khi là sản phẩm của chính Phoenix (trích 100%) */
  readonly truongPhoenix: boolean;
  readonly he: MaHe;
  readonly maNganh: string;
  readonly tenNganh: string;
  /** Trình độ đầu vào: `THPT` hoặc một mã hệ */
  readonly tuTrinhDo: 'THPT' | MaHe;
  readonly thoiLuongThang: number;
  /** Độ trễ đối soát của trường này, tháng */
  readonly treThang: number;
  readonly nganhSucKhoe: boolean;
  /** Đã đối chiếu tay với LOGIC.md — đừng sửa số mà không sửa kiểm thử */
  readonly daDoiChieu?: boolean;
}

export const CHUONG_TRINH: readonly ChuongTrinh[] = [
  {
    ma: 'DHCNVT-NNA',
    truongMa: 'DHCNVT',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    truongPhoenix: false,
    he: 'DH',
    maNganh: 'NNA',
    tenNganh: 'Ngôn ngữ Anh',
    tuTrinhDo: 'CD',
    thoiLuongThang: 18,
    soKy: 4,
    hocPhiKy: 11_000_000,
    tyLeTrichPpm: 300_000,
    thuePpm: 0,
    dinhMucKy: 500_000,
    treThang: 5,
    nganhSucKhoe: false,
    daDoiChieu: true,
  },
  {
    ma: 'DHCNVT-QTKD',
    truongMa: 'DHCNVT',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    truongPhoenix: false,
    he: 'DH',
    maNganh: 'QTKD',
    tenNganh: 'Quản trị kinh doanh',
    tuTrinhDo: 'CD',
    thoiLuongThang: 18,
    soKy: 4,
    hocPhiKy: 11_000_000,
    tyLeTrichPpm: 300_000,
    thuePpm: 0,
    dinhMucKy: 500_000,
    treThang: 5,
    nganhSucKhoe: false,
  },
  {
    ma: 'DHCNVT-CNTT',
    truongMa: 'DHCNVT',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    truongPhoenix: false,
    he: 'DH',
    maNganh: 'CNTT',
    tenNganh: 'Công nghệ thông tin',
    tuTrinhDo: 'CD',
    thoiLuongThang: 18,
    soKy: 4,
    hocPhiKy: 11_000_000,
    tyLeTrichPpm: 300_000,
    thuePpm: 0,
    dinhMucKy: 500_000,
    treThang: 5,
    nganhSucKhoe: false,
  },
  {
    ma: 'DHCNVT-KETOAN',
    truongMa: 'DHCNVT',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    truongPhoenix: false,
    he: 'DH',
    maNganh: 'KETOAN',
    tenNganh: 'Kế toán',
    tuTrinhDo: 'CD',
    thoiLuongThang: 18,
    soKy: 4,
    hocPhiKy: 11_000_000,
    tyLeTrichPpm: 300_000,
    thuePpm: 0,
    dinhMucKy: 500_000,
    treThang: 5,
    nganhSucKhoe: false,
  },
  {
    ma: 'DHCNVT-CNTP',
    truongMa: 'DHCNVT',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    truongPhoenix: false,
    he: 'DH',
    maNganh: 'CNTP',
    tenNganh: 'Công nghệ thực phẩm',
    tuTrinhDo: 'TC',
    thoiLuongThang: 30,
    soKy: 6,
    hocPhiKy: 11_000_000,
    tyLeTrichPpm: 300_000,
    thuePpm: 0,
    dinhMucKy: 500_000,
    treThang: 5,
    nganhSucKhoe: false,
  },
  {
    ma: 'DH-DT02-LUAT',
    truongMa: 'DH-DT02',
    truongTen: 'Trường Đại học đối tác 02 [điền tên thật]',
    truongPhoenix: false,
    he: 'DH',
    maNganh: 'LUAT',
    tenNganh: 'Luật',
    tuTrinhDo: 'CD',
    thoiLuongThang: 24,
    soKy: 4,
    hocPhiKy: 10_000_000,
    tyLeTrichPpm: 250_000,
    thuePpm: 0,
    dinhMucKy: 450_000,
    treThang: 6,
    nganhSucKhoe: false,
  },
  {
    ma: 'DH-DT02-GDMN',
    truongMa: 'DH-DT02',
    truongTen: 'Trường Đại học đối tác 02 [điền tên thật]',
    truongPhoenix: false,
    he: 'DH',
    maNganh: 'GDMN',
    tenNganh: 'Giáo dục mầm non',
    tuTrinhDo: 'CD',
    thoiLuongThang: 24,
    soKy: 4,
    hocPhiKy: 10_000_000,
    tyLeTrichPpm: 250_000,
    thuePpm: 0,
    dinhMucKy: 450_000,
    treThang: 6,
    nganhSucKhoe: false,
    daDoiChieu: true,
  },
  {
    ma: 'CD-DT01-DD',
    truongMa: 'CD-DT01',
    truongTen: 'Trường Cao đẳng đối tác 01 [điền tên thật]',
    truongPhoenix: false,
    he: 'CD',
    maNganh: 'DD',
    tenNganh: 'Điều dưỡng',
    tuTrinhDo: 'TC',
    thoiLuongThang: 18,
    soKy: 3,
    hocPhiKy: 9_000_000,
    tyLeTrichPpm: 300_000,
    thuePpm: 0,
    dinhMucKy: 400_000,
    treThang: 5,
    nganhSucKhoe: true,
  },
  {
    ma: 'CD-DT01-DUOC',
    truongMa: 'CD-DT01',
    truongTen: 'Trường Cao đẳng đối tác 01 [điền tên thật]',
    truongPhoenix: false,
    he: 'CD',
    maNganh: 'DUOC',
    tenNganh: 'Dược',
    tuTrinhDo: 'TC',
    thoiLuongThang: 18,
    soKy: 3,
    hocPhiKy: 9_000_000,
    tyLeTrichPpm: 300_000,
    thuePpm: 0,
    dinhMucKy: 400_000,
    treThang: 5,
    nganhSucKhoe: true,
  },
  {
    ma: 'TC-DD',
    truongMa: 'PHOENIX',
    truongTen: 'Trường Trung cấp Quốc tế Phoenix',
    truongPhoenix: true,
    he: 'TC',
    maNganh: 'DD',
    tenNganh: 'Điều dưỡng',
    tuTrinhDo: 'THPT',
    thoiLuongThang: 24,
    soKy: 4,
    hocPhiKy: 7_000_000,
    tyLeTrichPpm: 1_000_000,
    thuePpm: 0,
    dinhMucKy: 5_750_000,
    treThang: 0,
    nganhSucKhoe: true,
    daDoiChieu: true,
  },
  {
    ma: 'TC-YHCT',
    truongMa: 'PHOENIX',
    truongTen: 'Trường Trung cấp Quốc tế Phoenix',
    truongPhoenix: true,
    he: 'TC',
    maNganh: 'YHCT',
    tenNganh: 'Y học cổ truyền',
    tuTrinhDo: 'THPT',
    thoiLuongThang: 24,
    soKy: 4,
    hocPhiKy: 7_000_000,
    tyLeTrichPpm: 1_000_000,
    thuePpm: 0,
    dinhMucKy: 5_750_000,
    treThang: 0,
    nganhSucKhoe: true,
  },
  {
    ma: 'TC-CSSD',
    truongMa: 'PHOENIX',
    truongTen: 'Trường Trung cấp Quốc tế Phoenix',
    truongPhoenix: true,
    he: 'TC',
    maNganh: 'CSSD',
    tenNganh: 'Chăm sóc sắc đẹp',
    tuTrinhDo: 'THPT',
    thoiLuongThang: 24,
    soKy: 4,
    hocPhiKy: 7_000_000,
    tyLeTrichPpm: 1_000_000,
    thuePpm: 0,
    dinhMucKy: 5_750_000,
    treThang: 0,
    nganhSucKhoe: false,
  },
  {
    ma: 'NH-CSSD-PTTM',
    truongMa: 'PHOENIX',
    truongTen: 'Trường Trung cấp Quốc tế Phoenix',
    truongPhoenix: true,
    he: 'NH',
    maNganh: 'CSSD-PTTM',
    tenNganh: 'Phun thêu thẩm mỹ',
    tuTrinhDo: 'THPT',
    thoiLuongThang: 3,
    soKy: 1,
    hocPhiKy: 2_000_000,
    tyLeTrichPpm: 1_000_000,
    thuePpm: 0,
    dinhMucKy: 1_200_000,
    treThang: 0,
    nganhSucKhoe: false,
    daDoiChieu: true,
  },
];

export const timChuongTrinh = (ma: string): ChuongTrinh | undefined =>
  CHUONG_TRINH.find((c) => c.ma === ma);

export const HO_SO_CHUNG: readonly string[] = [
  'Phiếu đăng ký xét tuyển theo mẫu của trường',
  'Bản sao có chứng thực bằng tốt nghiệp trình độ trước đó',
  'Bảng điểm toàn khoá trình độ trước đó',
  'Bản sao có chứng thực bằng tốt nghiệp trung học phổ thông hoặc tương đương',
  'Bản sao căn cước công dân',
  'Sơ yếu lý lịch có xác nhận của địa phương hoặc cơ quan công tác',
  'Giấy khám sức khoẻ trong thời hạn 6 tháng',
  'Bốn ảnh 3x4 chụp trong vòng 6 tháng',
];

export const HO_SO_SUC_KHOE: readonly string[] = [
  'Giấy xác nhận thời gian công tác đúng chuyên môn, tối thiểu 36 tháng',
  'Bản sao chứng chỉ hành nghề nếu đã được cấp',
];

export const DIEU_KIEN: Record<string, readonly string[]> = {
  'CD<-TC': [
    'Đã tốt nghiệp trung cấp cùng ngành hoặc ngành gần với ngành đăng ký',
    'Có bằng tốt nghiệp trung học phổ thông, hoặc đã học và thi đạt các môn văn hoá trung học phổ thông theo quy định',
    'Vừa tốt nghiệp trong năm được dùng giấy chứng nhận tốt nghiệp tạm thời',
  ],
  'DH<-CD': [
    'Đã tốt nghiệp cao đẳng cùng ngành hoặc ngành gần với ngành đăng ký',
    'Có bằng tốt nghiệp trung học phổ thông hoặc tương đương',
    'Kết quả học tập toàn khoá cao đẳng đạt yêu cầu xét tuyển của trường',
  ],
  'DH<-TC': [
    'Đã tốt nghiệp trung cấp cùng ngành hoặc ngành gần với ngành đăng ký',
    'Có bằng tốt nghiệp trung học phổ thông hoặc tương đương',
    'Thời gian đào tạo dài hơn so với liên thông từ cao đẳng',
  ],
};

export const DIEU_KIEN_MAC_DINH: readonly string[] = [
  'Đã tốt nghiệp trung học phổ thông hoặc tương đương',
  'Đủ sức khoẻ theo quy định để học tập ngành đăng ký',
];

export function dieuKienCua(ct: ChuongTrinh): readonly string[] {
  if (ct.tuTrinhDo === 'THPT') return DIEU_KIEN_MAC_DINH;
  return DIEU_KIEN[`${ct.he}<-${ct.tuTrinhDo}`] ?? DIEU_KIEN_MAC_DINH;
}

export function hoSoCanNop(ct: ChuongTrinh): readonly string[] {
  return ct.nganhSucKhoe ? [...HO_SO_CHUNG, ...HO_SO_SUC_KHOE] : HO_SO_CHUNG;
}
