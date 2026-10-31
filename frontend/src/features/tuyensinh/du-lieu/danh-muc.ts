/**
 * Danh mục mạng lưới liên kết: trường, hệ, ngành, học phí, điều kiện dự tuyển.
 *
 * Điều kiện dự tuyển và danh mục hồ sơ soạn theo Thông tư 52/2026/TT-BGDĐT
 * (hiệu lực 15/8/2026) về liên thông giữa trung học nghề, trung cấp, cao đẳng và
 * đại học. Mỗi trường đối tác có quy định riêng về ngành gần, môn thi và giấy tờ
 * bổ sung — phải đối chiếu lại thông báo chính thức trước khi tư vấn.
 *
 * Chương trình chưa đối chiếu trong CHUONG_TRINH là dữ liệu demo, không dùng để
 * tư vấn tiền. Chương trình đối tác mới được lưu riêng ở danh mục tư vấn, không
 * tham gia lập hồ sơ, thu học phí hoặc tính quyền lợi.
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

export type NhomSanPhamTuVan = 'CHUNG_CHI_NGAN_HAN' | 'SO_CAP';
export type TrangThaiThongTinSale = 'CAN_XAC_NHAN' | 'THAM_KHAO_2025';

export interface NguonSanPham {
  readonly ten: string;
  readonly url: string;
}

/** Mục tư vấn chưa đủ dữ liệu để lập hồ sơ, thu tiền hoặc tính quyền lợi. */
export interface SanPhamTuVan {
  readonly ma: string;
  readonly truongMa: 'PHOENIX';
  readonly truongTen: 'Trường Trung cấp Quốc tế Phoenix';
  readonly truongPhoenix: true;
  readonly he: Extract<MaHe, 'NH' | 'SC'>;
  readonly nhom: NhomSanPhamTuVan;
  readonly tenNganh: string;
  readonly vanBangThamKhao: string;
  readonly dieuKien: readonly string[];
  readonly saleCanThu: readonly string[];
  readonly hoSo: readonly string[];
  readonly hocPhiThamKhaoDong: number;
  readonly ghiChuHocPhi: string;
  readonly thoiLuongThamKhao: string;
  readonly lichKhaiGiangThamKhao: string;
  readonly trangThaiThongTin: TrangThaiThongTinSale;
  readonly hoaHongHienThi: 'Tối đa đến 70% · chưa chốt cơ sở tính';
  readonly ghiChuHoaHong: string;
  readonly nguon: readonly NguonSanPham[];
}

export type LoaiTuyenSinhTuVanDoiTac =
  'VAN_BANG_2_CHINH_THUC' | 'NHAN_NGUOI_CO_BANG_DAI_HOC' | 'KHONG_XAC_NHAN';
export type DonViHocPhiTuVan = 'TIN_CHI' | 'NAM';
export type TrangThaiDotTuyenSinh = 'SAP_MO' | 'DANG_NHAN' | 'DA_DONG' | 'CHUA_CO_DOT_MOI';

export interface DotTuyenSinhTuVan {
  readonly ten: string;
  readonly ngayMoHoSo?: string;
  readonly hanHoSo?: string;
  readonly ngayKhaiGiang?: string;
  readonly ghiChu?: string;
}

export interface HocPhiTuVanDoiTac {
  readonly dong: number;
  readonly donVi: DonViHocPhiTuVan;
  readonly ghiChu?: string;
}

