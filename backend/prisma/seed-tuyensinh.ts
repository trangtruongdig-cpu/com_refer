/**
 * Seed nghiệp vụ tuyển sinh: cây tổ chức, nhân sự kèm tài khoản đăng nhập,
 * danh mục chương trình và TOÀN BỘ BẢNG THAM SỐ có hiệu lực theo thời gian.
 *
 * Nguồn số: LOGIC.md. Bốn chương trình `daDoiChieu` đã đối chiếu tay — đừng sửa
 * số của chúng mà không sửa kiểm thử. Các chương trình còn lại là DỮ LIỆU MẪU,
 * phải nhập số thật theo hợp đồng trước khi dùng để trả tiền (giả định §15.8).
 *
 * Chạy lại được nhiều lần: mọi bảng dùng `upsert` theo khoá nghiệp vụ. Bảng
 * tham số KHÔNG XOÁ bản cũ — đó là lý do khoá là `(ma, hieu_luc_tu)`.
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Mật khẩu dev cho các tài khoản nhân sự. Production phải đổi ngay. */
const MAT_KHAU_DEV = process.env.SEED_NHAN_SU_PASSWORD ?? 'Phoenix@123456';

const d = (s: string): Date => new Date(`${s}T00:00:00.000Z`);

// ---------------------------------------------------------------------------
//  1. Cây tổ chức ĐÚNG BA CẤP (LOGIC.md §4)
// ---------------------------------------------------------------------------
const DON_VI = [
  { ma: 'PKD', ten: 'Phòng Kinh doanh', cap: 'PHONG' as const, chaMa: null },
  { ma: 'BGH', ten: 'Ban Giám hiệu', cap: 'PHONG' as const, chaMa: null },
  { ma: 'NHOM_A', ten: 'Nhóm A', cap: 'NHOM' as const, chaMa: 'PKD' },
  { ma: 'NHOM_B', ten: 'Nhóm B', cap: 'NHOM' as const, chaMa: 'PKD' },
];

/** Vai trò nghiệp vụ NV/TN ở Nhóm, TP/ADMIN ở Phòng — trigger soát lại việc này. */
const NHAN_SU = [
  { ma: 'NV01', hoTen: 'Nguyễn Thị Hương', vaiTro: 'NV' as const, donViMa: 'NHOM_A' },
  { ma: 'NV02', hoTen: 'Trần Văn Khánh', vaiTro: 'NV' as const, donViMa: 'NHOM_A' },
  { ma: 'NV03', hoTen: 'Lê Minh Anh', vaiTro: 'NV' as const, donViMa: 'NHOM_B' },
  { ma: 'TN01', hoTen: 'Phạm Quốc Dũng', vaiTro: 'TN' as const, donViMa: 'NHOM_A' },
  { ma: 'TN02', hoTen: 'Hoàng Thị Thu', vaiTro: 'TN' as const, donViMa: 'NHOM_B' },
  { ma: 'TP01', hoTen: 'Vũ Hải Yến', vaiTro: 'TP' as const, donViMa: 'PKD' },
  { ma: 'AD01', hoTen: 'Quản trị Trường', vaiTro: 'ADMIN' as const, donViMa: 'BGH' },
];

// ---------------------------------------------------------------------------
//  2. Mạng lưới liên kết. Chỉ DHCNVT là trường thật.
// ---------------------------------------------------------------------------
const TRUONG = [
  { ma: 'DHCNVT', ten: 'Đại học Công nghiệp Việt Trì', laPhoenix: false, treThang: 5 },
  { ma: 'DH-DT02', ten: 'Trường Đại học đối tác 02 [điền tên thật]', laPhoenix: false, treThang: 6 },
  { ma: 'CD-DT01', ten: 'Trường Cao đẳng đối tác 01 [điền tên thật]', laPhoenix: false, treThang: 5 },
  { ma: 'PHOENIX', ten: 'Trường Trung cấp Quốc tế Phoenix', laPhoenix: true, treThang: 0 },
];

