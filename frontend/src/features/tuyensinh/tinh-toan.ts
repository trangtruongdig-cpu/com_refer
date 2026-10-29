/**
 * Lớp tính toán: ghép dữ liệu trong kho với engine tiền.
 *
 * KHÔNG viết lại phép tính tiền ở đây. Mọi con số đi qua `engine/` — đó là chỗ
 * duy nhất biết làm tròn, lũy tiến biên, phân bổ và trần chi. Khi backend lên,
 * file này được thay bằng các lệnh gọi API tương ứng (thuchien.md §9.4) và
 * engine chuyển sang `backend/src/engine/`.
 *
 * Hai mốc không được lẫn (LOGIC.md §2.4):
 *   lần thu        → ghi nhận DOANH SỐ, ngay lúc học viên đóng tiền
 *   đợt đối soát   → lập QUỸ CHI, 4–6 tháng sau, khi tiền thật về Trường
 */
import { timChuongTrinh, type ChuongTrinh } from './du-lieu/danh-muc';
import { NHAN_SU, phamViPhuTrach, type NhanSu } from './du-lieu/nhan-su';
import {
  bieuLuongMemTai,
  MOC_DOI_SOAT,
  QUY_TAC,
  THUONG_NGUONG,
  TY_LE_GIU_HOC_VIEN,
} from './du-lieu/tham-so';
import { nguongKeTiep, thuongNguong } from './engine/luy-tien';
import { doanhSoQuyDoiMotKy, quyChiMotKy, type KhoanCoCau } from './engine/quy-chi';
import { chonQuyTac, luongMem, tinhTheoQuyTac, type KetQuaQuyTac } from './engine/quy-tac';
import { soatTranChi, type KetQuaSoat } from './engine/tran-chi';
import { nhanTyLe } from './engine/tien';
import { moPhongSoCongNo, type DongMoPhong, type ThamSoCoChe } from './engine/ung-truoc';
import { thangCong } from './kho/du-lieu-mau';
import type { DotDoiSoat, DongBangLuong, HoSo, LanThu } from './kho/kho.types';

export const thangCuaNgay = (ngay: string): string => ngay.slice(0, 7);
export const thangNay = (): string => new Date().toISOString().slice(0, 7);

export interface LanThuDayDu {
  readonly lanThu: LanThu;
  readonly hoSo: HoSo;
  readonly ct: ChuongTrinh;
  /** Tháng ghi nhận doanh số */
  readonly thangThu: string;
  /** Tháng tiền thật về Trường, `null` khi chưa đối soát xong */
  readonly thangNhanTien: string | null;
  readonly quyChi: number;
  readonly doanhSoQuyDoi: number;
}

export function ghepLanThu(
  hoSo: readonly HoSo[],
  lanThu: readonly LanThu[],
  dotDoiSoat: readonly DotDoiSoat[],
): LanThuDayDu[] {
  const ra: LanThuDayDu[] = [];
  for (const lt of lanThu) {
    const hs = hoSo.find((h) => h.ma === lt.hoSoMa);
    if (!hs) continue;
    const ct = timChuongTrinh(hs.chuongTrinhMa);
    if (!ct) continue;
    const dot = lt.dotDoiSoatMa ? dotDoiSoat.find((d) => d.ma === lt.dotDoiSoatMa) : undefined;
    ra.push({
      lanThu: lt,
      hoSo: hs,
      ct,
      thangThu: thangCuaNgay(lt.ngayThu),
      thangNhanTien:
        dot && dot.trangThai === 'DA_NHAN_TIEN' && dot.ngayNhanTien
          ? thangCuaNgay(dot.ngayNhanTien)
          : null,
      quyChi: quyChiMotKy(ct),
      doanhSoQuyDoi: doanhSoQuyDoiMotKy(ct),
    });
  }
  return ra.sort((a, b) => b.lanThu.ngayThu.localeCompare(a.lanThu.ngayThu));
}

/** Số hồ sơ MỚI của một cán bộ trong tháng — dùng cho bậc theo số lượng và chỉ tiêu ứng trước. */
export function soHoSoMoi(hoSo: readonly HoSo[], nhanSuId: string, thang: string): number {
  return hoSo.filter((h) => h.nhanSuId === nhanSuId && thangCuaNgay(h.ngayLap) === thang).length;
}

/**
 * Quyền lợi của cán bộ trên MỘT KỲ THU, theo quy tắc ba chiều.
 *
 * Bậc theo số lượng lấy số hồ sơ của THÁNG LẬP HỒ SƠ — bậc được xác định tại
 * thời điểm ghi nhận doanh số, không phải tháng tiền về. Chỗ này tài liệu chưa
 * nói rõ, nếu Trường chốt khác thì sửa đúng một dòng dưới đây.
 */
