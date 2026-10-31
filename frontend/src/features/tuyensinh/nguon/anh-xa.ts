/**
 * Lớp chống hỏng: đổi hình dạng của API sang kiểu nghiệp vụ mà màn hình dùng.
 *
 * Backend đổi tên một trường nào đó thì sửa ĐÚNG Ở ĐÂY, không rải ra tám màn
 * hình. Ba chỗ tên khác nhau giữa hai bên:
 *
 *   canBo.ma   → nhanSuId
 *   dot.ma     → dotDoiSoatMa
 *   id (uuid)  → giữ lại, vì mọi lệnh gọi API sau đó cần nó
 */
import type {
  ChuongTrinhApi,
  DotDoiSoatApi,
  HoSoApi,
  KyLuongApi,
  LanThuApi,
  TaiKhoanApi,
  TongQuanApi,
  TranChiApi,
} from '@/api/tuyensinh.api';
import type { ChuongTrinh, MaHe } from '../du-lieu/danh-muc';
import type { KetQuaSoat } from '../engine/tran-chi';
import type { DongMoPhong } from '../engine/ung-truoc';
import type { DongBangLuong, DotDoiSoat, HoSo, LanThu, TaiKhoan } from '../kho/kho.types';
import type { BangLuongThang, TongHopThang } from '../tinh-toan';

export const chuongTrinhTuApi = (c: ChuongTrinhApi): ChuongTrinh => ({
  ma: c.ma,
  truongMa: c.truongMa,
  truongTen: c.truongTen,
  truongPhoenix: c.truongPhoenix,
  he: c.he as MaHe,
  maNganh: c.maNganh,
  tenNganh: c.tenNganh,
  tuTrinhDo: c.tuTrinhDo as ChuongTrinh['tuTrinhDo'],
  thoiLuongThang: c.thoiLuongThang,
  soKy: c.soKy,
  hocPhiKy: c.hocPhiKy,
  tyLeTrichPpm: c.tyLeTrichPpm,
  thuePpm: c.thuePpm,
  dinhMucKy: c.dinhMucKy,
  treThang: c.treThang,
  nganhSucKhoe: c.nganhSucKhoe,
  daDoiChieu: c.daDoiChieu,
});

/**
 * Hồ sơ. Hai trường máy chủ chưa trả: nơi công tác và danh sách tệp đính kèm —
 * để rỗng thay vì bịa, và ghi vào README phần còn thiếu.
 */
export const hoSoTuApi = (h: HoSoApi): HoSo => ({
  id: h.id,
  ma: h.ma,
  chuongTrinhMa: h.chuongTrinhMa,
  hoTen: h.hoTen,
  ngaySinh: h.ngaySinh ?? '',
  soCccd: h.soCccd,
  dienThoai: h.dienThoai,
  email: h.email,
  diaChi: h.diaChi,
  trinhDo: h.trinhDo,
  noiCongTac: '',
  ghiChu: h.ghiChu,
  nhanSuId: h.canBo.ma,
  ngayLap: h.ngayLap,
  trangThai: h.trangThai,
  tep: [],
  kyDaThu: h.kyDaThu,
});

export const lanThuTuApi = (l: LanThuApi): LanThu => ({
  id: l.id,
  ma: l.ma,
  hoSoMa: l.hoSoMa,
  kyThu: l.kyThu,
  ngayThu: l.ngayThu,
  soTien: l.soTien,
  soChungTu: l.soChungTu,
  bienLaiTen: null,
  taiKhoanId: '',
  nhanSuId: l.canBo.ma,
  dotDoiSoatMa: l.dot?.ma ?? null,
  trangThai: l.trangThai,
});

export const dotTuApi = (d: DotDoiSoatApi, lanThuMa: string[]): DotDoiSoat => ({
  id: d.id,
  ma: d.ma,
  truongMa: d.truongMa,
  truongTen: d.truongTen,
  ngayLap: d.ngayLap,
  ngayNhanTien: d.ngayNhanTien,
  trangThai: d.trangThai,
  lanThuMa,
});

export const taiKhoanTuApi = (t: TaiKhoanApi): TaiKhoan => ({
  id: t.id,
  tenChu: t.tenChu,
  tenNganHang: t.tenNganHang,
  bin: t.bin,
  soTaiKhoan: t.soTaiKhoan,
});

const dongBangLuongTuApi = (d: KyLuongApi['bang'][number], phong: string): DongBangLuong => ({
  nhanSuId: d.nhanSuMa,
  hoTen: d.hoTen,
  nhom: d.nhom,
  phong,
  soHoSoMoi: d.soHoSoMoi,
  soKyThu: d.soKyThu,
  hocPhiThucThu: d.hocPhiThucThu,
  doanhSoQuyDoi: d.doanhSoQuyDoi,
  luongMem: d.luongMem,
  thuongNguong: d.thuongNguong,
  quyenLoi: d.quyenLoi,
  ungThem: d.ungThem,
  thuHoi: d.thuHoi,
  thucNhan: d.thucNhan,
  noCuoiKy: d.noCuoiKy,
});