type MaHe = 'NH' | 'SC' | 'TC' | 'CD' | 'DH';
type TrinhDoVao = 'THPT' | MaHe;

interface SeedChuongTrinh {
  ma: string;
  truongMa: string;
  he: MaHe;
  maNganh: string;
  tenNganh: string;
  tuTrinhDo: TrinhDoVao;
  thoiLuongThang: number;
  soKy: number;
  hocPhiKy: number;
  tyLeTrichPpm: number;
  thuePpm: number;
  dinhMucKy: number;
  nganhSucKhoe: boolean;
  daDoiChieu?: boolean;
}

const CHUONG_TRINH: SeedChuongTrinh[] = [
  // Hệ liên kết đại học: học phí 11tr/kỳ, trích 30%, định mức 500k ⇒ quỹ chi 2,8tr
  { ma: 'DHCNVT-NNA', truongMa: 'DHCNVT', he: 'DH', maNganh: 'NNA', tenNganh: 'Ngôn ngữ Anh', tuTrinhDo: 'CD', thoiLuongThang: 18, soKy: 4, hocPhiKy: 11_000_000, tyLeTrichPpm: 300_000, thuePpm: 0, dinhMucKy: 500_000, nganhSucKhoe: false, daDoiChieu: true },
  { ma: 'DHCNVT-QTKD', truongMa: 'DHCNVT', he: 'DH', maNganh: 'QTKD', tenNganh: 'Quản trị kinh doanh', tuTrinhDo: 'CD', thoiLuongThang: 18, soKy: 4, hocPhiKy: 11_000_000, tyLeTrichPpm: 300_000, thuePpm: 0, dinhMucKy: 500_000, nganhSucKhoe: false },
  { ma: 'DHCNVT-CNTT', truongMa: 'DHCNVT', he: 'DH', maNganh: 'CNTT', tenNganh: 'Công nghệ thông tin', tuTrinhDo: 'CD', thoiLuongThang: 18, soKy: 4, hocPhiKy: 11_000_000, tyLeTrichPpm: 300_000, thuePpm: 0, dinhMucKy: 500_000, nganhSucKhoe: false },
  { ma: 'DHCNVT-KETOAN', truongMa: 'DHCNVT', he: 'DH', maNganh: 'KETOAN', tenNganh: 'Kế toán', tuTrinhDo: 'CD', thoiLuongThang: 18, soKy: 4, hocPhiKy: 11_000_000, tyLeTrichPpm: 300_000, thuePpm: 0, dinhMucKy: 500_000, nganhSucKhoe: false },
  { ma: 'DHCNVT-CNTP', truongMa: 'DHCNVT', he: 'DH', maNganh: 'CNTP', tenNganh: 'Công nghệ thực phẩm', tuTrinhDo: 'TC', thoiLuongThang: 30, soKy: 6, hocPhiKy: 11_000_000, tyLeTrichPpm: 300_000, thuePpm: 0, dinhMucKy: 500_000, nganhSucKhoe: false },
  { ma: 'DH-DT02-LUAT', truongMa: 'DH-DT02', he: 'DH', maNganh: 'LUAT', tenNganh: 'Luật', tuTrinhDo: 'CD', thoiLuongThang: 24, soKy: 4, hocPhiKy: 10_000_000, tyLeTrichPpm: 250_000, thuePpm: 0, dinhMucKy: 450_000, nganhSucKhoe: false },
  { ma: 'DH-DT02-GDMN', truongMa: 'DH-DT02', he: 'DH', maNganh: 'GDMN', tenNganh: 'Giáo dục mầm non', tuTrinhDo: 'CD', thoiLuongThang: 24, soKy: 4, hocPhiKy: 10_000_000, tyLeTrichPpm: 250_000, thuePpm: 0, dinhMucKy: 450_000, nganhSucKhoe: false, daDoiChieu: true },
  { ma: 'CD-DT01-DD', truongMa: 'CD-DT01', he: 'CD', maNganh: 'DD', tenNganh: 'Điều dưỡng', tuTrinhDo: 'TC', thoiLuongThang: 18, soKy: 3, hocPhiKy: 9_000_000, tyLeTrichPpm: 300_000, thuePpm: 0, dinhMucKy: 400_000, nganhSucKhoe: true },
  { ma: 'CD-DT01-DUOC', truongMa: 'CD-DT01', he: 'CD', maNganh: 'DUOC', tenNganh: 'Dược', tuTrinhDo: 'TC', thoiLuongThang: 18, soKy: 3, hocPhiKy: 9_000_000, tyLeTrichPpm: 300_000, thuePpm: 0, dinhMucKy: 400_000, nganhSucKhoe: true },
  // Sản phẩm của chính Phoenix: trích 100%, định mức giữ lại lớn hơn
  { ma: 'TC-DD', truongMa: 'PHOENIX', he: 'TC', maNganh: 'DD', tenNganh: 'Điều dưỡng', tuTrinhDo: 'THPT', thoiLuongThang: 24, soKy: 4, hocPhiKy: 7_000_000, tyLeTrichPpm: 1_000_000, thuePpm: 0, dinhMucKy: 5_750_000, nganhSucKhoe: true, daDoiChieu: true },
  { ma: 'TC-YHCT', truongMa: 'PHOENIX', he: 'TC', maNganh: 'YHCT', tenNganh: 'Y học cổ truyền', tuTrinhDo: 'THPT', thoiLuongThang: 24, soKy: 4, hocPhiKy: 7_000_000, tyLeTrichPpm: 1_000_000, thuePpm: 0, dinhMucKy: 5_750_000, nganhSucKhoe: true },
  { ma: 'TC-CSSD', truongMa: 'PHOENIX', he: 'TC', maNganh: 'CSSD', tenNganh: 'Chăm sóc sắc đẹp', tuTrinhDo: 'THPT', thoiLuongThang: 24, soKy: 4, hocPhiKy: 7_000_000, tyLeTrichPpm: 1_000_000, thuePpm: 0, dinhMucKy: 5_750_000, nganhSucKhoe: false },
  { ma: 'NH-CSSD-PTTM', truongMa: 'PHOENIX', he: 'NH', maNganh: 'CSSD-PTTM', tenNganh: 'Phun thêu thẩm mỹ', tuTrinhDo: 'THPT', thoiLuongThang: 3, soKy: 1, hocPhiKy: 2_000_000, tyLeTrichPpm: 1_000_000, thuePpm: 0, dinhMucKy: 1_200_000, nganhSucKhoe: false, daDoiChieu: true },
];