/** Chỉ phục vụ Sale tra cứu; không phải chương trình vận hành của Phoenix. */
export interface ChuongTrinhTuVanDoiTac {
  readonly ma: string;
  readonly truongMa: string;
  readonly truongTen: string;
  readonly truongPhoenix: false;
  readonly he: MaHe;
  readonly maNganh?: string;
  readonly tenNganh: string;
  readonly hinhThuc: string;
  readonly loaiTuyenSinh: LoaiTuyenSinhTuVanDoiTac;
  readonly dotTuyenSinh: DotTuyenSinhTuVan;
  readonly dieuKien: readonly string[];
  readonly saleCanHoi: readonly string[];
  readonly hoSoThamKhao: readonly string[];
  readonly hocPhi?: HocPhiTuVanDoiTac;
  readonly thoiLuongThamKhao?: string;
  readonly ghiChuHoaHong: string;
  readonly nguon: readonly NguonSanPham[];
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

const NGUON_TUYEN_SINH_2026: NguonSanPham = {
  ten: 'Tuyển sinh Phoenix 2026',
  url: 'https://phx.edu.vn/tuyen-sinh/',
};
const NGUON_CHUONG_TRINH_2026: NguonSanPham = {
  ten: 'Danh mục chương trình đào tạo Phoenix 2026',
  url: 'https://phx.edu.vn/chuong-trinh-dao-tao/',
};
const NGUON_CHAM_SOC_DA_2026: NguonSanPham = {
  ten: 'Thông tin Chăm sóc da Phoenix 2026',
  url: 'https://phx.edu.vn/2026/07/30/co-nen-hoc-cham-soc-da-spa-khong-chi-phi-va-thoi-gian-hoc-tu-a-z/',
};
const NGUON_TAO_MAU_TOC_2026: NguonSanPham = {
  ten: 'Chứng chỉ Tạo mẫu tóc Phoenix 2026',
  url: 'https://phx.edu.vn/2026/08/11/chung-chi-tao-mau-toc/',
};
const NGUON_MAY_CNC_CSSD_2026: NguonSanPham = {
  ten: 'Chứng chỉ Ứng dụng máy công nghệ cao trong chăm sóc sắc đẹp 2026',
  url: 'https://phx.edu.vn/2026/08/07/chung-chi-ung-dung-may-cong-nghe-cao-trong-cham-soc-sac-dep/',
};
const NGUON_NOI_MI_2026: NguonSanPham = {
  ten: 'Chứng chỉ Nối mi nghệ thuật Phoenix 2026',
  url: 'https://phx.edu.vn/2026/08/11/chung-chi-noi-mi-nghe-thuat/',
};
const NGUON_NGAN_HAN_2025: NguonSanPham = {
  ten: 'Thông báo ngắn hạn năm 2025',
  url: 'https://phx.edu.vn/2025/07/09/dao-tao-boi-duong-ngan-han/',
};
const NGUON_SO_CAP_2025: NguonSanPham = {
  ten: 'Thông báo sơ cấp năm 2025',
  url: 'https://phx.edu.vn/2025/07/09/dao-tao-trinh-do-so-cap/',
};
const NGUON_SO_CAP_2026: Readonly<Record<string, NguonSanPham>> = {
  CHAM_SOC_DA: {
    ten: 'Chứng chỉ sơ cấp nghề Chăm sóc da Phoenix 2026',
    url: 'https://phx.edu.vn/2026/05/27/tai-sao-can-chung-chi-so-cap-nghe-cham-soc-da-khi-kinh-doanh-spa/',
  },
  XOA_BOP_BAM_HUYET: {
    ten: 'Khóa học Sơ cấp Xoa bóp bấm huyệt Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/12/khoa-hoc-so-cap-xoa-bop-bam-huyet-cap-chung-chi-hanh-nghe/',
  },
  ME_VA_BE: {
    ten: 'Khóa học Sơ cấp Chăm sóc mẹ và bé Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/22/khoa-hoc-so-cap-cham-soc-me-va-be-sau-sinh-chuan-y-khoa/',
  },
  NOI_MI: {
    ten: 'Đào tạo Sơ cấp Nối mi nghệ thuật Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/29/khoa-dao-tao-so-cap-noi-mi-nghe-thuat/',
  },
  TRANG_DIEM_THAM_MY: {
    ten: 'Đào tạo Trang điểm thẩm mỹ cấp chứng chỉ sơ cấp Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/18/dao-tao-trang-diem-tham-my-cap-chung-chi-so-cap/',
  },
  CHAM_SOC_MONG: {
    ten: 'Kỹ thuật viên chăm sóc móng cấp chứng chỉ sơ cấp Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/18/khoa-hoc-ky-thuat-vien-cham-soc-mong-cap-chung-chi-so-cap/',
  },
  TAO_MAU_TOC: {
    ten: 'Đào tạo Sơ cấp Tạo mẫu tóc Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/30/dao-tao-so-cap-tao-mau-toc-chuyen-nghiep/',
  },
  PHUN_THEU: {
    ten: 'Đào tạo Phun thêu thẩm mỹ hệ Sơ cấp Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/25/dao-tao-phun-theu-tham-my-he-so-cap/',
  },
  NGHIEP_VU_LE_TAN: {
    ten: 'Đào tạo Sơ cấp Nghiệp vụ lễ tân Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/23/dao-tao-so-cap-nghiep-vu-le-tan-nha-hang-khach-san/',
  },
  NGHIEP_VU_NHA_HANG: {
    ten: 'Đào tạo Sơ cấp Nghiệp vụ nhà hàng Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/17/dao-tao-so-cap-nghiep-vu-nha-hang-chuyen-nghiep/',
  },
  NGHIEP_VU_BAR: {
    ten: 'Khóa học Sơ cấp Nghiệp vụ bar Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/23/khoa-hoc-so-cap-nghiep-vu-bar-ngan-han/',
  },
  Y_HOC_CO_TRUYEN: NGUON_CHUONG_TRINH_2026,
  NAU_AN: {
    ten: 'Khóa học Nấu ăn lấy chứng chỉ sơ cấp nghề Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/24/lop-hoc-nau-an-ngan-han-lay-chung-chi-so-cap-nghe/',
  },
  NAU_AN_THUAN_CHAY: {
    ten: 'Đào tạo Sơ cấp Nấu ăn thuần chay Phoenix 2026',
    url: 'https://phx.edu.vn/2026/06/26/dao-tao-so-cap-nau-an-thuan-chay-don-dau-xu-huong-am-thuc-xanh/',
  },
  TRONG_RAU_AN_TOAN: {
    ten: 'Khóa đào tạo Sơ cấp Trồng rau an toàn Phoenix 2026',
    url: 'https://phx.edu.vn/2026/07/10/khoa-dao-tao-so-cap-trong-rau-an-toan-3-thang-huong-di-ben-vung-cho-nong-nghiep-sach/',
  },
};

const DIEU_KIEN_NGAN_HAN = [
  'Thông báo tuyển sinh Phoenix 2026 nêu người học từ đủ 15 tuổi và có nhu cầu học tập.',
  'Trang tuyển sinh 2026 không nêu yêu cầu bằng cấp đầu vào cho hệ ngắn hạn.',
] as const;
const DIEU_KIEN_SO_CAP = [
  'Trang tuyển sinh Phoenix 2026 nêu người học từ đủ 15 tuổi và có nhu cầu học tập.',
  'Trang tuyển sinh 2026 không nêu yêu cầu bằng cấp đầu vào cho hệ sơ cấp.',
] as const;
const SALE_CAN_THU = [
  'Họ tên và số điện thoại/Zalo liên hệ',
  'Ngày sinh để kiểm tra điều kiện từ đủ 15 tuổi',
  'Khóa/nghề quan tâm, địa điểm và thời gian có thể học',
] as const;
const HO_SO_NGAN_HAN = [
  'Phiếu đăng ký theo mẫu Phoenix',
  'Bản photo căn cước công dân',
  '02 ảnh 3x4',
] as const;
const HO_SO_SO_CAP = [
  ...HO_SO_NGAN_HAN,
  'Bản sao học bạ THCS/THPT (trang tuyển sinh 2026 liệt kê cho hệ sơ cấp; xác nhận checklist khóa cụ thể)',
] as const;
const HO_SO_PHOENIX_TRUNG_CAP = [
  ...HO_SO_NGAN_HAN,
  'Bản sao công chứng bằng tốt nghiệp hoặc giấy chứng nhận tốt nghiệp tạm thời',
  'Bản sao học bạ THCS/THPT',
] as const;

const PHI_RIENG_2026: Readonly<
  Record<string, { readonly soTien: number; readonly nguon: NguonSanPham }>
> = {
  CHAM_SOC_DA: { soTien: 2_500_000, nguon: NGUON_CHAM_SOC_DA_2026 },
  TAO_MAU_TOC: { soTien: 2_500_000, nguon: NGUON_TAO_MAU_TOC_2026 },
  MAY_CNC_CSSD: { soTien: 2_500_000, nguon: NGUON_MAY_CNC_CSSD_2026 },
  NOI_MI_NGHE_THUAT: { soTien: 2_500_000, nguon: NGUON_NOI_MI_2026 },
};

const TAO_SAN_PHAM_TU_VAN = ({
  ma,
  tenNganh,
  he,
  hocPhiThamKhaoDong,
  ghiChuHocPhi,
  thoiLuongThamKhao,
  trangThaiThongTin,
  nguon,
  tenVanBang,
}: {
  ma: string;
  tenNganh: string;
  he: Extract<MaHe, 'NH' | 'SC'>;
  hocPhiThamKhaoDong: number;
  ghiChuHocPhi: string;
  thoiLuongThamKhao: string;
  trangThaiThongTin: TrangThaiThongTinSale;
  nguon: readonly NguonSanPham[];
  tenVanBang: string;
}): SanPhamTuVan => ({
  ma,
  truongMa: 'PHOENIX',
  truongTen: 'Trường Trung cấp Quốc tế Phoenix',
  truongPhoenix: true,
  he,
  nhom: he === 'SC' ? 'SO_CAP' : 'CHUNG_CHI_NGAN_HAN',
  tenNganh,
  vanBangThamKhao: tenVanBang,
  dieuKien: he === 'SC' ? DIEU_KIEN_SO_CAP : DIEU_KIEN_NGAN_HAN,
  saleCanThu: SALE_CAN_THU,
  hoSo: he === 'SC' ? HO_SO_SO_CAP : HO_SO_NGAN_HAN,
  hocPhiThamKhaoDong,
  ghiChuHocPhi,
  thoiLuongThamKhao,
  lichKhaiGiangThamKhao:
    trangThaiThongTin === 'CAN_XAC_NHAN'
      ? he === 'SC'
        ? 'Thứ 5 hằng tuần theo lịch chung 2026; xác nhận còn nhận hồ sơ'
        : 'Thứ 3 hằng tuần theo lịch chung 2026; xác nhận còn nhận hồ sơ'
      : 'Chưa xác nhận lịch khai giảng; nguồn gần nhất là thông báo 2025',
  trangThaiThongTin,
  hoaHongHienThi: 'Tối đa đến 70% · chưa chốt cơ sở tính',
  ghiChuHoaHong:
    'Định hướng nội bộ tối đa 70%; chưa chốt cơ sở tính, đối tượng nhận và thời điểm đối soát. Không quy đổi thành số tiền hoặc cam kết với học viên.',
  nguon,
});

const CAC_KHOA_NGAN_HAN_2026 = [
  ['AN_TOAN_Y_TE', 'Bồi dưỡng thường xuyên An toàn y tế trong chăm sóc sắc đẹp'],
  ['LASER_CSSD', 'Ứng dụng Laser trong chăm sóc sắc đẹp'],
  ['XOA_BOP_BAM_HUYET', 'Kỹ thuật xoa bóp bấm huyệt'],
  ['CHAM_SOC_DA', 'Chăm sóc da'],
  ['PHUN_THEU', 'Phun thêu thẩm mỹ'],
  ['NOI_MI_NGHE_THUAT', 'Nối mi nghệ thuật'],
  ['TAO_MAU_TOC', 'Tạo mẫu tóc'],
  ['MAY_CNC_YHCT', 'Ứng dụng máy công nghệ cao trong y học cổ truyền'],
  ['CHAM_SOC_MONG', 'Kỹ thuật viên chăm sóc móng'],
  ['ME_VA_BE', 'Chăm sóc mẹ và bé sau sinh'],
  ['MESOTHERAPY', 'Mesotherapy trong làm đẹp'],
  ['MAY_CNC_CSSD', 'Ứng dụng máy công nghệ cao trong chăm sóc sắc đẹp'],
  ['GOI_DAU_DUONG_SINH', 'Kỹ thuật gội đầu dưỡng sinh'],
  [
    'HOAT_CHAT_MY_PHAM',
    'Ứng dụng hoạt chất, dưỡng chất trong mỹ phẩm chăm sóc sắc đẹp chuyên nghiệp',
  ],
  ['TAI_TAO_DA', 'Tái tạo da sinh học không xâm lấn'],
  ['NAN_CHINH_YHCT', 'Kỹ thuật nắn chỉnh cơ xương khớp trong y học cổ truyền'],
  ['MAY_CNC_NAM', 'Ứng dụng máy công nghệ cao trong chăm sóc sắc tố nám'],
  ['TU_VAN_DINH_DUONG', 'Kỹ thuật viên tư vấn dinh dưỡng'],
  ['HOAT_CHAT_SAC_TO', 'Ứng dụng hoạt chất trong chăm sóc sắc tố chuyên sâu'],
  ['HOAT_CHAT_DA_NAM', 'Ứng dụng hoạt chất trong chăm sóc da nám'],
  ['DUONG_CHAT_DA_NAM', 'Ứng dụng hoạt chất, dưỡng chất trong chăm sóc da nám'],
  ['CONG_NGHE_NAM', 'Ứng dụng công nghệ cao trong chăm sóc nám chuyên sâu'],
  ['BAO_CHE_DONG_DUOC', 'Bào chế đông dược'],
  ['XOA_BOP_VLTL', 'Xoa bóp bấm huyệt - vật lý trị liệu'],
  ['MAY_CNC_SUC_KHOE', 'Ứng dụng máy công nghệ cao trong chăm sóc sắc đẹp và sức khỏe'],
] as const;

const CAC_KHOA_NGAN_HAN_2025 = [
  ['CANG_BONG_DA', 'Căng bóng da không xâm lấn'],
  ['NOI_MI_NGHE_THUAT', 'Nối mi nghệ thuật'],
  ['VE_MONG_NGHE_THUAT', 'Vẽ móng nghệ thuật'],
  ['NHIET_LIEU_PHAP', 'Nhiệt liệu pháp ứng dụng chăm sóc sức khỏe'],
  ['THUY_LIEU_PHAP', 'Thủy liệu pháp ứng dụng chăm sóc sức khỏe'],
  ['THAY_DA_SINH_HOC', 'Thay da sinh học'],
  ['TRANG_DIEM_THAM_MY', 'Trang điểm thẩm mỹ'],
  ['NAU_AN', 'Nấu ăn'],
  ['NAU_AN_THUAN_CHAY', 'Nấu ăn thuần chay'],
] as const;

const CAC_KHOA_SO_CAP_2025 = [
  ['XOA_BOP_BAM_HUYET', 'Xoa bóp bấm huyệt'],
  ['CHAM_SOC_DA', 'Chăm sóc da'],
  ['NOI_MI', 'Nối mi'],
  ['CHAM_SOC_MONG', 'Kỹ thuật viên chăm sóc móng'],
  ['TRANG_DIEM_THAM_MY', 'Trang điểm thẩm mỹ'],
  ['VLTL_PHCN', 'Vật lý trị liệu và phục hồi chức năng'],
  ['TAO_MAU_TOC', 'Tạo mẫu tóc'],
  ['CHAM_SOC_SAC_DEP', 'Chăm sóc sắc đẹp'],
  ['Y_HOC_CO_TRUYEN', 'Y học cổ truyền'],
  ['PHUN_THEU', 'Phun thêu thẩm mỹ'],
  ['QUAN_TRI_KHACH_SAN', 'Quản trị khách sạn'],
  ['NGHIEP_VU_NHA_HANG', 'Nghiệp vụ nhà hàng'],
  ['HUONG_DAN_DU_LICH', 'Hướng dẫn du lịch'],
  ['NGHIEP_VU_BAR', 'Nghiệp vụ bar'],
  ['NGHIEP_VU_BUONG_PHONG', 'Nghiệp vụ buồng phòng'],
  ['NGHIEP_VU_LE_TAN', 'Nghiệp vụ lễ tân'],
  ['TRONG_CAY_CO_MUI', 'Trồng cây có múi'],
  ['CHAN_NUOI_THU_Y', 'Nuôi và phòng bệnh gia súc, gia cầm'],
  ['TRONG_CHE', 'Trồng chè'],
  ['TRONG_HOA', 'Trồng hoa'],
  ['TRONG_RAU_AN_TOAN', 'Trồng rau an toàn'],
  ['GIAM_DOC_HOP_TAC_XA', 'Giám đốc hợp tác xã'],
] as const;
const CAC_KHOA_SO_CAP_2026 = [
  ['CHAM_SOC_DA', 'Sơ cấp nghề Chăm sóc da'],
  ['XOA_BOP_BAM_HUYET', 'Sơ cấp Xoa bóp bấm huyệt'],
  ['ME_VA_BE', 'Sơ cấp Chăm sóc mẹ và bé sau sinh'],
  ['NOI_MI', 'Sơ cấp Nối mi nghệ thuật'],
  ['TRANG_DIEM_THAM_MY', 'Sơ cấp Trang điểm thẩm mỹ'],
  ['CHAM_SOC_MONG', 'Sơ cấp Kỹ thuật viên chăm sóc móng'],
  ['TAO_MAU_TOC', 'Sơ cấp Tạo mẫu tóc'],
  ['PHUN_THEU', 'Sơ cấp Phun thêu thẩm mỹ'],
  ['NGHIEP_VU_LE_TAN', 'Sơ cấp Nghiệp vụ lễ tân nhà hàng, khách sạn'],
  ['NGHIEP_VU_NHA_HANG', 'Sơ cấp Nghiệp vụ nhà hàng'],
  ['NGHIEP_VU_BAR', 'Sơ cấp Nghiệp vụ bar'],
  ['NAU_AN', 'Sơ cấp Nấu ăn'],
  ['NAU_AN_THUAN_CHAY', 'Sơ cấp Nấu ăn thuần chay'],
  ['TRONG_RAU_AN_TOAN', 'Sơ cấp Trồng rau an toàn'],
  ['Y_HOC_CO_TRUYEN', 'Sơ cấp Y học cổ truyền'],
] as const;

const MA_NGAN_HAN_DANG_VAN_HANH = 'NH-CSSD-PTTM';
const MA_NGAN_HAN_2026 = new Set<string>(CAC_KHOA_NGAN_HAN_2026.map(([ma]) => ma));
const MA_SO_CAP_2026 = new Set<string>(CAC_KHOA_SO_CAP_2026.map(([ma]) => ma));

export const DANH_MUC_TU_VAN_PHOENIX: readonly SanPhamTuVan[] = [
  ...CAC_KHOA_NGAN_HAN_2026.map(([ma, tenNganh]) =>
    TAO_SAN_PHAM_TU_VAN({
      ma: `PHX-CC-${ma}`,
      tenNganh,
      he: 'NH',
      hocPhiThamKhaoDong: PHI_RIENG_2026[ma]?.soTien ?? 2_000_000,
      ghiChuHocPhi: PHI_RIENG_2026[ma]
        ? 'Trang khóa riêng năm 2026 nêu 2.500.000đ; trang tuyển sinh tổng hợp nêu 2.000.000đ/module. Xác nhận giá hiện tại trước khi báo.'
        : 'Trang tuyển sinh tổng hợp 2026 nêu 2.000.000đ/module; một số trang khóa riêng nêu 2.500.000đ. Xác nhận đúng khóa trước khi báo giá.',
      thoiLuongThamKhao: 'Ngắn hạn; thời lượng theo chương trình riêng của khóa.',
      trangThaiThongTin: 'CAN_XAC_NHAN',
      nguon: [
        NGUON_CHUONG_TRINH_2026,
        NGUON_TUYEN_SINH_2026,
        ...(PHI_RIENG_2026[ma] ? [PHI_RIENG_2026[ma].nguon] : []),
      ],
      tenVanBang: 'Chứng chỉ/chứng nhận theo từng chương trình; xác nhận với Phoenix',
    }),
  ),
  ...CAC_KHOA_NGAN_HAN_2025.filter(([ma]) => !MA_NGAN_HAN_2026.has(ma)).map(([ma, tenNganh]) =>
    TAO_SAN_PHAM_TU_VAN({
      ma: `PHX-CC-2025-${ma}`,
      tenNganh,
      he: 'NH',
      hocPhiThamKhaoDong: 2_000_000,
      ghiChuHocPhi:
        'Thông báo năm 2025 ghi 2.000.000đ/module; chưa xác nhận giá và đợt mở lớp hiện tại.',
      thoiLuongThamKhao: 'Dưới 3 tháng theo thông báo năm 2025; xác nhận thời lượng khóa hiện tại.',
      trangThaiThongTin: 'THAM_KHAO_2025',
      nguon: [NGUON_NGAN_HAN_2025],
      tenVanBang: 'Chứng chỉ/chứng nhận theo thông báo năm 2025; xác nhận với Phoenix',
    }),
  ),
  ...CAC_KHOA_SO_CAP_2026.map(([ma, tenNganh]) =>
    TAO_SAN_PHAM_TU_VAN({
      ma: `PHX-SC-${ma}`,
      tenNganh,
      he: 'SC',
      hocPhiThamKhaoDong: 3_500_000,
      ghiChuHocPhi:
        'Trang tuyển sinh 2026 nêu học phí 3.500.000đ; xác nhận giá và lịch của khóa cụ thể trước khi báo.',
      thoiLuongThamKhao:
        ma === 'TRONG_RAU_AN_TOAN'
          ? 'Khoảng 3 tháng theo bài giới thiệu Phoenix 2026.'
          : ma === 'XOA_BOP_BAM_HUYET'
            ? 'Từ 3–6 tháng theo thông tin tuyển sinh Phoenix 2026.'
            : 'Từ 3 tháng theo thông tin Phoenix công bố; xác nhận thời lượng khóa cụ thể.',
      trangThaiThongTin: 'CAN_XAC_NHAN',
      nguon: [NGUON_TUYEN_SINH_2026, NGUON_SO_CAP_2026[ma]!],
      tenVanBang: 'Chứng chỉ sơ cấp theo thông tin Phoenix 2026',
    }),
  ),
  ...CAC_KHOA_SO_CAP_2025.filter(([ma]) => !MA_SO_CAP_2026.has(ma)).map(([ma, tenNganh]) =>
    TAO_SAN_PHAM_TU_VAN({
      ma: `PHX-SC-2025-${ma}`,
      tenNganh,
      he: 'SC',
      hocPhiThamKhaoDong: 3_500_000,
      ghiChuHocPhi: 'Thông báo năm 2025 ghi 3.500.000đ; chưa xác nhận giá và đợt mở lớp hiện tại.',
      thoiLuongThamKhao: 'Từ 3 tháng theo thông báo năm 2025; xác nhận thời lượng khóa hiện tại.',
      trangThaiThongTin: 'THAM_KHAO_2025',
      nguon: [NGUON_SO_CAP_2025],
      tenVanBang: 'Chứng chỉ sơ cấp theo thông báo năm 2025; xác nhận với Phoenix',
    }),
  ),
];

interface MauChuongTrinhTuVanDoiTac {
  readonly khoa: string;
  readonly he: MaHe;
  readonly tenNganh: string;
  readonly maNganh?: string;
  readonly hocPhi?: HocPhiTuVanDoiTac;
  readonly dieuKien?: readonly string[];
  readonly hoSoThamKhao?: readonly string[];
  readonly thoiLuongThamKhao?: string;
}

interface MauTruongTuVanDoiTac {
  readonly truongMa: string;
  readonly truongTen: string;
  readonly hinhThuc: string;
  readonly loaiTuyenSinh: LoaiTuyenSinhTuVanDoiTac;
  readonly dotTuyenSinh: DotTuyenSinhTuVan;
  readonly dieuKien: readonly string[];
  readonly saleCanHoi: readonly string[];
  readonly hoSoThamKhao: readonly string[];
  readonly hocPhi?: HocPhiTuVanDoiTac;
  readonly thoiLuongThamKhao?: string;
  readonly ghiChuHoaHong: string;
  readonly nguon: readonly NguonSanPham[];
}

const GHI_CHU_HOA_HONG_DOI_TAC =
  'Chưa có thỏa thuận hoa hồng/đối soát Phoenix được xác minh cho chương trình này. Không hứa số tiền Sale nhận và không dùng dữ liệu này để thu tiền.';

function taoChuongTrinhTuVanDoiTac(
  truong: MauTruongTuVanDoiTac,
  cacNganh: readonly MauChuongTrinhTuVanDoiTac[],
): readonly ChuongTrinhTuVanDoiTac[] {
  return cacNganh.map(({ khoa, ...nganh }) => {
    const hocPhi = nganh.hocPhi ?? truong.hocPhi;
    const thoiLuongThamKhao = nganh.thoiLuongThamKhao ?? truong.thoiLuongThamKhao;
    return {
      ...truong,
      ...nganh,
      ma: `${truong.truongMa}-${khoa}`,
      truongPhoenix: false,
      ...(hocPhi ? { hocPhi } : {}),
      ...(thoiLuongThamKhao ? { thoiLuongThamKhao } : {}),
      dieuKien: nganh.dieuKien ?? truong.dieuKien,
      hoSoThamKhao: nganh.hoSoThamKhao ?? truong.hoSoThamKhao,
    };
  });
}

const DIEU_KIEN_HOI_BANG_DAI_HOC = [
  'Thông báo 2026 cho phép người đã tốt nghiệp đại học dự tuyển theo phương thức/đối tượng nêu trong thông báo.',
  'Việc miễn, công nhận hoặc chuyển đổi tín chỉ do trường xét hồ sơ; không mặc định được miễn môn hay rút ngắn thời gian.',
] as const;

export const DANH_MUC_TU_VAN_DOI_TAC: readonly ChuongTrinhTuVanDoiTac[] = [
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'FTU',
      truongTen: 'Trường Đại học Ngoại thương',
      hinhThuc: 'Đại học hình thức đào tạo thường xuyên, phương thức kết hợp',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Đợt 2 năm 2026',
        ngayMoHoSo: '2026-10-01',
        hanHoSo: '2026-12-01',
        ghiChu: 'Thông báo ghi nhận hồ sơ đến 23:00 ngày 01/12/2026.',
      },
      dieuKien: [
        'Người đã tốt nghiệp cao đẳng/đại học được dự tuyển theo Phương thức 2.',
        'Xét điểm trung bình toàn khóa từ 6,0/10 (hoặc 2,2/4) và phỏng vấn; ngành Luật có điều kiện bổ sung theo hồ sơ.',
        'Đây là phương thức tuyển sinh cho người có bằng trước đó, không phải thông báo một chương trình riêng mang tên Văn bằng 2.',
      ],
      saleCanHoi: [
        'Bậc và ngành đã tốt nghiệp; trường cấp bằng; điểm trung bình toàn khóa và thang điểm.',
        'Có bảng điểm, phụ lục văn bằng và giấy tờ chứng minh diện ưu tiên hay không.',
        'Ngành quan tâm, địa điểm và thời gian có thể tham gia học/phỏng vấn.',
      ],
      hoSoThamKhao: [
        'Đơn dự tuyển theo mẫu; ảnh 2x4 và 3x4 theo số lượng trong thông báo.',
        'Bản sao chứng thực CCCD, giấy khai sinh, bằng tốt nghiệp CĐ/ĐH và bảng điểm toàn khóa.',
        'Giấy tờ ưu tiên nếu có; ngành Luật có thể cần thêm học bạ THPT hoặc xác nhận kinh nghiệm.',
        'Văn bằng nước ngoài cần giấy công nhận theo quy định.',
      ],
      thoiLuongThamKhao: 'Thời lượng theo chương trình và kết quả xét hồ sơ của trường.',
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh thường xuyên FTU đợt 2 năm 2026',
          url: 'https://khoadaotaotructuyen.ftu.edu.vn/tuyen-sinh/thong-bao-tuyen-sinh-trinh-do-dai-hoc-hinh-thuc-dao-tao-thuong-xuyen-phuong-thuc-ket-hop-dot-2-nam-2026/',
        },
      ],
    },
    [
      {
        khoa: 'LUAT_THUONG_MAI_QUOC_TE',
        he: 'DH',
        tenNganh: 'Luật thương mại quốc tế',
        maNganh: '7380101',
        hocPhi: {
          dong: 770_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Học phí dự kiến năm học 2026–2027; kiểm tra biểu thu thực tế với trường.',
        },
        dieuKien: [
          ...DIEU_KIEN_HOI_BANG_DAI_HOC,
          'Ngành Luật có điều kiện xét bổ sung tùy bằng tốt nghiệp, kết quả học tập THPT và kinh nghiệm công tác.',
        ],
      },
      {
        khoa: 'KE_TOAN_KIEM_TOAN',
        he: 'DH',
        tenNganh: 'Kế toán – Kiểm toán',
        maNganh: '7340301',
        hocPhi: {
          dong: 770_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Học phí dự kiến năm học 2026–2027; kiểm tra biểu thu thực tế với trường.',
        },
      },
      {
        khoa: 'QUAN_TRI_KINH_DOANH',
        he: 'DH',
        tenNganh: 'Quản trị kinh doanh',
        maNganh: '7340101',
        hocPhi: {
          dong: 770_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Học phí dự kiến năm học 2026–2027; kiểm tra biểu thu thực tế với trường.',
        },
      },
      {
        khoa: 'KINH_TE_DOI_NGOAI',
        he: 'DH',
        tenNganh: 'Kinh tế đối ngoại',
        maNganh: '7310101',
        hocPhi: {
          dong: 770_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Học phí dự kiến năm học 2026–2027; kiểm tra biểu thu thực tế với trường.',
        },
      },
      {
        khoa: 'TIENG_ANH_THUONG_MAI',
        he: 'DH',
        tenNganh: 'Tiếng Anh thương mại',
        maNganh: '7220201',
        hocPhi: {
          dong: 1_000_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Chương trình tích hợp; học phí dự kiến năm học 2026–2027.',
        },
      },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'PTIT',
      truongTen: 'Học viện Công nghệ Bưu chính Viễn thông',
      hinhThuc: 'Đại học từ xa, học trực tuyến',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Đợt 6 năm 2026',
        ngayMoHoSo: '2026-10-12',
        hanHoSo: '2026-11-19',
      },
      dieuKien: [
        'Người đã có bằng đại học thuộc đối tượng dự tuyển; thông báo đợt 6 nêu diện này được ưu tiên xét tuyển thẳng khi đăng ký.',
        'Trường xem xét công nhận/chuyển đổi tín chỉ theo quy định riêng; không mặc định miễn môn.',
      ],
      saleCanHoi: [
        'Bậc/ngành đã tốt nghiệp, bảng điểm và năm tốt nghiệp.',
        'Bằng THPT và học bạ THPT; năm tốt nghiệp THPT để chuẩn bị đúng hồ sơ.',
        'Ngành muốn học và khu vực có thể tham gia thi, xác minh giấy tờ.',
      ],
      hoSoThamKhao: [
        'Phiếu đăng ký và phiếu dự tuyển theo mẫu Học viện.',
        'Bản sao hợp lệ bằng đại học, bảng điểm đại học, bằng THPT/học bạ THPT và CCCD.',
        'Giấy khai sinh, giấy tờ ưu tiên nếu có; hồ sơ bản sao theo số lượng trong thông báo đợt 6.',
      ],
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh từ xa PTIT đợt 6 năm 2026',
          url: 'https://dec.ptit.edu.vn/thong-bao-tuyen-sinh-dao-tao-tu-xa-trinh-do-dai-hoc-dot-6-nam-2026/',
        },
        {
          ten: 'Thông tin đào tạo từ xa PTIT',
          url: 'https://eript.ptit.edu.vn/dao-tao-tu-xa/',
        },
      ],
    },
    [
      {
        khoa: 'KY_THUAT_DIEN_TU_VIEN_THONG',
        he: 'DH',
        tenNganh: 'Kỹ thuật Điện tử viễn thông',
        maNganh: '7520207',
        hocPhi: {
          dong: 530_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Thông báo 2026 công bố mức theo tín chỉ; chưa phải biểu thu theo từng kỳ.',
        },
      },
      {
        khoa: 'CONG_NGHE_THONG_TIN',
        he: 'DH',
        tenNganh: 'Công nghệ thông tin',
        maNganh: '7480201',
        hocPhi: {
          dong: 530_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Thông báo 2026 công bố mức theo tín chỉ; chưa phải biểu thu theo từng kỳ.',
        },
      },
      {
        khoa: 'QUAN_TRI_KINH_DOANH',
        he: 'DH',
        tenNganh: 'Quản trị kinh doanh',
        maNganh: '7340101',
        hocPhi: {
          dong: 510_000,
          donVi: 'TIN_CHI',
          ghiChu: 'Dùng mã ngành theo thông báo đợt 6 năm 2026.',
        },
      },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'NEU',
      truongTen: 'Đại học Kinh tế Quốc dân',
      hinhThuc: 'Đại học từ xa (NEU-Elearning)',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Đợt 8 năm 2026',
        hanHoSo: '2026-10-07',
        ngayKhaiGiang: '2026-11-29',
        ghiChu:
          'Đợt mới nhất đã hết hạn; lịch khai giảng là dự kiến. Chưa có thông báo đợt tiếp theo được xác minh.',
      },
      dieuKien: [
        'Người đã tốt nghiệp cao đẳng/đại học thuộc đối tượng dự tuyển.',
        'Thông báo đợt 8 xét điểm trung bình tích lũy toàn khóa từ 5,0/10 với nhóm có bằng CĐ/ĐH.',
        'NEU không gọi đây là tuyến tuyển sinh riêng Văn bằng 2; miễn/chuyển đổi tín chỉ cần trường xét hồ sơ.',
      ],
      saleCanHoi: [
        'Bằng CĐ/ĐH, ngành tốt nghiệp, trường cấp bằng và điểm trung bình tích lũy.',
        'Ngành muốn học, địa điểm dự tuyển và khả năng tham gia học qua hệ thống trực tuyến.',
        'Nếu muốn xin công nhận tín chỉ: môn đã học, đề cương và bảng điểm để trường thẩm định.',
      ],
      hoSoThamKhao: [
        'Bằng tốt nghiệp CĐ/ĐH và bảng điểm toàn khóa để xét diện dự tuyển.',
        'Hồ sơ xét tuyển và giấy tờ cá nhân theo thông báo đợt mới của NEU.',
        'Hồ sơ công nhận/chuyển đổi tín chỉ là thủ tục riêng, không bảo đảm được miễn môn.',
      ],
      hocPhi: {
        dong: 700_000,
        donVi: 'TIN_CHI',
        ghiChu:
          'Mức dự kiến trong thông tin tuyển sinh NEU 2026; khoảng 130–135 tín chỉ, phí có thể điều chỉnh hằng năm.',
      },
      thoiLuongThamKhao:
        'Khoảng 130–135 tín chỉ; thời lượng thực tế tùy lộ trình và công nhận tín chỉ.',
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo NEU-Elearning đợt 8 tại TP.HCM và Nhật Bản',
          url: 'https://dec.neu.edu.vn/thong-bao-tuyen-sinh-neu-elearning-khu-vuc-thanh-pho-ho-chi-minh-va-nhat-ban-dot-8',
        },
        {
          ten: 'Thông tin tuyển sinh đại học từ xa NEU năm 2026',
          url: 'https://neu.edu.vn/wp-content/uploads/2025/12/Thong-tin-tuyen-sinh-nam-2026-Dai-hoc-tu-xa.pdf',
        },
      ],
    },
    [
      { khoa: 'KE_TOAN', he: 'DH', tenNganh: 'Kế toán', maNganh: '7340301' },
      {
        khoa: 'QUAN_TRI_KINH_DOANH',
        he: 'DH',
        tenNganh: 'Quản trị kinh doanh',
        maNganh: '7340101',
      },
      {
        khoa: 'TAI_CHINH_NGAN_HANG',
        he: 'DH',
        tenNganh: 'Tài chính – Ngân hàng',
        maNganh: '7340201',
      },
      { khoa: 'LUAT_KINH_TE', he: 'DH', tenNganh: 'Luật kinh tế', maNganh: '7380107' },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'DNTU',
      truongTen: 'Trường Đại học Công nghệ Đồng Nai',
      hinhThuc: 'Đại học từ xa, học linh hoạt theo lịch của trường',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Tuyển sinh từ xa năm 2026',
        ngayMoHoSo: '2026-11-01',
        hanHoSo: '2026-12-01',
        ghiChu: 'Trường bắt đầu nhận hồ sơ từ ngày 01/11/2026.',
      },
      dieuKien: [
        'Tốt nghiệp THPT hoặc tương đương.',
        'Người đã tốt nghiệp trung cấp/cao đẳng/đại học có thể dự tuyển theo điều kiện tương ứng; kết quả bậc trước được dùng xét theo thông báo.',
        'Thông báo không gọi đây là chương trình VB2 và không cam kết miễn tín chỉ.',
      ],
      saleCanHoi: [
        'Bằng THPT và bằng cấp cao nhất đã có; trường/ngành tốt nghiệp.',
        'Bảng điểm bậc CĐ/ĐH và điểm tích lũy nếu muốn xét theo bậc đã học.',
        'Ngành đăng ký và thời gian có thể học buổi tối/cuối tuần.',
      ],
      hoSoThamKhao: [
        'Bằng tốt nghiệp và bảng điểm theo diện dự tuyển; giấy tờ THPT theo yêu cầu.',
        'CCCD và các biểu mẫu/hồ sơ theo thông báo tuyển sinh 2026.',
      ],
      hocPhi: {
        dong: 390_000,
        donVi: 'TIN_CHI',
        ghiChu:
          'Thông báo nêu học phí theo tín chỉ; một số học phần chuẩn đầu ra có thể tính riêng.',
      },
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh đại học từ xa DNTU năm 2026',
          url: 'https://dntu.edu.vn/thong-tin-tuyen-sinh-dai-hoc/thong-bao-tuyen-sinh-dai-hoc-he-dao-tao-tu-xa-nam-2026',
        },
      ],
    },
    [
      {
        khoa: 'NGON_NGU_ANH',
        he: 'DH',
        tenNganh: 'Ngôn ngữ Anh',
        maNganh: '7220201',
      },
      { khoa: 'KE_TOAN', he: 'DH', tenNganh: 'Kế toán', maNganh: '7340301' },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'THANHDO',
      truongTen: 'Trường Đại học Thành Đô',
      hinhThuc: 'Đại học từ xa qua mạng máy tính và viễn thông',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Đợt 4 năm 2026',
        ngayMoHoSo: '2026-08-17',
        hanHoSo: '2026-11-25',
        ghiChu: 'Ngày 25/11 là kỳ xét tuyển; Sale cần xác nhận giờ chốt nhận hồ sơ với trường.',
      },
      dieuKien: [
        'Tốt nghiệp THPT/trung học nghề tương đương; hoặc trung cấp cùng nhóm ngành và hoàn tất văn hóa THPT.',
        'Xét học bạ THPT hoặc kết quả học tập trung cấp trở lên theo thông báo.',
        'Người có bằng cao đẳng trở lên có thể được xét công nhận/chuyển đổi tín chỉ; không mặc định là VB2.',
        'Hồ sơ ngành Luật có yêu cầu xác nhận thâm niên công tác.',
      ],
      saleCanHoi: [
        'Bằng cao nhất, ngành học, học bạ/bảng điểm và bằng THPT hoặc giấy hoàn tất văn hóa.',
        'Ngành và chuyên ngành cụ thể muốn đăng ký.',
        'Nếu đăng ký Luật: thông tin và giấy xác nhận thâm niên công tác.',
      ],
      hoSoThamKhao: [
        'Bằng cấp và học bạ/bảng điểm phù hợp với phương thức xét tuyển.',
        'Ngành Luật cần giấy xác nhận thâm niên theo thông báo.',
        'Mẫu đơn, giấy tờ cá nhân và bản sao hồ sơ theo hướng dẫn đợt 4.',
      ],
      hocPhi: {
        dong: 370_000,
        donVi: 'TIN_CHI',
        ghiChu: 'Mức công bố trong thông báo tuyển sinh đợt 4 năm 2026.',
      },
      thoiLuongThamKhao:
        'Khoảng 2–2,5 năm với người có bằng CĐ trở lên; phụ thuộc kết quả xét chuyển đổi tín chỉ.',
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh đại học từ xa Thành Đô đợt 4 năm 2026',
          url: 'https://tuyensinh.thanhdo.edu.vn/thong-bao-tuyen-sinh-dai-hoc-hinh-thuc-dao-tao-tu-xa-dot-4-nam-2026/',
        },
      ],
    },
    [
      {
        khoa: 'CNTT_HE_THONG_THONG_TIN',
        he: 'DH',
        tenNganh: 'Công nghệ thông tin · Hệ thống thông tin',
      },
      {
        khoa: 'CNTT_KHOA_HOC_DU_LIEU_AI',
        he: 'DH',
        tenNganh: 'Công nghệ thông tin · Khoa học dữ liệu và trí tuệ nhân tạo',
      },
      {
        khoa: 'QTVP_THU_VIEN',
        he: 'DH',
        tenNganh: 'Quản trị văn phòng · Thư viện',
      },
      {
        khoa: 'QTVP_THIET_BI_TRUONG_HOC',
        he: 'DH',
        tenNganh: 'Quản trị văn phòng · Thiết bị trường học',
      },
      {
        khoa: 'QTVP_HANH_CHINH_VAN_THU',
        he: 'DH',
        tenNganh: 'Quản trị văn phòng · Hành chính văn thư',
      },
      {
        khoa: 'QTVP_QUAN_TRI_CONG_SO',
        he: 'DH',
        tenNganh: 'Quản trị văn phòng · Quản trị công sở',
      },
      {
        khoa: 'QTKD_DOANH_NGHIEP_SO',
        he: 'DH',
        tenNganh: 'Quản trị kinh doanh · Quản trị doanh nghiệp số',
      },
      {
        khoa: 'NNA_SU_PHAM',
        he: 'DH',
        tenNganh: 'Ngôn ngữ Anh · Tiếng Anh Sư phạm',
      },
      {
        khoa: 'NNA_DU_LICH',
        he: 'DH',
        tenNganh: 'Ngôn ngữ Anh · Tiếng Anh Du lịch',
      },
      { khoa: 'LUAT_UNG_DUNG', he: 'DH', tenNganh: 'Luật · Luật ứng dụng' },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'CTU',
      truongTen: 'Trường Đại học Cần Thơ',
      hinhThuc: 'Đại học hình thức thường xuyên, phương thức đào tạo từ xa',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Đợt 3 năm 2026',
        hanHoSo: '2026-11-27',
        ngayKhaiGiang: '2026-12-25',
      },
      dieuKien: [
        'Người tốt nghiệp cao đẳng/đại học được dự tuyển theo thông báo.',
        'Người tốt nghiệp trung cấp phải cùng nhóm ngành và hoàn tất văn hóa THPT.',
        'Ngành Luật có ngưỡng riêng theo bậc tốt nghiệp, xếp loại và/hoặc kinh nghiệm công tác.',
        'Lịch học/thi theo kế hoạch của trường; không quảng cáo toàn bộ quá trình là trực tuyến.',
      ],
      saleCanHoi: [
        'Bậc, ngành đã tốt nghiệp, trường cấp bằng và xếp loại/điểm toàn khóa.',
        'Với trung cấp: ngành có cùng nhóm với ngành đăng ký và giấy tờ hoàn tất văn hóa THPT.',
        'Nếu đăng ký Luật: xếp loại văn bằng và kinh nghiệm công tác đúng chuyên môn.',
        'Địa điểm và khả năng tham gia các hoạt động/thi theo kế hoạch trường.',
      ],
      hoSoThamKhao: [
        'Văn bằng và bảng điểm bậc đã học; giấy tờ THPT/văn hóa THPT theo diện dự tuyển.',
        'Hồ sơ riêng theo ngành Luật nếu áp dụng ngưỡng hoặc kinh nghiệm công tác.',
        'Lệ phí xét tuyển công bố là 150.000đ/ngành; hồ sơ và biểu mẫu theo thông báo đợt 3.',
      ],
      hocPhi: {
        dong: 495_000,
        donVi: 'TIN_CHI',
        ghiChu: 'Mức công bố trong thông báo đợt 3 năm 2026; lệ phí xét tuyển tính riêng.',
      },
      thoiLuongThamKhao:
        'Khoảng 2–3,5 năm tùy bằng cấp trước đó, ngành và kết quả xét công nhận học tập.',
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh đào tạo từ xa CTU đợt 3 năm 2026',
          url: 'https://cce.ctu.edu.vn/tuyen-sinh/tuyen-sinh-he-tu-xa/686-thong-bao-tuyen-sinh-dao-tao-tu-xa-2026-d3.html',
        },
        {
          ten: 'Thông báo 3072/TB-ĐHCT năm 2026 (PDF)',
          url: 'https://cce.ctu.edu.vn/images/upload/TX/tuyensinh/thongbao/Thong_bao_tuyen_sinh_dot3_2026_DTTX.pdf',
        },
      ],
    },
    [
      { khoa: 'NGON_NGU_ANH', he: 'DH', tenNganh: 'Ngôn ngữ Anh' },
      { khoa: 'NGON_NGU_PHAP', he: 'DH', tenNganh: 'Ngôn ngữ Pháp' },
      { khoa: 'THONG_TIN_THU_VIEN', he: 'DH', tenNganh: 'Thông tin – Thư viện' },
      { khoa: 'QUAN_TRI_KINH_DOANH', he: 'DH', tenNganh: 'Quản trị kinh doanh' },
      { khoa: 'TAI_CHINH_NGAN_HANG', he: 'DH', tenNganh: 'Tài chính – Ngân hàng' },
      { khoa: 'KE_TOAN', he: 'DH', tenNganh: 'Kế toán' },
      { khoa: 'LUAT', he: 'DH', tenNganh: 'Luật' },
      { khoa: 'CONG_NGHE_THONG_TIN', he: 'DH', tenNganh: 'Công nghệ thông tin' },
      {
        khoa: 'LOGISTICS_QUAN_LY_CHUOI_CUNG_UNG',
        he: 'DH',
        tenNganh: 'Logistics và Quản lý chuỗi cung ứng',
      },
      { khoa: 'BAO_VE_THUC_VAT', he: 'DH', tenNganh: 'Bảo vệ thực vật' },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'VNU_UL',
      truongTen: 'Trường Đại học Luật, Đại học Quốc gia Hà Nội',
      hinhThuc: 'Đại học hình thức đào tạo thường xuyên; học trực tiếp ngoài giờ tại Hà Nội',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Tuyển sinh năm 2026',
        hanHoSo: '2026-11-10',
        ngayKhaiGiang: '2026-12-05',
        ghiChu: 'Lịch phỏng vấn và nhập học là dự kiến theo thông báo.',
      },
      dieuKien: [
        'Người đã tốt nghiệp THPT/trung học nghề hoặc đã có bằng đại học được dự tuyển.',
        'Người có bằng đại học nộp bằng và bảng điểm; thời gian học dự kiến 2,5–3 năm và có thể xét công nhận tín chỉ.',
        'Thông báo không xác định 297 chỉ tiêu là chỉ tiêu riêng cho VB2.',
        'Phương thức xét học bạ THPT kết hợp phỏng vấn; cần đối chiếu phương thức phù hợp với hồ sơ từng người.',
      ],
      saleCanHoi: [
        'Đã có bằng đại học hay chưa; nếu có, xin bằng và bảng điểm.',
        'Học bạ/điểm THPT và giấy tờ thuộc phương thức dự tuyển.',
        'Có thể học trực tiếp ngoài giờ vào cuối tuần tại Hà Nội không.',
      ],
      hoSoThamKhao: [
        'Bằng tốt nghiệp và bảng điểm đại học nếu dự tuyển theo diện đã có bằng.',
        'Hồ sơ và minh chứng theo phương thức xét tuyển; lịch phỏng vấn trực tiếp theo thông báo.',
      ],
      hocPhi: {
        dong: 45_645_000,
        donVi: 'NAM',
        ghiChu:
          'Mức dự kiến năm học 2026–2027; tổng chi phí và thời gian học phụ thuộc kết quả xét tín chỉ.',
      },
      thoiLuongThamKhao:
        'Dự kiến 2,5–3 năm với người có bằng đại học; không mặc định hoàn thành trong 3 năm.',
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh đại học hình thức đào tạo thường xuyên năm 2026',
          url: 'https://law.vnu.edu.vn/tuyen-sinh-dai-hoc-hinh-thuc-dao-tao-thuong-xuyen-nam-2026/',
        },
      ],
    },
    [{ khoa: 'LUAT', he: 'DH', tenNganh: 'Luật', maNganh: '7380101' }],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'HCCT',
      truongTen: 'Trường Cao đẳng Thương mại và Du lịch Hà Nội',
      hinhThuc: 'Cao đẳng/trung cấp; thông báo tuyển sinh 2026 không nêu học từ xa',
      loaiTuyenSinh: 'KHONG_XAC_NHAN',
      dotTuyenSinh: {
        ten: 'Tuyển sinh năm học 2026',
        ngayMoHoSo: '2026-01-02',
        hanHoSo: '2026-12-31',
      },
      dieuKien: [
        'Thông báo năm 2026 công bố 15 ngành cao đẳng và 9 ngành trung cấp.',
        'Phương thức xét tuyển, không tổ chức thi tuyển.',
        'Có thể đăng ký liên thông trung cấp lên cao đẳng ở ngành tương ứng; cần kiểm tra ngành và điều kiện cụ thể.',
      ],
      saleCanHoi: [
        'Bằng cao nhất hiện có và ngành muốn đăng ký.',
        'Nếu đăng ký trung cấp: học bạ THCS/THPT; nếu đăng ký cao đẳng: học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT.',
        'Nếu muốn liên thông: bằng trung cấp, ngành học và trường đã cấp bằng.',
      ],
      hoSoThamKhao: [
        'Phiếu đăng ký xét tuyển theo mẫu trường.',
        'Bản sao chứng thực học bạ và bằng tốt nghiệp THCS/THPT hoặc giấy chứng nhận tốt nghiệp tạm thời.',
        'Bản sao bằng tốt nghiệp trung cấp nếu đăng ký liên thông tương ứng.',
        'Giấy chứng nhận kết quả thi THPT nếu xét theo điểm thi.',
      ],
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh hệ cao đẳng, trung cấp HCCT năm học 2026',
          url: 'https://hcct.edu.vn/thong-bao-tuyen-sinh-he-cao-dang-trung-cap-nam-hoc-2026/',
        },
      ],
    },
    [
      {
        khoa: 'CD_TRUYEN_THONG_DA_PHUONG_TIEN',
        he: 'CD',
        tenNganh: 'Truyền thông đa phương tiện',
        maNganh: '6320106',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_CONG_NGHE_KY_THUAT_DIEN_DIEN_TU',
        he: 'CD',
        tenNganh: 'Công nghệ kỹ thuật điện, điện tử',
        maNganh: '6510303',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_CONG_NGHE_THONG_TIN',
        he: 'CD',
        tenNganh: 'Công nghệ thông tin',
        maNganh: '6480201',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_HUONG_DAN_DU_LICH',
        he: 'CD',
        tenNganh: 'Hướng dẫn du lịch',
        maNganh: '6810103',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_QUAN_TRI_KINH_DOANH',
        he: 'CD',
        tenNganh: 'Quản trị kinh doanh',
        maNganh: '6340404',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_QUAN_TRI_KHACH_SAN',
        he: 'CD',
        tenNganh: 'Quản trị khách sạn',
        maNganh: '6810201',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_KY_THUAT_CHE_BIEN_MON_AN',
        he: 'CD',
        tenNganh: 'Kỹ thuật chế biến món ăn',
        maNganh: '6810207',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_THUONG_MAI_DIEN_TU',
        he: 'CD',
        tenNganh: 'Thương mại điện tử',
        maNganh: '6340122',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_KE_TOAN',
        he: 'CD',
        tenNganh: 'Kế toán',
        maNganh: '6340301',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_KINH_DOANH_THUONG_MAI',
        he: 'CD',
        tenNganh: 'Kinh doanh thương mại',
        maNganh: '6340101',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_QUAN_TRI_DICH_VU_DU_LICH_LU_HANH',
        he: 'CD',
        tenNganh: 'Quản trị dịch vụ du lịch và lữ hành',
        maNganh: '6810101',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_TIENG_ANH',
        he: 'CD',
        tenNganh: 'Tiếng Anh',
        maNganh: '6220206',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_TIENG_TRUNG_QUOC',
        he: 'CD',
        tenNganh: 'Tiếng Trung Quốc',
        maNganh: '6220209',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_TIENG_HAN_QUOC',
        he: 'CD',
        tenNganh: 'Tiếng Hàn Quốc',
        maNganh: '6220211',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'CD_QUAN_TRI_NHA_HANG_DICH_VU_AN_UONG',
        he: 'CD',
        tenNganh: 'Quản trị nhà hàng và dịch vụ ăn uống',
        maNganh: '6810205',
        dieuKien: [
          'Tốt nghiệp THPT hoặc tương đương; xét học bạ lớp 12 hoặc điểm thi tốt nghiệp THPT 2026.',
        ],
      },
      {
        khoa: 'TC_TRUYEN_THONG_DA_PHUONG_TIEN',
        he: 'TC',
        tenNganh: 'Truyền thông đa phương tiện',
        maNganh: '5320106',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_KY_THUAT_CHE_BIEN_MON_AN',
        he: 'TC',
        tenNganh: 'Kỹ thuật chế biến món ăn',
        maNganh: '5810207',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_QUAN_TRI_KHACH_SAN',
        he: 'TC',
        tenNganh: 'Quản trị khách sạn',
        maNganh: '5810201',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_HUONG_DAN_DU_LICH',
        he: 'TC',
        tenNganh: 'Hướng dẫn du lịch',
        maNganh: '5810103',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_TIENG_ANH',
        he: 'TC',
        tenNganh: 'Tiếng Anh',
        maNganh: '5220206',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_TIENG_HAN_QUOC',
        he: 'TC',
        tenNganh: 'Tiếng Hàn Quốc',
        maNganh: '5220211',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_TIENG_TRUNG_QUOC',
        he: 'TC',
        tenNganh: 'Tiếng Trung Quốc',
        maNganh: '5220209',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_CONG_NGHE_THONG_TIN',
        he: 'TC',
        tenNganh: 'Công nghệ thông tin',
        maNganh: '5480201',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
      {
        khoa: 'TC_KE_TOAN',
        he: 'TC',
        tenNganh: 'Kế toán',
        maNganh: '5340301',
        dieuKien: ['Tốt nghiệp THCS trở lên; xét học bạ THCS hoặc THPT.'],
      },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'TDMU',
      truongTen: 'Trường Đại học Thủ Dầu Một',
      hinhThuc: 'Đại học từ xa, học trực tuyến; thi kết thúc học phần theo kế hoạch của trường',
      loaiTuyenSinh: 'VAN_BANG_2_CHINH_THUC',
      dotTuyenSinh: {
        ten: 'Đợt 2 năm 2026 · Thông báo 227/TB-ĐHTDM',
        hanHoSo: '2026-11-30',
        ngayKhaiGiang: '2026-12-26',
        ghiChu:
          'Chỉ tuyển ngành còn chỉ tiêu sau đợt 1; cần hỏi trường xác nhận ngành đang nhận hồ sơ trước khi tư vấn.',
      },
      dieuKien: [
        'Đã có bằng tốt nghiệp đại học; văn bằng nước ngoài phải được công nhận theo quy định.',
        'Xét kết quả học tập toàn khóa bậc đại học và điểm ưu tiên (nếu có); điểm tốt nghiệp từ mức Trung bình trở lên.',
        'Thông báo 227/TB-ĐHTDM ngày 27/10/2026 thay thế thông báo 201/TB-ĐHTDM.',
      ],
      saleCanHoi: [
        'Bằng đại học, ngành học, trường cấp bằng, điểm/xếp loại tốt nghiệp và bảng điểm.',
        'Nếu bằng do nước ngoài cấp: tình trạng công nhận văn bằng tại Việt Nam.',
        'Ngành mong muốn; trường cần xác nhận ngành đó còn chỉ tiêu trong đợt 2.',
      ],
      hoSoThamKhao: [
        'Bằng tốt nghiệp đại học và bảng điểm toàn khóa.',
        'CCCD, hồ sơ đăng ký và minh chứng ưu tiên nếu có.',
        'Lệ phí xét tuyển công bố là 160.000đ; trường thông báo lịch và mức thu học phí theo từng đợt sau trúng tuyển.',
      ],
      thoiLuongThamKhao: '70 tín chỉ, dự kiến 2 năm; học phí đóng theo tín chỉ và chia 4 đợt.',
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo mới nhất tuyển sinh từ xa văn bằng 2 năm 2026',
          url: 'https://tdmu.edu.vn/thong-bao/tong-hop/thong-bao-thay-the-thong-bao-so-201-tb-dhtdm-ve-tuyen-sinh-lien-thong-trinh-do-dai-hoc-tu-xa-van-bang-2-nam-2026',
        },
        {
          ten: 'Thông báo 227/TB-ĐHTDM ký ngày 27/10/2026 (PDF)',
          url: 'https://tdmu.edu.vn/hinh/thuvien/taptin/10-27-2026-2-54-30-pm227TB.signed.pdf',
        },
      ],
    },
    [
      {
        khoa: 'NGON_NGU_ANH',
        he: 'DH',
        tenNganh: 'Ngôn ngữ Anh',
        maNganh: '7220201',
        hocPhi: {
          dong: 477_500,
          donVi: 'TIN_CHI',
          ghiChu: '70 tín chỉ; tổng học phí công bố 33.425.000đ.',
        },
      },
      {
        khoa: 'QUAN_TRI_KINH_DOANH',
        he: 'DH',
        tenNganh: 'Quản trị kinh doanh',
        maNganh: '7340101',
        hocPhi: {
          dong: 447_500,
          donVi: 'TIN_CHI',
          ghiChu: '70 tín chỉ; tổng học phí công bố 31.325.000đ.',
        },
      },
      {
        khoa: 'CONG_NGHE_THONG_TIN',
        he: 'DH',
        tenNganh: 'Công nghệ thông tin',
        maNganh: '7480201',
        hocPhi: {
          dong: 489_844,
          donVi: 'TIN_CHI',
          ghiChu: '70 tín chỉ; tổng học phí công bố 34.289.080đ.',
        },
      },
    ],
  ),
  ...taoChuongTrinhTuVanDoiTac(
    {
      truongMa: 'TDTU',
      truongTen: 'Trường Đại học Tôn Đức Thắng',
      hinhThuc: 'Đại học từ xa',
      loaiTuyenSinh: 'NHAN_NGUOI_CO_BANG_DAI_HOC',
      dotTuyenSinh: {
        ten: 'Đợt 2 năm 2026',
        hanHoSo: '2026-10-30',
        ghiChu:
          'Đợt đã hết hạn ngày 30/10/2026; thông báo không gọi đây là chương trình VB2 và chưa có đợt mới được xác minh.',
      },
      dieuKien: [
        'Thông báo 2026 nhận người đã tốt nghiệp đại học theo nhóm đối tượng dự tuyển.',
        'Đợt tuyển sinh hiện ghi trong danh mục đã hết hạn; không tư vấn như đang mở tuyển.',
        'Việc công nhận tín chỉ (nếu có) do trường xét, không mặc định được miễn môn.',
      ],
      saleCanHoi: [
        'Bằng đại học, ngành và trường cấp bằng.',
        'Nơi dự tuyển và lịch học phù hợp.',
        'Xác nhận TDTU đã công bố đợt mới hay chưa trước khi nhận hồ sơ.',
      ],
      hoSoThamKhao: [
        'Bằng đại học và hồ sơ dự tuyển theo thông báo năm 2026; cần đối chiếu khi có đợt mới.',
      ],
      ghiChuHoaHong: GHI_CHU_HOA_HONG_DOI_TAC,
      nguon: [
        {
          ten: 'Thông báo tuyển sinh đào tạo từ xa TDTU năm 2026 đợt 2',
          url: 'https://dttx.tdtu.edu.vn/thong-bao/thong-bao-tuyen-sinh-dao-tao-tu-xa-nam-2026-dot-2',
        },
      ],
    },
    [{ khoa: 'NGON_NGU_ANH', he: 'DH', tenNganh: 'Ngôn ngữ Anh' }],
  ),
];