/** Bảng lương một kỳ. Mọi con số đã do máy chủ tính, ở đây chỉ đổi tên trường. */
export const bangLuongTuApi = (k: KyLuongApi, phong = ''): BangLuongThang => ({
  thang: k.thang,
  bang: k.bang.map((d) => dongBangLuongTuApi(d, phong)),
  quyChiDaVe: k.bang.reduce((t, d) => t + d.quyenLoi, 0),
  quyChiPhatSinh: k.quyChiPhatSinh,
  choDoiSoat: 0,
  thuLaoTn: k.thuLaoTn,
  thuLaoTp: k.thuLaoTp,
  tongThucNhan: k.tongThucNhan,
  vuotTran: k.vuotTran,
  soatVuot: [],
});

/**
 * Tổng quan tháng hiện tại. Máy chủ chưa trả danh sách kỳ thu và kỳ tiền về
 * trong tháng, nên hai bảng chi tiết ở màn Doanh số dựng từ `/lan-thu`.
 */
export const tongQuanTuApi = (t: TongQuanApi): TongHopThang => ({
  thang: t.thang,
  soHoSoMoi: t.soHoSoMoi,
  soKyThu: t.soKyThu,
  hocPhiThucThu: t.hocPhiThucThu,
  doanhSoQuyDoi: t.doanhSoQuyDoi,
  quyChiPhatSinh: 0,
  quyChiDaVe: t.quyChiDaVe,
  choDoiSoat: 0,
  luongMem: t.luongMem,
  thuong: t.thuongNguong,
  quyenLoi: 0,
  kyThuTrongThang: [],
  kyNhanTienTrongThang: [],
});

/** Một dòng bảng lương của chính mình, dùng khi xem tháng không phải tháng này. */
export const tongHopTuBangLuong = (k: KyLuongApi, nhanSuMa: string | null): TongHopThang | null => {
  const d = nhanSuMa ? k.bang.find((x) => x.nhanSuMa === nhanSuMa) : null;
  if (!d && nhanSuMa) return null;
  const cong = <K extends keyof KyLuongApi['bang'][number]>(khoa: K) =>
    d ? (d[khoa] as number) : k.bang.reduce((t, x) => t + (x[khoa] as number), 0);
  return {
    thang: k.thang,
    soHoSoMoi: cong('soHoSoMoi'),
    soKyThu: cong('soKyThu'),
    hocPhiThucThu: cong('hocPhiThucThu'),
    doanhSoQuyDoi: cong('doanhSoQuyDoi'),
    quyChiPhatSinh: k.quyChiPhatSinh,
    quyChiDaVe: cong('quyenLoi'),
    choDoiSoat: 0,
    luongMem: cong('luongMem'),
    thuong: cong('thuongNguong'),
    quyenLoi: cong('quyenLoi'),
    kyThuTrongThang: [],
    kyNhanTienTrongThang: [],
  };
};

/** Sổ công nợ dựng từ các kỳ lương đã tính — máy chủ chưa có endpoint riêng. */
export const soCongNoTuKyLuong = (cacKy: readonly KyLuongApi[], nhanSuMa: string): DongMoPhong[] =>
  [...cacKy]
    .sort((a, b) => a.thang.localeCompare(b.thang))
    .flatMap((k) => {
      const d = k.bang.find((x) => x.nhanSuMa === nhanSuMa);
      if (!d) return [];
      return [
        {
          thang: k.thang,
          soHoSoMoi: d.soHoSoMoi,
          quyenLoi: d.quyenLoi,
          ungThem: d.ungThem,
          thuHoi: d.thuHoi,
          thucNhan: d.thucNhan,
          noCuoiKy: d.noCuoiKy,
          datChiTieu: d.ungThem > 0 || d.nhanh === 'THU_HOI',
          nhanh: d.nhanh,
        },
      ];
    });

/** Soát trần: máy chủ trả nhiều bậc, màn hình đang xem một bậc. */
export const soatTuApi = (t: TranChiApi, soHoSoThang: number): KetQuaSoat | null => {
  const b = t.bac.find((x) => x.soHoSoThang === soHoSoThang) ?? t.bac[0];
  if (!b) return null;
  return {
    quyChi: b.quyChi,
    chi: b.chi,
    tongChi: b.tongChi,
    conLai: b.conLai,
    tyLe: b.tyLe,
    vuotTran: b.vuotTran,
    coBiChan: b.coBiChan,
  };
};
