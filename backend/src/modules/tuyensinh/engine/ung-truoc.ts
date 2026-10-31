/**
 * Cơ chế lương hai phần, hiệu lực 01/07/2026 (LOGIC.md §8). KHÔNG CÓ LƯƠNG CỨNG.
 *
 *   phần 1 — ứng trước: mức sàn mỗi tháng, điều kiện đạt chỉ tiêu hồ sơ mới
 *   phần 2 — thực hưởng: phần của cán bộ trong quỹ chi từng kỳ thu, KHI TIỀN
 *            THẬT VỀ (đợt đối soát đã nhận tiền), và học viên còn theo học
 *
 * Ứng trước là KHOẢN PHẢI THU, không phải chi phí. Nó tự tất toán: coi nó là chi
 * phí sẽ tưởng bội chi trong khi không.
 */

export interface ThamSoCoChe {
  /** Mức sàn ứng trước mỗi tháng */
  readonly mucSan: number;
  /** Số hồ sơ mới trong tháng để được ứng */
  readonly chiTieuHoSo: number;
}

export interface VaoSoCongNo {
  /** Quyền lợi phát sinh trong tháng — phần của cán bộ trong quỹ chi ĐÃ VỀ */
  readonly quyenLoi: number;
  /** Số hồ sơ mới trong tháng */
  readonly soHoSoMoi: number;
  readonly noDauKy: number;
}

export type Nhanh = 'THU_HOI' | 'UNG_THEM' | 'CHI_DUY_TRI';

export interface RaSoCongNo {
  readonly quyenLoi: number;
  readonly ungThem: number;
  readonly thuHoi: number;
  readonly thucNhan: number;
  readonly noCuoiKy: number;
  readonly datChiTieu: boolean;
  readonly nhanh: Nhanh;
}

/**
 * Sổ công nợ — ba nhánh, và nó tự tất toán.
 *
 * Nhánh một là chỗ cơ chế tự khoá: cán bộ LUÔN NHẬN ÍT NHẤT MỨC SÀN, phần vượt
 * mức sàn dùng để trả nợ trước, chỉ khi hết nợ mới nhận trọn.
 */
export function soCongNo(vao: VaoSoCongNo, thamSo: ThamSoCoChe): RaSoCongNo {
  const datChiTieu = vao.soHoSoMoi >= thamSo.chiTieuHoSo;
  let no = vao.noDauKy;
  let thucNhan: number;
  let thuHoi = 0;
  let ungThem = 0;
  let nhanh: Nhanh;

  if (vao.quyenLoi >= thamSo.mucSan) {
    // Tiền về đã đủ sống: phần vượt mức sàn dùng để thu hồi ứng trước
    thuHoi = Math.min(no, vao.quyenLoi - thamSo.mucSan);
    thucNhan = vao.quyenLoi - thuHoi;
    no -= thuHoi;
    nhanh = 'THU_HOI';
  } else if (datChiTieu) {
    // Chưa có tiền về, nhưng đủ hồ sơ ⇒ được ứng cho bằng mức sàn
    thucNhan = thamSo.mucSan;
    ungThem = thamSo.mucSan - vao.quyenLoi;
    no += ungThem;
    nhanh = 'UNG_THEM';
  } else {
    // Không đạt: chỉ có tiền duy trì học viên còn đang học
    thucNhan = vao.quyenLoi;
    nhanh = 'CHI_DUY_TRI';
  }

  return {
    quyenLoi: vao.quyenLoi,
    ungThem,
    thuHoi,
    thucNhan,
    noCuoiKy: no,
    datChiTieu,
    nhanh,
  };
}

export interface DongThang {
  /** Nhãn tháng, ví dụ `2026-07` hoặc `T+5` */
  readonly thang: string;
  readonly quyenLoi: number;
  readonly soHoSoMoi: number;
}

export interface DongMoPhong extends RaSoCongNo {
  readonly thang: string;
  readonly soHoSoMoi: number;
}

/** Chạy sổ công nợ qua nhiều tháng liên tiếp, nợ cuốn từ tháng trước sang. */
export function moPhongSoCongNo(
  cacThang: readonly DongThang[],
  thamSo: ThamSoCoChe,
  noBanDau = 0,
): DongMoPhong[] {
  let no = noBanDau;
  const ra: DongMoPhong[] = [];
  for (const t of cacThang) {
    const d = soCongNo({ quyenLoi: t.quyenLoi, soHoSoMoi: t.soHoSoMoi, noDauKy: no }, thamSo);
    no = d.noCuoiKy;
    ra.push({ thang: t.thang, soHoSoMoi: t.soHoSoMoi, ...d });
  }
  return ra;
}
