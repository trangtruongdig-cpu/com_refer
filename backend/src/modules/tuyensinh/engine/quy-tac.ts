/**
 * Quy tắc tính tiền khai ba chiều (LOGIC.md §7). Không hardcode cách tính.
 *
 *   lấy gì làm cơ sở · giá trị là gì · lấy giá trị ở đâu
 *
 * Phạm vi áp dụng theo thứ tự CỤ THỂ THẮNG RỘNG: ngành → trường → hệ → mặc định.
 * Trần của từng quy tắc là lớp chặn thứ hai, sau trần tổng của quỹ chi.
 */
import { luyTien, timBacDatDuoc, type BacRutGon } from './luy-tien';
import { nhanTyLe } from './tien';

export type VaiTro = 'NV' | 'TN' | 'TP' | 'CTV';
export type CoSo = 'QUY_CHI' | 'HOC_PHI' | 'KHONG';
export type LoaiGiaTri = 'TY_LE' | 'SO_TIEN';
export type CachXacDinh = 'CO_DINH' | 'LUY_TIEN_THEO_TIEN' | 'BAC_THEO_SO_LUONG';

export interface PhamVi {
  readonly nganh?: string;
  readonly truong?: string;
  readonly he?: string;
}

export interface QuyTac {
  readonly ma: string;
  readonly vaiTro: VaiTro;
  readonly phamVi: PhamVi;
  readonly coSo: CoSo;
  readonly loaiGiaTri: LoaiGiaTri;
  readonly cachXacDinh: CachXacDinh;
  /** CO_DINH + TY_LE: tỷ lệ phần triệu */
  readonly giaTriPpm?: number;
  /** CO_DINH + SO_TIEN: số tiền tuyệt đối một kỳ */
  readonly soTien?: number;
  /** BAC_THEO_SO_LUONG: `[số hồ sơ tối thiểu, ppm]` */
  readonly bacSoLuong?: readonly (readonly [number, number])[];
  /** LUY_TIEN_THEO_TIEN: `[ngưỡng tiền, ppm]` */
  readonly bacTien?: readonly BacRutGon[];
  /** Trần của quy tắc, phần triệu trên quỹ chi. `null` = không trần */
  readonly tranPpm?: number | null;
  readonly hieuLucTu: string;
  readonly hieuLucDen?: string | null;
  readonly ghiChu?: string;
}

export interface BoiCanh {
  readonly quyChiKy: number;
  readonly hocPhiKy: number;
  /** Số hồ sơ mới trong tháng — dùng cho BAC_THEO_SO_LUONG */
  readonly soHoSoThang: number;
  /** Doanh số quy đổi trong tháng — dùng cho LUY_TIEN_THEO_TIEN */
  readonly doanhSoQuyDoi: number;
}

export interface KetQuaQuyTac {
  readonly quyTac: QuyTac;
  /** Số tiền trước khi áp trần */
  readonly mucTruocTran: number;
  /** Số tiền thực trả sau khi áp trần */
  readonly soTien: number;
  readonly tran: number | null;
  /** `true` khi trần đã cắt — người điều hành phải sửa chính sách, không để lệch âm thầm */
  readonly biChan: boolean;
}

const conHieuLuc = (qt: QuyTac, ngay: string): boolean =>
  qt.hieuLucTu <= ngay && (qt.hieuLucDen == null || qt.hieuLucDen > ngay);

/** Độ cụ thể của phạm vi: ngành 3 > trường 2 > hệ 1 > mặc định 0. */
function doCuThe(p: PhamVi): number {
  if (p.nganh) return 3;
  if (p.truong) return 2;
  if (p.he) return 1;
  return 0;
}

function khopPhamVi(p: PhamVi, dich: { nganh: string; truong: string; he: string }): boolean {
  if (p.nganh && p.nganh !== dich.nganh) return false;
  if (p.truong && p.truong !== dich.truong) return false;
  if (p.he && p.he !== dich.he) return false;
  return true;
}

/** Chọn quy tắc áp dụng: cùng vai trò, còn hiệu lực, phạm vi khớp và cụ thể nhất. */
export function chonQuyTac(
  dsQuyTac: readonly QuyTac[],
  dich: { vaiTro: VaiTro; nganh: string; truong: string; he: string; ngay: string },
): QuyTac | null {
  const hopLe = dsQuyTac
    .filter((qt) => qt.vaiTro === dich.vaiTro && conHieuLuc(qt, dich.ngay))
    .filter((qt) => khopPhamVi(qt.phamVi, dich))
    .sort((a, b) => doCuThe(b.phamVi) - doCuThe(a.phamVi));
  return hopLe[0] ?? null;
}

/** Tính số tiền của một quy tắc trên MỘT KỲ THU. */
export function tinhTheoQuyTac(qt: QuyTac, bc: BoiCanh): KetQuaQuyTac {
  const coSo = qt.coSo === 'QUY_CHI' ? bc.quyChiKy : qt.coSo === 'HOC_PHI' ? bc.hocPhiKy : 0;

  let mucTruocTran = 0;
  if (qt.loaiGiaTri === 'SO_TIEN') {
    // Số tiền tuyệt đối: chỉ CO_DINH mới có nghĩa
    mucTruocTran = qt.soTien ?? 0;
  } else if (qt.cachXacDinh === 'CO_DINH') {
    mucTruocTran = nhanTyLe(coSo, qt.giaTriPpm ?? 0);
  } else if (qt.cachXacDinh === 'BAC_THEO_SO_LUONG') {
    const bac = qt.bacSoLuong ?? [];
    const i = timBacDatDuoc(bac, bc.soHoSoThang);
    const ppm = i < 0 ? 0 : [...bac].sort((a, b) => a[0] - b[0])[i]![1];
    mucTruocTran = nhanTyLe(coSo, ppm);
  } else {
    // LUY_TIEN_THEO_TIEN: tỷ lệ của bậc tiền đã đạt, áp trên cơ sở của kỳ này.
    // Không phải lũy tiến biên — lũy tiến biên là biểu lương mềm, hàm luyTien().
    const bac = qt.bacTien ?? [];
    const i = timBacDatDuoc(bac, bc.doanhSoQuyDoi);
    const docBac = [...bac].map((b) => ('nguongTu' in b ? b : { nguongTu: b[0], ppm: b[1] }));
    const ppm = i < 0 ? 0 : docBac.sort((a, b) => a.nguongTu - b.nguongTu)[i]!.ppm;
    mucTruocTran = nhanTyLe(coSo, ppm);
  }

  const tran = qt.tranPpm == null ? null : nhanTyLe(bc.quyChiKy, qt.tranPpm);
  const soTien = tran === null ? mucTruocTran : Math.min(mucTruocTran, tran);
  return { quyTac: qt, mucTruocTran, soTien, tran, biChan: tran !== null && mucTruocTran > tran };
}

/** Biểu lương mềm lũy tiến biên trên doanh số quy đổi (LOGIC.md §6). */
export function luongMem(bieu: readonly BacRutGon[], doanhSoQuyDoi: number): number {
  return luyTien(bieu, doanhSoQuyDoi);
}