export const trangThaiDotTuyenSinh = (
  muc: ChuongTrinhTuVanDoiTac,
  homNay = ngayHienTaiVietNam(),
): TrangThaiDotTuyenSinh => {
  const { ngayMoHoSo, hanHoSo } = muc.dotTuyenSinh;
  if (!hanHoSo) return 'CHUA_CO_DOT_MOI';
  if (ngayMoHoSo && homNay < ngayMoHoSo) return 'SAP_MO';
  return homNay <= hanHoSo ? 'DANG_NHAN' : 'DA_DONG';
};

export const ngayHienTaiVietNam = (ngay = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ngay);
  const phan = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${phan.year}-${phan.month}-${phan.day}`;
};

export const nhanTrangThaiDotTuyenSinh = (
  muc: ChuongTrinhTuVanDoiTac,
  homNay = ngayHienTaiVietNam(),
): string => {
  const trangThai = trangThaiDotTuyenSinh(muc, homNay);
  if (trangThai === 'SAP_MO' && muc.dotTuyenSinh.ngayMoHoSo) {
    return `Mở ${ngayThangNam(muc.dotTuyenSinh.ngayMoHoSo)}`;
  }
  if (trangThai === 'DANG_NHAN' && muc.dotTuyenSinh.hanHoSo) {
    return `Đang nhận đến ${ngayThangNam(muc.dotTuyenSinh.hanHoSo)}`;
  }
  if (trangThai === 'DA_DONG' && muc.dotTuyenSinh.hanHoSo) {
    return `Đã hết hạn ${ngayThangNam(muc.dotTuyenSinh.hanHoSo)}`;
  }
  return 'Chưa có đợt mới';
};

function ngayThangNam(ngay: string): string {
  const [nam, thang, ngayTrongThang] = ngay.split('-');
  return `${ngayTrongThang}/${thang}/${nam}`;
}

export type DanhMucSale = ChuongTrinh | SanPhamTuVan | ChuongTrinhTuVanDoiTac;

export function laChuongTrinhVanHanh(muc: DanhMucSale): muc is ChuongTrinh {
  return 'hocPhiKy' in muc && 'tyLeTrichPpm' in muc;
}

export function laSanPhamTuVanPhoenix(muc: DanhMucSale): muc is SanPhamTuVan {
  return 'nhom' in muc;
}

export function laChuongTrinhTuVanDoiTac(muc: DanhMucSale): muc is ChuongTrinhTuVanDoiTac {
  return !laChuongTrinhVanHanh(muc) && !laSanPhamTuVanPhoenix(muc);
}

export function ghepDanhMucSale(chuongTrinh: readonly ChuongTrinh[]): readonly DanhMucSale[] {
  const vanHanh = chuongTrinh.filter((ct) => !/\[điền tên thật\]/i.test(ct.truongTen));
  const maVanHanh = new Set(vanHanh.map((ct) => ct.ma));
  const tuVan = DANH_MUC_TU_VAN_PHOENIX.filter(
    (sp) =>
      !maVanHanh.has(sp.ma) &&
      !(sp.ma === 'PHX-CC-PHUN_THEU' && maVanHanh.has(MA_NGAN_HAN_DANG_VAN_HANH)),
  );
  return [...vanHanh, ...DANH_MUC_TU_VAN_DOI_TAC, ...tuVan];
}

export function timDanhMucSale(
  ma: string,
  chuongTrinh: readonly ChuongTrinh[] = CHUONG_TRINH,
): DanhMucSale | undefined {
  return ghepDanhMucSale(chuongTrinh).find((muc) => muc.ma === ma);
}

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

const laTrungCapPhoenixKhongSucKhoe = (ct: ChuongTrinh): boolean =>
  ct.truongPhoenix && ct.he === 'TC' && !ct.nganhSucKhoe;

export function trinhDoDauVaoHienThi(ct: ChuongTrinh): string {
  if (laTrungCapPhoenixKhongSucKhoe(ct)) return 'THCS / THPT';
  return ct.tuTrinhDo === 'THPT' ? 'THPT' : tenHe(ct.tuTrinhDo);
}

export function dieuKienCua(ct: ChuongTrinh): readonly string[] {
  if (ct.he === 'NH') return DIEU_KIEN_NGAN_HAN;
  if (laTrungCapPhoenixKhongSucKhoe(ct)) {
    return [
      'Phoenix tuyển trung cấp từ người đã tốt nghiệp THCS, THPT hoặc tương đương.',
      'Ngành không thuộc lĩnh vực sức khỏe; xác nhận lại ngành và đợt tuyển sinh trước khi tư vấn.',
    ];
  }
  if (ct.tuTrinhDo === 'THPT') return DIEU_KIEN_MAC_DINH;
  return DIEU_KIEN[`${ct.he}<-${ct.tuTrinhDo}`] ?? DIEU_KIEN_MAC_DINH;
}

export function hoSoCanNop(ct: ChuongTrinh): readonly string[] {
  if (ct.ma === MA_NGAN_HAN_DANG_VAN_HANH) return HO_SO_NGAN_HAN;
  if (ct.truongPhoenix && ct.he === 'TC') return HO_SO_PHOENIX_TRUNG_CAP;
  return ct.nganhSucKhoe ? [...HO_SO_CHUNG, ...HO_SO_SUC_KHOE] : HO_SO_CHUNG;
}

export const hoaHongCanXacNhan = (ct: ChuongTrinh): boolean => ct.ma === MA_NGAN_HAN_DANG_VAN_HANH;