export function quyenLoiMotKy(
  d: LanThuDayDu,
  hoSo: readonly HoSo[],
  /**
   * Ngày tra quy tắc. Mặc định là THÁNG TIỀN VỀ, không phải tháng thu: quyền
   * lợi chỉ phát sinh khi quỹ chi được lập, nên nó chịu chính sách đang hiệu
   * lực ở kỳ lương đó. Kỳ chưa đối soát thì tạm tra theo ngày thu.
   */
  ngay = d.thangNhanTien ? `${d.thangNhanTien}-01` : d.lanThu.ngayThu,
): KetQuaQuyTac | null {
  const qt = chonQuyTac(QUY_TAC, {
    vaiTro: 'NV',
    nganh: d.ct.ma,
    truong: d.ct.truongMa,
    he: d.ct.he,
    ngay,
  });
  if (!qt) return null;
  return tinhTheoQuyTac(qt, {
    quyChiKy: d.quyChi,
    hocPhiKy: d.ct.hocPhiKy,
    soHoSoThang: soHoSoMoi(hoSo, d.hoSo.nhanSuId, thangCuaNgay(d.hoSo.ngayLap)),
    doanhSoQuyDoi: d.doanhSoQuyDoi,
  });
}

export interface TongHopThang {
  readonly thang: string;
  readonly soHoSoMoi: number;
  readonly soKyThu: number;
  readonly hocPhiThucThu: number;
  readonly doanhSoQuyDoi: number;
  /** Quỹ chi của các kỳ thu trong tháng — phát sinh, chưa chắc đã về */
  readonly quyChiPhatSinh: number;
  /** Quỹ chi của các kỳ đã đối soát xong TRONG tháng — tiền thật */
  readonly quyChiDaVe: number;
  readonly choDoiSoat: number;
  readonly luongMem: number;
  readonly thuong: number;
  /** Phần của cán bộ trong quỹ chi ĐÃ VỀ trong tháng */
  readonly quyenLoi: number;
  readonly kyThuTrongThang: readonly LanThuDayDu[];
  readonly kyNhanTienTrongThang: readonly LanThuDayDu[];
}

export function tongHopThang(
  tatCa: readonly LanThuDayDu[],
  hoSo: readonly HoSo[],
  nhanSuId: string | null,
  thang: string,
): TongHopThang {
  const cua = (d: LanThuDayDu) => nhanSuId === null || d.lanThu.nhanSuId === nhanSuId;
  const thu = tatCa.filter((d) => cua(d) && d.thangThu === thang);
  const ve = tatCa.filter((d) => cua(d) && d.thangNhanTien === thang);
  const chuaVe = tatCa.filter((d) => cua(d) && d.thangNhanTien === null);

  const doanhSoQuyDoi = thu.reduce((t, d) => t + d.doanhSoQuyDoi, 0);
  const ngay = `${thang}-01`;
  const bieu = bieuLuongMemTai(ngay);

  return {
    thang,
    soHoSoMoi: nhanSuId ? soHoSoMoi(hoSo, nhanSuId, thang) : 0,
    soKyThu: thu.length,
    hocPhiThucThu: thu.reduce((t, d) => t + d.lanThu.soTien, 0),
    doanhSoQuyDoi,
    quyChiPhatSinh: thu.reduce((t, d) => t + d.quyChi, 0),
    quyChiDaVe: ve.reduce((t, d) => t + d.quyChi, 0),
    choDoiSoat: chuaVe.reduce((t, d) => t + d.quyChi, 0),
    luongMem: luongMem(bieu.bac, doanhSoQuyDoi),
    thuong: thuongNguong(THUONG_NGUONG, doanhSoQuyDoi),
    quyenLoi: ve.reduce((t, d) => t + (quyenLoiMotKy(d, hoSo)?.soTien ?? 0), 0),
    kyThuTrongThang: thu,
    kyNhanTienTrongThang: ve,
  };
}

export const nguongThuongKeTiep = (doanhSoQuyDoi: number) =>
  nguongKeTiep(THUONG_NGUONG, doanhSoQuyDoi);

/** Dải tháng có dữ liệu, từ tháng sớm nhất tới `den`. */
export function daiThang(
  tatCa: readonly LanThuDayDu[],
  hoSo: readonly HoSo[],
  den: string,
): string[] {
  const moc = [
    ...tatCa.map((d) => d.thangThu),
    ...tatCa.map((d) => d.thangNhanTien).filter((x): x is string => x !== null),
    ...hoSo.map((h) => thangCuaNgay(h.ngayLap)),
  ].sort();
  let t = moc[0] ?? den;
  const ra: string[] = [];
  while (t <= den && ra.length < 60) {
    ra.push(t);
    t = thangCong(t, 1);
  }
  return ra;
}

/**
 * Sổ công nợ ứng trước của một cán bộ, chạy lại từ tháng đầu có dữ liệu — nợ
 * cuốn từ tháng trước sang, nên không thể tính một tháng lẻ.
 */
export function soCongNoCuaNhanSu(
  tatCa: readonly LanThuDayDu[],
  hoSo: readonly HoSo[],
  nhanSuId: string,
  den: string,
  thamSo: ThamSoCoChe,
): DongMoPhong[] {
  const cacThang = daiThang(tatCa, hoSo, den).map((thang) => {
    const th = tongHopThang(tatCa, hoSo, nhanSuId, thang);
    return { thang, quyenLoi: th.quyenLoi, soHoSoMoi: th.soHoSoMoi };
  });
  return moPhongSoCongNo(cacThang, thamSo);
}