// ---------------------------------------------------------------------------
//  3. Tham số — hiệu lực theo thời gian, bản cũ không xoá (LOGIC.md §10)
// ---------------------------------------------------------------------------
const CO_CAU = [
  { ma: 'KHOAN_MANG_LUOI', ten: 'Khoản mạng lưới', ppm: 600_000, theoHoaDon: false },
  { ma: 'THU_LAO_TP', ten: 'Thù lao trưởng phòng', ppm: 104_000, theoHoaDon: false },
  { ma: 'THU_LAO_TN', ten: 'Thù lao trưởng nhóm', ppm: 96_000, theoHoaDon: false },
  { ma: 'DOI_NGOAI', ten: 'Đối ngoại', ppm: 50_000, theoHoaDon: true },
  { ma: 'MARKETING', ten: 'Marketing', ppm: 50_000, theoHoaDon: true },
  { ma: 'QUANG_CAO', ten: 'Quảng cáo', ppm: 50_000, theoHoaDon: true },
  { ma: 'SU_KIEN', ten: 'Sự kiện', ppm: 50_000, theoHoaDon: true },
];

/** Trọng số lưu bằng ppm, tổng đúng 1.000.000 — trigger soát lại. */
const DAU_VIEC = [
  { ma: 'T01', ten: 'Tạo nguồn, tiếp cận phụ huynh – học sinh', trongSoPpm: 120_000 },
  { ma: 'T02', ten: 'Tư vấn trực tiếp, giải đáp, định hướng ngành', trongSoPpm: 150_000 },
  { ma: 'T03', ten: 'Đối ngoại cơ sở: làm việc với trường phổ thông', trongSoPpm: 100_000 },
  { ma: 'T04', ten: 'Tổ chức buổi tư vấn, sự kiện tại địa bàn', trongSoPpm: 100_000 },
  { ma: 'T05', ten: 'Quảng cáo tại địa phương', trongSoPpm: 80_000 },
  { ma: 'T06', ten: 'Nội dung, hình ảnh, kênh online địa phương', trongSoPpm: 80_000 },
  { ma: 'T07', ten: 'Hướng dẫn và kiểm tra hồ sơ đầu vào', trongSoPpm: 100_000 },
  { ma: 'T08', ten: 'Hướng dẫn nộp học phí vào Trường, theo dõi thu', trongSoPpm: 70_000 },
  { ma: 'T09', ten: 'Chốt hồ sơ nhập học', trongSoPpm: 100_000 },
  { ma: 'T10', ten: 'Chăm sóc 30 ngày đầu, giữ học viên', trongSoPpm: 60_000 },
  { ma: 'T11', ten: 'Điều hành địa bàn, báo cáo, đối soát', trongSoPpm: 40_000 },
];

