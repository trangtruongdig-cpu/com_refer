/**
 * Quỹ chi — biến trung tâm của toàn bộ cơ chế. Xem LOGIC.md §2.3, §5.
 *
 *   quỹ chi một kỳ = học phí một kỳ × tỷ lệ trích − thuế − định mức giữ lại
 *
 * HOA HỒNG KHÔNG BAO GIỜ LÀ PHẦN TRĂM HỌC PHÍ. Mọi phép tính đi qua quỹ chi, và
 * mọi phép tính ở mức MỘT KỲ THU, không phải toàn khoá (lẫn hai cái sai gấp
 * đúng số kỳ).
 */
import { chiaLamTron, nhanTyLe, phanBo } from './tien';

export interface CauTrucHocPhi {
  /** Học phí một kỳ, đồng */
  readonly hocPhiKy: number;
  /** Tỷ lệ đối tác trích về Trường, phần triệu (30% = 300_000) */
  readonly tyLeTrichPpm: number;
  /** Thuế trên phần trích về, phần triệu. Đang là 0 — chờ kế toán xác nhận */
  readonly thuePpm: number;
  /** Định mức Trường giữ lại cho chi phí đào tạo, mỗi kỳ */
  readonly dinhMucKy: number;
  readonly soKy: number;
}

/** Quỹ chi chuẩn để tính PV — neo ở sản phẩm ngắn hạn (LOGIC.md §5.1). */
export const QUY_CHI_CHUAN = 800_000;

/** Tỷ lệ quỹ chi / học phí của hệ trung cấp: 1.250.000 / 7.000.000 — mốc 1,0. */
export const TY_LE_MOC = 1_250_000 / 7_000_000;

/** `5,6 = 7.000.000 / 1.250.000` — doanh số quy đổi = quỹ chi × 5,6. */
export const HE_SO_TRUNG_CAP = 7_000_000 / 1_250_000;

export function tienTrichMotKy(c: CauTrucHocPhi): number {
  return nhanTyLe(c.hocPhiKy, c.tyLeTrichPpm);
}

export function thueMotKy(c: CauTrucHocPhi): number {
  return nhanTyLe(tienTrichMotKy(c), c.thuePpm);
}

export function quyChiMotKy(c: CauTrucHocPhi): number {
  return tienTrichMotKy(c) - thueMotKy(c) - c.dinhMucKy;
}

/** Phần học phí nộp về đối tác (đối tác giữ lại). */
export function nopDoiTacMotKy(c: CauTrucHocPhi): number {
  return c.hocPhiKy - tienTrichMotKy(c);
}

/**
 * Bất biến bảo toàn: học phí phải chia hết, không thất thoát, không sinh thêm.
 * Ở cơ sở dữ liệu đây là `CHECK (hoc_phi = nop_doi_tac + thue + dinh_muc + quy_chi)`.
 */
export function kiemBaoToan(c: CauTrucHocPhi): boolean {
  return (
    nopDoiTacMotKy(c) + thueMotKy(c) + c.dinhMucKy + quyChiMotKy(c) === c.hocPhiKy &&
    quyChiMotKy(c) > 0
  );
}

/** PV — điểm quy đổi = quỹ chi một kỳ / 800.000. Đo giá trị kinh tế, không đo doanh thu. */
export function pv(c: CauTrucHocPhi): number {
  return quyChiMotKy(c) / QUY_CHI_CHUAN;
}

/** Hệ số quy đổi doanh số: đưa mọi hệ về thang học phí trung cấp. */
export function heSoQuyDoi(c: CauTrucHocPhi): number {
  return quyChiMotKy(c) / c.hocPhiKy / TY_LE_MOC;
}

/**
 * Doanh số quy đổi một kỳ = quỹ chi × 5,6. Tính bằng BigInt để không lệch đồng
 * lẻ: `2.800.000 × 5,6 = 15.680.000`.
 */
export function doanhSoQuyDoiMotKy(c: CauTrucHocPhi): number {
  return chiaLamTron(BigInt(quyChiMotKy(c)) * 56n, 10n);
}

export function hocPhiToanKhoa(c: CauTrucHocPhi): number {
  return c.hocPhiKy * c.soKy;
}

export interface KhoanCoCau {
  readonly ma: string;
  readonly ten: string;
  /** Tỷ trọng trong quỹ chi, phần triệu. Bảy khoản cộng đúng 1.000.000 */
  readonly ppm: number;
  /** Chi theo hoá đơn (có dự toán năm riêng), không chi theo đầu người */
  readonly theoHoaDon: boolean;
}

/**
 * Chia quỹ chi theo cơ cấu. Dùng `phanBo` nên tổng các khoản ĐÚNG BẰNG quỹ chi,
 * không thừa không thiếu một đồng.
 */
export function chiaCoCau(
  quyChi: number,
  coCau: readonly KhoanCoCau[],
): { khoan: KhoanCoCau; soTien: number }[] {
  const chia = phanBo(
    quyChi,
    coCau.map((k) => k.ppm),
  );
  return coCau.map((khoan, i) => ({ khoan, soTien: chia[i]! }));
}

export interface DauViec {
  readonly ma: string;
  readonly ten: string;
  /** Trọng số trong khoản mạng lưới, tổng đúng 1,00 */
  readonly trongSo: number;
}

/** Chia khoản mạng lưới 60% theo 11 đầu việc đã nghiệm thu (LOGIC.md §3.1). */
export function chiaDauViec(
  khoanMangLuoi: number,
  dauViec: readonly DauViec[],
): { dauViec: DauViec; soTien: number }[] {
  const chia = phanBo(
    khoanMangLuoi,
    dauViec.map((d) => d.trongSo),
  );
  return dauViec.map((dv, i) => ({ dauViec: dv, soTien: chia[i]! }));
}
