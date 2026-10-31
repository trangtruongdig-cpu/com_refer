/**
 * Soát trần chi (LOGIC.md §3.2). Tổng mọi khoản trả ra cho một hồ sơ KHÔNG
 * ĐƯỢC VƯỢT quỹ chi của hồ sơ đó.
 *
 * Quy tắc vận hành: soát trước khi lưu thay đổi cơ cấu, và CHẶN CHỐT KỲ LƯƠNG
 * nếu vượt — không phải chỉ cảnh báo.
 *
 * Thù lao trưởng nhóm và trưởng phòng nằm BÊN TRONG quỹ chi, không phải khoản
 * cộng thêm bên ngoài. Bốn khoản 5% cuối chi theo hoá đơn, có dự toán năm riêng,
 * nhưng vẫn tính vào trần vì vẫn lấy từ cùng một quỹ.
 */
import { quyChiMotKy, type CauTrucHocPhi, type KhoanCoCau } from './quy-chi';
import { chonQuyTac, tinhTheoQuyTac, type BoiCanh, type QuyTac, type VaiTro } from './quy-tac';
import { nhanTyLe } from './tien';

export interface DongChi {
  readonly ma: string;
  readonly ten: string;
  readonly soTien: number;
  /** Trần của quy tắc đã cắt bớt mức theo chính sách */
  readonly biChan: boolean;
  readonly mucTruocTran: number;
}

export interface KetQuaSoat {
  readonly quyChi: number;
  readonly chi: readonly DongChi[];
  readonly tongChi: number;
  readonly conLai: number;
  /** Tỷ lệ tổng chi trên quỹ chi, 0..1+ */
  readonly tyLe: number;
  readonly vuotTran: boolean;
  readonly coBiChan: boolean;
}

export interface ThamSoSoat {
  readonly cauTruc: CauTrucHocPhi;
  readonly dsQuyTac: readonly QuyTac[];
  readonly coCau: readonly KhoanCoCau[];
  readonly dich: { nganh: string; truong: string; he: string; ngay: string };
  /** Bậc theo số hồ sơ trong tháng — soát ở từng bậc để không bậc nào vỡ trần */
  readonly soHoSoThang: number;
}

const TEN_VAI_TRO: Record<VaiTro, string> = {
  NV: 'Cán bộ tuyển sinh',
  TN: 'Thù lao trưởng nhóm',
  TP: 'Thù lao trưởng phòng',
  CTV: 'Cộng tác viên',
};

export function soatTranChi(ts: ThamSoSoat): KetQuaSoat {
  const quyChi = quyChiMotKy(ts.cauTruc);
  const boiCanh: BoiCanh = {
    quyChiKy: quyChi,
    hocPhiKy: ts.cauTruc.hocPhiKy,
    soHoSoThang: ts.soHoSoThang,
    // Doanh số quy đổi của riêng kỳ này, dùng cho quy tắc LUY_TIEN_THEO_TIEN
    doanhSoQuyDoi: quyChi * 5.6,
  };

  const chi: DongChi[] = [];
  for (const vaiTro of ['NV', 'TN', 'TP'] as const) {
    const qt = chonQuyTac(ts.dsQuyTac, { vaiTro, ...ts.dich });
    if (!qt) continue;
    const kq = tinhTheoQuyTac(qt, boiCanh);
    chi.push({
      ma: vaiTro,
      ten: TEN_VAI_TRO[vaiTro],
      soTien: kq.soTien,
      biChan: kq.biChan,
      mucTruocTran: kq.mucTruocTran,
    });
  }

  // Bốn khoản chi theo hoá đơn: đối ngoại, marketing, quảng cáo, sự kiện
  for (const k of ts.coCau.filter((x) => x.theoHoaDon)) {
    const soTien = nhanTyLe(quyChi, k.ppm);
    chi.push({ ma: k.ma, ten: k.ten, soTien, biChan: false, mucTruocTran: soTien });
  }

  const tongChi = chi.reduce((t, x) => t + x.soTien, 0);
  return {
    quyChi,
    chi,
    tongChi,
    conLai: quyChi - tongChi,
    tyLe: quyChi === 0 ? 0 : tongChi / quyChi,
    vuotTran: tongChi > quyChi,
    coBiChan: chi.some((x) => x.biChan),
  };
}

/** Soát ở nhiều bậc số lượng hồ sơ — bậc nào cũng phải nằm trong quỹ chi. */
export function soatMoiBac(
  ts: Omit<ThamSoSoat, 'soHoSoThang'>,
  cacBac: readonly number[],
): { soHoSoThang: number; ketQua: KetQuaSoat }[] {
  return cacBac.map((soHoSoThang) => ({
    soHoSoThang,
    ketQua: soatTranChi({ ...ts, soHoSoThang }),
  }));
}