/** Hai phiên bản biểu lương mềm song song — bản cũ giữ lại để tính lại kỳ cũ. */
const BIEU_LUONG_MEM = [
  {
    ma: 'LUONG_MEM_CB',
    ten: 'Lương mềm cán bộ tuyển sinh — hiệu chỉnh liên kết',
    hieuLucTu: '2026-07-01',
    hieuLucDen: null,
    ghiChu: '',
    bac: [
      [16_000_000, 16_000], [25_000_000, 28_000], [35_000_000, 36_000], [50_000_000, 40_000],
      [70_000_000, 45_000], [100_000_000, 50_000], [140_000_000, 56_000], [200_000_000, 62_000],
    ] as [number, number][],
  },
  {
    ma: 'LUONG_MEM_CB',
    ten: 'Lương mềm cán bộ tuyển sinh — bản Sapo 2015',
    hieuLucTu: '2026-01-01',
    hieuLucDen: '2026-07-01',
    ghiChu:
      'LOGIC.md §6 chỉ ghi lại ba bậc đầu của bản gốc. Nạp đủ bậc trước khi ' +
      'tính kỳ thuộc khoảng này — đừng tính kỳ cũ bằng bản rút gọn.',
    bac: [[16_000_000, 56_000], [25_000_000, 100_000], [35_000_000, 130_000]] as [number, number][],
  },
];

const THUONG_NGUONG: [number, number][] = [
  [25_000_000, 150_000], [35_000_000, 300_000], [50_000_000, 400_000], [70_000_000, 800_000],
  [100_000_000, 1_000_000], [140_000_000, 1_400_000], [200_000_000, 2_000_000],
];

type VaiTroQT = 'NV' | 'TN' | 'TP' | 'CTV';
interface SeedQuyTac {
  ma: string;
  vaiTro: VaiTroQT;
  phamViNganh?: string;
  phamViTruong?: string;
  phamViHe?: MaHe;
  coSo: 'QUY_CHI' | 'HOC_PHI' | 'KHONG';
  loaiGiaTri: 'TY_LE' | 'SO_TIEN';
  cachXacDinh: 'CO_DINH' | 'LUY_TIEN_THEO_TIEN' | 'BAC_THEO_SO_LUONG';
  giaTriPpm?: number;
  soTien?: number;
  tranPpm?: number | null;
  hieuLucTu: string;
  ghiChu?: string;
  bac?: { loai: 'SO_LUONG' | 'TIEN'; nguongTu: number; ppm: number }[];
}