export interface BangLuongThang {
  readonly thang: string;
  readonly bang: DongBangLuong[];
  readonly quyChiDaVe: number;
  readonly quyChiPhatSinh: number;
  readonly choDoiSoat: number;
  readonly thuLaoTn: number;
  readonly thuLaoTp: number;
  readonly tongThucNhan: number;
  readonly vuotTran: boolean;
  readonly soatVuot: readonly { ct: ChuongTrinh; ketQua: KetQuaSoat }[];
}

/**
 * Bảng lương một tháng cho phạm vi phụ trách của người đang đăng nhập.
 *
 * Thù lao TN/TP tính trên QUỸ CHI ĐÃ VỀ trong tháng, không tính trên doanh số:
 * tiền chưa về thì chưa có gì để chia.
 */
export function bangLuongThang(
  tatCa: readonly LanThuDayDu[],
  hoSo: readonly HoSo[],
  toi: NhanSu,
  thang: string,
  thamSo: ThamSoCoChe,
  coCau: readonly KhoanCoCau[],
): BangLuongThang {
  const trongPhamVi = phamViPhuTrach(toi);
  const bang: DongBangLuong[] = [];

  for (const id of trongPhamVi) {
    const ns = NHAN_SU.find((n) => n.id === id);
    if (!ns) continue;
    const th = tongHopThang(tatCa, hoSo, id, thang);
    const so = soCongNoCuaNhanSu(tatCa, hoSo, id, thang, thamSo);
    const cuoi = so[so.length - 1];
    bang.push({
      nhanSuId: id,
      hoTen: ns.hoTen,
      nhom: ns.nhom,
      phong: ns.phong,
      soHoSoMoi: th.soHoSoMoi,
      soKyThu: th.soKyThu,
      hocPhiThucThu: th.hocPhiThucThu,
      doanhSoQuyDoi: th.doanhSoQuyDoi,
      luongMem: th.luongMem,
      thuongNguong: th.thuong,
      quyenLoi: th.quyenLoi,
      ungThem: cuoi?.ungThem ?? 0,
      thuHoi: cuoi?.thuHoi ?? 0,
      thucNhan: cuoi?.thucNhan ?? 0,
      noCuoiKy: cuoi?.noCuoiKy ?? 0,
    });
  }

  const toanBo = tongHopThang(tatCa, hoSo, null, thang);
  const tnPpm = coCau.find((k) => k.ma === 'THU_LAO_TN')?.ppm ?? 0;
  const tpPpm = coCau.find((k) => k.ma === 'THU_LAO_TP')?.ppm ?? 0;

  // Soát trần trên từng chương trình có phát sinh trong tháng
  const soat = [...new Set(toanBo.kyThuTrongThang.map((d) => d.ct.ma))]
    .map((ma) => {
      const ct = timChuongTrinh(ma)!;
      return { ct, ketQua: soatChuongTrinh(ct, coCau, 3, `${thang}-01`) };
    })
    .filter((x) => x.ketQua.vuotTran);

  return {
    thang,
    bang,
    quyChiDaVe: toanBo.quyChiDaVe,
    quyChiPhatSinh: toanBo.quyChiPhatSinh,
    choDoiSoat: toanBo.choDoiSoat,
    thuLaoTn: nhanTyLe(toanBo.quyChiDaVe, tnPpm),
    thuLaoTp: nhanTyLe(toanBo.quyChiDaVe, tpPpm),
    tongThucNhan: bang.reduce((t, d) => t + d.thucNhan, 0),
    vuotTran: soat.length > 0,
    soatVuot: soat,
  };
}

/** Soát trần chi của một chương trình ở một bậc số lượng hồ sơ. */
export function soatChuongTrinh(
  ct: ChuongTrinh,
  coCau: readonly KhoanCoCau[],
  soHoSoThang: number,
  ngay = new Date().toISOString().slice(0, 10),
): KetQuaSoat {
  return soatTranChi({
    cauTruc: ct,
    dsQuyTac: QUY_TAC,
    coCau,
    dich: { nganh: ct.ma, truong: ct.truongMa, he: ct.he, ngay },
    soHoSoThang,
  });
}

/** Lịch tiền về của một hồ sơ: kỳ nào về tháng nào, theo mốc đối soát. */
export function lichDoiSoat(ct: ChuongTrinh, thangThuKy1: string) {
  return Array.from({ length: ct.soKy }, (_, i) => {
    const tre = MOC_DOI_SOAT[i] ?? (MOC_DOI_SOAT[MOC_DOI_SOAT.length - 1] ?? 0) + (i + 1) * 5;
    return {
      ky: i + 1,
      thangVe: thangCong(thangThuKy1, tre),
      treThang: tre,
      /** Xác suất học viên còn theo học, dùng cho bản dự phóng */
      tyLeGiu: Number(Math.pow(TY_LE_GIU_HOC_VIEN, i).toFixed(4)),
    };
  });
}