/** Cụ thể thắng rộng: ngành → trường → hệ → mặc định (LOGIC.md §7). */
const QUY_TAC: SeedQuyTac[] = [
  { ma: 'NV-DHCNVT-NNA', vaiTro: 'NV', phamViNganh: 'DHCNVT-NNA', coSo: 'KHONG', loaiGiaTri: 'SO_TIEN', cachXacDinh: 'CO_DINH', soTien: 1_500_000, tranPpm: 600_000, hieuLucTu: '2026-07-01', ghiChu: 'Ngành này trả số tiền cố định thay vì 60% quỹ chi.' },
  { ma: 'NV-DH-DT02', vaiTro: 'NV', phamViTruong: 'DH-DT02', coSo: 'HOC_PHI', loaiGiaTri: 'TY_LE', cachXacDinh: 'CO_DINH', giaTriPpm: 80_000, tranPpm: 600_000, hieuLucTu: '2026-07-01', ghiChu: '8% HỌC PHÍ MỘT KỲ — không phải học phí toàn khoá. Trần 60% quỹ chi chặn lại.' },
  { ma: 'NV-HE-DH', vaiTro: 'NV', phamViHe: 'DH', coSo: 'QUY_CHI', loaiGiaTri: 'TY_LE', cachXacDinh: 'BAC_THEO_SO_LUONG', tranPpm: 600_000, hieuLucTu: '2026-07-01',
    bac: [
      { loai: 'SO_LUONG', nguongTu: 0, ppm: 480_000 },
      { loai: 'SO_LUONG', nguongTu: 3, ppm: 520_000 },
      { loai: 'SO_LUONG', nguongTu: 6, ppm: 560_000 },
      { loai: 'SO_LUONG', nguongTu: 11, ppm: 600_000 },
    ] },
  { ma: 'NV-MAC-DINH', vaiTro: 'NV', coSo: 'QUY_CHI', loaiGiaTri: 'TY_LE', cachXacDinh: 'CO_DINH', giaTriPpm: 600_000, tranPpm: null, hieuLucTu: '2026-07-01' },
  { ma: 'TN-MAC-DINH', vaiTro: 'TN', coSo: 'QUY_CHI', loaiGiaTri: 'TY_LE', cachXacDinh: 'CO_DINH', giaTriPpm: 96_000, tranPpm: null, hieuLucTu: '2026-01-01', ghiChu: 'Chỉ trên học viên của nhân sự mình phụ trách — không theo số người.' },
  { ma: 'TP-MAC-DINH', vaiTro: 'TP', coSo: 'QUY_CHI', loaiGiaTri: 'TY_LE', cachXacDinh: 'CO_DINH', giaTriPpm: 104_000, tranPpm: null, hieuLucTu: '2026-01-01', ghiChu: 'Chỉ trên học viên của các nhóm mình phụ trách.' },
  { ma: 'CTV-HE-DH', vaiTro: 'CTV', phamViHe: 'DH', coSo: 'HOC_PHI', loaiGiaTri: 'TY_LE', cachXacDinh: 'LUY_TIEN_THEO_TIEN', tranPpm: 600_000, hieuLucTu: '2026-07-01',
    ghiChu: 'GIẢ ĐỊNH: LOGIC.md chỉ ghi dải tỷ lệ 5%→6%→7%→8%, không ghi ngưỡng. Ngưỡng ở đây là tạm, phải thay bằng số trong hợp đồng cộng tác viên (§15.9).',
    bac: [
      { loai: 'TIEN', nguongTu: 0, ppm: 50_000 },
      { loai: 'TIEN', nguongTu: 25_000_000, ppm: 60_000 },
      { loai: 'TIEN', nguongTu: 50_000_000, ppm: 70_000 },
      { loai: 'TIEN', nguongTu: 100_000_000, ppm: 80_000 },
    ] },
];

/** LOGIC.md §15 — đọc trước khi tin con số nào. */
const GIA_DINH = [
  { so: 1, thamSo: 'Thuế trên phần đối tác trích về', dangDung: '0', trangThai: 'Cần kế toán xác nhận: doanh thu dịch vụ hay hoạt động giáo dục' },
  { so: 2, thamSo: 'Định mức Trường giữ lại mỗi kỳ', dangDung: '500.000đ (hệ liên kết)', trangThai: 'Giả định' },
  { so: 3, thamSo: 'Độ trễ đối soát', dangDung: '5–6 tháng', trangThai: 'Giả định, cần đối chiếu từng hợp đồng' },
  { so: 4, thamSo: 'Chỉ tiêu được ứng của thử việc', dangDung: '3 hồ sơ', trangThai: 'Nên hạ xuống 2 — xem LOGIC.md §8.4' },
  { so: 5, thamSo: 'Mức sàn ứng trước', dangDung: '5.000.000đ', trangThai: 'Cần Hiệu trưởng duyệt' },
  { so: 6, thamSo: 'Vốn lưu động mỗi cán bộ', dangDung: '25.000.000đ', trangThai: 'Điều kiện bắt buộc, cần xác nhận nguồn' },
  { so: 7, thamSo: 'Hoàn ứng khi nghỉ việc giữa chừng', dangDung: 'chưa có', trangThai: 'Rủi ro hở — xem LOGIC.md §8.6' },
  { so: 8, thamSo: 'Học phí và tỷ lệ trích từng ngành', dangDung: 'dữ liệu mẫu', trangThai: 'Phải nhập số thật theo hợp đồng' },
  { so: 9, thamSo: 'Ngưỡng tiền của quy tắc cộng tác viên', dangDung: '0 / 25 / 50 / 100 triệu', trangThai: 'Giả định của bản dựng này — LOGIC.md chỉ ghi dải tỷ lệ' },
];

export async function seedTuyenSinh(): Promise<void> {
  // --- Cây tổ chức: Phòng trước, Nhóm sau (Nhóm cần cha đã tồn tại) ---
  const donViId = new Map<string, string>();
  // Phòng phải tạo trước Nhóm: Nhóm cần cha đã tồn tại
  const thuTuCap = (cap: 'PHONG' | 'NHOM'): number => (cap === 'PHONG' ? 0 : 1);
  for (const dv of [...DON_VI].sort((a, b) => thuTuCap(a.cap) - thuTuCap(b.cap))) {
    const row = await prisma.donVi.upsert({
      where: { ma: dv.ma },
      update: { ten: dv.ten, cap: dv.cap, chaId: dv.chaMa ? donViId.get(dv.chaMa) : null },
      create: { ma: dv.ma, ten: dv.ten, cap: dv.cap, chaId: dv.chaMa ? donViId.get(dv.chaMa) : null },
    });
    donViId.set(dv.ma, row.id);
  }

  // --- Nhân sự + tài khoản đăng nhập riêng cho từng người ---
  const matKhauBam = await bcrypt.hash(MAT_KHAU_DEV, 12);
  const nhanSuId = new Map<string, string>();
  for (const ns of NHAN_SU) {
    const email = `${ns.ma.toLowerCase()}@phoenix.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: ns.hoTen },
      // ADMIN của hệ thống chỉ gắn với vai trò nghiệp vụ ADMIN; còn lại là USER
      create: { email, name: ns.hoTen, password: matKhauBam, role: ns.vaiTro === 'ADMIN' ? 'ADMIN' : 'USER' },
    });
    const row = await prisma.nhanSu.upsert({
      where: { ma: ns.ma },
      update: { hoTen: ns.hoTen, vaiTro: ns.vaiTro, donViId: donViId.get(ns.donViMa)!, userId: user.id },
      create: { ma: ns.ma, hoTen: ns.hoTen, vaiTro: ns.vaiTro, donViId: donViId.get(ns.donViMa)!, userId: user.id },
    });
    nhanSuId.set(ns.ma, row.id);
  }

  // --- Mạng lưới và danh mục chương trình ---
  const truongId = new Map<string, string>();
  for (const t of TRUONG) {
    const row = await prisma.truong.upsert({ where: { ma: t.ma }, update: t, create: t });
    truongId.set(t.ma, row.id);
  }

  for (const ct of CHUONG_TRINH) {
    const data = {
      truongId: truongId.get(ct.truongMa)!,
      he: ct.he,
      maNganh: ct.maNganh,
      tenNganh: ct.tenNganh,
      tuTrinhDo: ct.tuTrinhDo,
      thoiLuongThang: ct.thoiLuongThang,
      soKy: ct.soKy,
      hocPhiKy: BigInt(ct.hocPhiKy),
      tyLeTrichPpm: ct.tyLeTrichPpm,
      thuePpm: ct.thuePpm,
      dinhMucKy: BigInt(ct.dinhMucKy),
      nganhSucKhoe: ct.nganhSucKhoe,
      daDoiChieu: ct.daDoiChieu ?? false,
    } satisfies Omit<Prisma.ChuongTrinhUncheckedCreateInput, 'ma'>;
    await prisma.chuongTrinh.upsert({ where: { ma: ct.ma }, update: data, create: { ma: ct.ma, ...data } });
  }

  // --- Tài khoản nhận học phí. SỐ NÀY LÀ SỐ GIẢ, Trường tự khai số thật. ---
  const soTaiKhoanDemo = '0000001234567';
  const tkDemo = await prisma.taiKhoan.findFirst({ where: { soTaiKhoan: soTaiKhoanDemo } });
  if (!tkDemo) {
    await prisma.taiKhoan.create({
      data: {
        tenChu: 'TRUONG TRUNG CAP QUOC TE PHOENIX (DEMO)',
        tenNganHang: 'Ngân hàng demo — thay bằng tài khoản thật của Trường',
        bin: '970415',
        soTaiKhoan: soTaiKhoanDemo,
      },
    });
  }

  // --- Cơ cấu quỹ chi: bảy khoản trong MỘT giao dịch, trigger soát ở cuối ---
  await prisma.$transaction(
    CO_CAU.map((k) =>
      prisma.coCauQuyChi.upsert({
        where: { ma_hieuLucTu: { ma: k.ma, hieuLucTu: d('2026-01-01') } },
        update: { ten: k.ten, ppm: k.ppm, theoHoaDon: k.theoHoaDon },
        create: { ...k, hieuLucTu: d('2026-01-01') },
      }),
    ),
  );

  await prisma.$transaction(
    DAU_VIEC.map((dv) =>
      prisma.dauViec.upsert({
        where: { ma_hieuLucTu: { ma: dv.ma, hieuLucTu: d('2026-01-01') } },
        update: { ten: dv.ten, trongSoPpm: dv.trongSoPpm },
        create: { ...dv, hieuLucTu: d('2026-01-01') },
      }),
    ),
  );

  // --- Biểu lũy tiến: bậc thay hẳn mỗi lần ban hành, nên xoá bậc cũ của ĐÚNG
  //     phiên bản đó rồi nạp lại; hai phiên bản khác mốc không ảnh hưởng nhau.
  for (const b of BIEU_LUONG_MEM) {
    const bieu = await prisma.bieuLuyTien.upsert({
      where: { ma_hieuLucTu: { ma: b.ma, hieuLucTu: d(b.hieuLucTu) } },
      update: { ten: b.ten, hieuLucDen: b.hieuLucDen ? d(b.hieuLucDen) : null, ghiChu: b.ghiChu },
      create: {
        ma: b.ma,
        ten: b.ten,
        hieuLucTu: d(b.hieuLucTu),
        hieuLucDen: b.hieuLucDen ? d(b.hieuLucDen) : null,
        ghiChu: b.ghiChu,
      },
    });
    await prisma.bieuLuyTienBac.deleteMany({ where: { bieuId: bieu.id } });
    await prisma.bieuLuyTienBac.createMany({
      data: b.bac.map(([nguongTu, ppm]) => ({ bieuId: bieu.id, nguongTu: BigInt(nguongTu), ppm })),
    });
  }

  for (const [nguongTu, soTien] of THUONG_NGUONG) {
    await prisma.thuongNguong.upsert({
      where: { ma_hieuLucTu_nguongTu: { ma: 'THUONG_NGUONG', hieuLucTu: d('2026-01-01'), nguongTu: BigInt(nguongTu) } },
      update: { soTien: BigInt(soTien) },
      create: { ma: 'THUONG_NGUONG', hieuLucTu: d('2026-01-01'), nguongTu: BigInt(nguongTu), soTien: BigInt(soTien) },
    });
  }

  for (const qt of QUY_TAC) {
    const data = {
      vaiTro: qt.vaiTro,
      phamViNganh: qt.phamViNganh ?? null,
      phamViTruong: qt.phamViTruong ?? null,
      phamViHe: qt.phamViHe ?? null,
      coSo: qt.coSo,
      loaiGiaTri: qt.loaiGiaTri,
      cachXacDinh: qt.cachXacDinh,
      giaTriPpm: qt.giaTriPpm ?? null,
      soTien: qt.soTien === undefined ? null : BigInt(qt.soTien),
      tranPpm: qt.tranPpm ?? null,
      ghiChu: qt.ghiChu ?? '',
    };
    const row = await prisma.quyTacTinhTien.upsert({
      where: { ma_hieuLucTu: { ma: qt.ma, hieuLucTu: d(qt.hieuLucTu) } },
      update: data,
      create: { ma: qt.ma, hieuLucTu: d(qt.hieuLucTu), ...data },
    });
    await prisma.quyTacBac.deleteMany({ where: { quyTacId: row.id } });
    if (qt.bac?.length) {
      await prisma.quyTacBac.createMany({
        data: qt.bac.map((b) => ({ quyTacId: row.id, loai: b.loai, nguongTu: BigInt(b.nguongTu), ppm: b.ppm })),
      });
    }
  }

  await prisma.thamSoCoChe.upsert({
    where: { hieuLucTu: d('2026-07-01') },
    update: { mucSan: BigInt(5_000_000), chiTieuHoSo: 3 },
    create: { hieuLucTu: d('2026-07-01'), mucSan: BigInt(5_000_000), chiTieuHoSo: 3 },
  });

  for (const g of GIA_DINH) {
    await prisma.giaDinh.upsert({ where: { so: g.so }, update: g, create: g });
  }

  console.log(
    `✔ Tuyển sinh: ${DON_VI.length} đơn vị, ${NHAN_SU.length} nhân sự (có tài khoản đăng nhập), ` +
      `${TRUONG.length} trường, ${CHUONG_TRINH.length} chương trình, ${CO_CAU.length} khoản cơ cấu, ` +
      `${DAU_VIEC.length} đầu việc, ${QUY_TAC.length} quy tắc, ${GIA_DINH.length} giả định`,
  );
  console.log(`  Tài khoản nhân sự: nv01@phoenix.local … ad01@phoenix.local — mật khẩu ${MAT_KHAU_DEV}`);
}

if (process.argv[1]?.includes('seed-tuyensinh')) {
  seedTuyenSinh()
    .catch((e: unknown) => {
      console.error('❌ Seed tuyển sinh thất bại', e);
      process.exitCode = 1;
    })
    .finally(() => void prisma.$disconnect());
}
