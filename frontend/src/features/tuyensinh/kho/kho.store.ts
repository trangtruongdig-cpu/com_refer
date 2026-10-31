/**
 * Kho dữ liệu của bản demo: zustand + localStorage, không cần cơ sở dữ liệu.
 *
 * Hai quy tắc của LOGIC.md được chặn NGAY TRONG KHO, không chỉ ở giao diện —
 * khi backend lên, cả hai nằm ở trigger PostgreSQL và API không được đi vòng:
 *
 *   1. Không ai lập quỹ chi từ một đợt đối soát chưa nhận tiền.
 *   2. Không ai sửa được kỳ lương đã chốt.
 *
 * Khi chuyển sang API thật, chỉ file này đổi: các màn hình gọi hành động, không
 * tự chạm vào dữ liệu.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CO_CAU_QUY_CHI, THAM_SO_CO_CHE } from '../du-lieu/tham-so';
import { DANH_BA_DOI_TAC_MAU, type DoiTacThamKhao } from '../du-lieu/doi-tac-tham-khao';
import { timChuongTrinh } from '../du-lieu/danh-muc';
import type { KhoanCoCau } from '../engine/quy-chi';
import type { ThamSoCoChe } from '../engine/ung-truoc';
import { duLieuMau } from './du-lieu-mau';
import type { DotDoiSoat, HoSo, KyLuong, LanThu, TaiKhoan } from './kho.types';

export type LoaiBao = 'ok' | 'canh' | 'loi' | 'tin';

export interface Bao {
  readonly loai: LoaiBao;
  readonly chu: string;
}

export interface NhapHoSo {
  readonly chuongTrinhMa: string;
  readonly hoTen: string;
  readonly ngaySinh: string;
  readonly soCccd: string;
  readonly dienThoai: string;
  readonly email: string;
  readonly diaChi: string;
  readonly trinhDo: string;
  readonly noiCongTac: string;
  readonly ghiChu: string;
  readonly tep: readonly { muc: string; ten: string }[];
}

export interface GhiNhanThu {
  readonly hoSoMa: string;
  readonly soChungTu: string;
  readonly bienLaiTen: string | null;
  readonly taiKhoanId: string;
}

interface KhoState {
  toiLaId: string;
  hoSo: HoSo[];
  lanThu: LanThu[];
  dotDoiSoat: DotDoiSoat[];
  taiKhoan: TaiKhoan[];
  kyLuong: KyLuong[];
  coCau: KhoanCoCau[];
  thamSoCoChe: ThamSoCoChe;
  doiTacThamKhao: DoiTacThamKhao[];
  bao: Bao | null;

  datBao: (bao: Bao | null) => void;
  doiNguoiDung: (id: string) => void;
  lapHoSo: (nhap: NhapHoSo) => string;
  ghiNhanThu: (vao: GhiNhanThu) => LanThu | null;
  themTaiKhoan: (tk: Omit<TaiKhoan, 'id'>) => void;
  taoDotDoiSoat: (truongMa: string, lanThuMa: string[]) => void;
  danhDauNhanTien: (dotMa: string) => void;
  capNhatCoCau: (ppmTheoMa: Record<string, number>) => boolean;
  capNhatCoChe: (ts: ThamSoCoChe) => void;
  luuKyLuong: (ky: KyLuong) => boolean;
  chotKyLuong: (thang: string) => boolean;
  luuDoiTacThamKhao: (doiTac: DoiTacThamKhao) => boolean;
  luuTruDoiTacThamKhao: (ma: string) => void;
  khoiPhucDoiTacThamKhao: (ma: string) => void;
  napLaiMau: () => void;
}

const homNay = () => new Date().toISOString().slice(0, 10);

const maMoi = (tienTo: string) =>
  tienTo +
  Date.now().toString(36).toUpperCase().slice(-5) +
  Math.random().toString(36).slice(2, 4).toUpperCase();

function khoiTao() {
  const mau = duLieuMau();
  return {
    toiLaId: 'NV01',
    hoSo: mau.hoSo,
    lanThu: mau.lanThu,
    dotDoiSoat: mau.dotDoiSoat,
    taiKhoan: mau.taiKhoan,
    kyLuong: [] as KyLuong[],
    coCau: [...CO_CAU_QUY_CHI],
    thamSoCoChe: THAM_SO_CO_CHE,
    doiTacThamKhao: DANH_BA_DOI_TAC_MAU.map((doiTac) => ({
      ...doiTac,
      trangThaiHopTac: doiTac.trangThaiHopTac ?? 'TIEM_NANG',
      hienThiCongKhai: doiTac.hienThiCongKhai ?? true,
      hoatDong: doiTac.hoatDong ?? true,
      archivedAt: doiTac.archivedAt ?? null,
    })),
    bao: null as Bao | null,
  };
}

function hopNhatKhoDaLuu(duLieuDaLuu: unknown, khoMacDinh: KhoState): KhoState {
  if (!duLieuDaLuu || typeof duLieuDaLuu !== 'object') return khoMacDinh;

  const khoCu = duLieuDaLuu as Partial<KhoState>;
  const doiTacTheoMa = new Map(khoMacDinh.doiTacThamKhao.map((doiTac) => [doiTac.ma, doiTac]));
  if (Array.isArray(khoCu.doiTacThamKhao)) {
    for (const doiTac of khoCu.doiTacThamKhao) {
      if (!doiTac || typeof doiTac.ma !== 'string') continue;
      const banGhiMacDinh = doiTacTheoMa.get(doiTac.ma);
      if (banGhiMacDinh && !doiTac.id) {
        doiTacTheoMa.set(doiTac.ma, {
          ...banGhiMacDinh,
          hoatDong: doiTac.hoatDong ?? banGhiMacDinh.hoatDong,
          archivedAt: doiTac.archivedAt ?? banGhiMacDinh.archivedAt,
        });
        continue;
      }
      doiTacTheoMa.set(doiTac.ma, {
        ...banGhiMacDinh,
        ...doiTac,
      });
    }
  }

  return {
    ...khoMacDinh,
    ...khoCu,
    doiTacThamKhao: [...doiTacTheoMa.values()],
  };
}

export const useKho = create<KhoState>()(
  persist(
    (set, get) => ({
      ...khoiTao(),

      datBao: (bao) => set({ bao }),

      doiNguoiDung: (id) => set({ toiLaId: id, bao: null }),

      lapHoSo: (nhap) => {
        const ma = maMoi('HS');
        const hs: HoSo = {
          ma,
          chuongTrinhMa: nhap.chuongTrinhMa,
          hoTen: nhap.hoTen.trim(),
          ngaySinh: nhap.ngaySinh,
          soCccd: nhap.soCccd.trim(),
          dienThoai: nhap.dienThoai.trim(),
          email: nhap.email.trim(),
          diaChi: nhap.diaChi.trim(),
          trinhDo: nhap.trinhDo.trim(),
          noiCongTac: nhap.noiCongTac.trim(),
          ghiChu: nhap.ghiChu.trim(),
          nhanSuId: get().toiLaId,
          ngayLap: homNay(),
          trangThai: 'CHO_THANH_TOAN',
          tep: nhap.tep,
          kyDaThu: 0,
        };
        set((s) => ({ hoSo: [hs, ...s.hoSo], bao: { loai: 'ok', chu: `Đã lưu hồ sơ ${ma}` } }));
        return ma;
      },

      ghiNhanThu: (vao) => {
        const s = get();
        const hs = s.hoSo.find((h) => h.ma === vao.hoSoMa);
        if (!hs) return null;
        const ct = timChuongTrinh(hs.chuongTrinhMa);
        if (!ct) return null;
        // Bắt buộc có số chứng từ — không có chứng từ thì không ghi nhận doanh số
        if (!vao.soChungTu.trim()) {
          set({ bao: { loai: 'canh', chu: 'Phải có số chứng từ mới ghi nhận được.' } });
          return null;
        }
        const ky = hs.kyDaThu + 1;
        if (ky > ct.soKy) {
          set({ bao: { loai: 'canh', chu: 'Hồ sơ đã đóng đủ học phí toàn khoá.' } });
          return null;
        }
        const lt: LanThu = {
          ma: maMoi('LT'),
          hoSoMa: hs.ma,
          kyThu: ky,
          ngayThu: homNay(),
          soTien: ct.hocPhiKy,
          soChungTu: vao.soChungTu.trim(),
          bienLaiTen: vao.bienLaiTen,
          taiKhoanId: vao.taiKhoanId,
          nhanSuId: hs.nhanSuId,
          dotDoiSoatMa: null,
          // Doanh số ghi nhận ngay, nhưng tiền CHƯA về Trường
          trangThai: 'CHO_DOI_SOAT',
        };
        set((st) => ({
          lanThu: [lt, ...st.lanThu],
          hoSo: st.hoSo.map((h) =>
            h.ma === hs.ma
              ? {
                  ...h,
                  kyDaThu: ky,
                  trangThai: ky >= ct.soKy ? 'DA_DU_HOC_PHI' : 'DANG_HOC',
                }
              : h,
          ),
          bao: { loai: 'ok', chu: `Đã ghi nhận thu kỳ ${ky} của ${hs.hoTen}` },
        }));
        return lt;
      },

      themTaiKhoan: (tk) => {
        if (!tk.tenChu.trim() || !tk.soTaiKhoan.trim()) {
          set({ bao: { loai: 'canh', chu: 'Cần ít nhất chủ tài khoản và số tài khoản.' } });
          return;
        }
        set((s) => ({
          taiKhoan: [
            ...s.taiKhoan,
            {
              id: maMoi('TK'),
              tenChu: tk.tenChu.trim(),
              tenNganHang: tk.tenNganHang.trim(),
              bin: tk.bin.replace(/\D/g, ''),
              soTaiKhoan: tk.soTaiKhoan.replace(/\s/g, ''),
            },
          ],
          bao: { loai: 'ok', chu: 'Đã thêm tài khoản nhận tiền.' },
        }));
      },

      taoDotDoiSoat: (truongMa, lanThuMa) => {
        if (lanThuMa.length === 0) {
          set({ bao: { loai: 'canh', chu: 'Chọn ít nhất một lần thu để lập đợt.' } });
          return;
        }
        const ct = timChuongTrinh(
          get().hoSo.find((h) => h.ma === get().lanThu.find((l) => l.ma === lanThuMa[0])?.hoSoMa)
            ?.chuongTrinhMa ?? '',
        );
        const ma = maMoi('DS');
        set((s) => ({
          dotDoiSoat: [
            {
              ma,
              truongMa,
              truongTen: ct?.truongTen ?? truongMa,
              ngayLap: homNay(),
              ngayNhanTien: null,
              trangThai: 'CHUA_NHAN_TIEN',
              lanThuMa,
            },
            ...s.dotDoiSoat,
          ],
          lanThu: s.lanThu.map((l) => (lanThuMa.includes(l.ma) ? { ...l, dotDoiSoatMa: ma } : l)),
          bao: {
            loai: 'tin',
            chu: `Đã lập đợt ${ma}. Quỹ chi CHƯA được lập — chờ tiền thật về.`,
          },
        }));
      },

      /**
       * Đánh dấu đợt đã nhận tiền ⇒ LẬP QUỸ CHI. Đây là mốc duy nhất quỹ chi
       * được sinh ra; trước mốc này chỉ có doanh số.
       */
      danhDauNhanTien: (dotMa) => {
        const dot = get().dotDoiSoat.find((d) => d.ma === dotMa);
        if (!dot) return;
        if (dot.trangThai === 'DA_NHAN_TIEN') return;
        set((s) => ({
          dotDoiSoat: s.dotDoiSoat.map((d) =>
            d.ma === dotMa ? { ...d, trangThai: 'DA_NHAN_TIEN', ngayNhanTien: homNay() } : d,
          ),
          lanThu: s.lanThu.map((l) =>
            dot.lanThuMa.includes(l.ma) ? { ...l, trangThai: 'DA_NHAN_TIEN' } : l,
          ),
          bao: { loai: 'ok', chu: `Đợt ${dotMa} đã nhận tiền — quỹ chi được lập.` },
        }));
      },

      capNhatCoCau: (ppmTheoMa) => {
        const moi = get().coCau.map((k) => ({ ...k, ppm: ppmTheoMa[k.ma] ?? k.ppm }));
        const tong = moi.reduce((t, k) => t + k.ppm, 0);
        if (tong !== 1_000_000) {
          set({
            bao: {
              loai: 'loi',
              chu: `Cơ cấu phải cộng đúng 100%, đang là ${(tong / 10_000).toFixed(1)}%.`,
            },
          });
          return false;
        }
        set({ coCau: moi, bao: { loai: 'ok', chu: 'Đã cập nhật cơ cấu quỹ chi.' } });
        return true;
      },

      capNhatCoChe: (ts) =>
        set({ thamSoCoChe: ts, bao: { loai: 'ok', chu: 'Đã cập nhật tham số cơ chế.' } }),

      luuKyLuong: (ky) => {
        const cu = get().kyLuong.find((k) => k.thang === ky.thang);
        if (cu?.trangThai === 'DA_CHOT') {
          set({
            bao: {
              loai: 'loi',
              chu: `Kỳ ${ky.thang} đã chốt — bất biến. Sai sót đi qua bút toán điều chỉnh ở kỳ sau.`,
            },
          });
          return false;
        }
        set((s) => ({
          kyLuong: [ky, ...s.kyLuong.filter((k) => k.thang !== ky.thang)],
          bao: { loai: 'ok', chu: `Đã mở và tính kỳ lương ${ky.thang}.` },
        }));
        return true;
      },

      chotKyLuong: (thang) => {
        const ky = get().kyLuong.find((k) => k.thang === thang);
        if (!ky) return false;
        if (ky.trangThai === 'DA_CHOT') return false;
        // Soát trần CHẶN chốt kỳ, không phải chỉ cảnh báo
        if (ky.vuotTran) {
          set({
            bao: {
              loai: 'loi',
              chu: 'Vượt trần chi — không chốt được kỳ. Sửa cơ cấu hoặc quy tắc trước.',
            },
          });
          return false;
        }
        set((s) => ({
          kyLuong: s.kyLuong.map((k) =>
            k.thang === thang ? { ...k, trangThai: 'DA_CHOT', ngayChot: homNay() } : k,
          ),
          bao: { loai: 'ok', chu: `Đã chốt kỳ lương ${thang}. Kỳ đã chốt không sửa được.` },
        }));
        return true;
      },

      luuDoiTacThamKhao: (doiTac) => {
        const ma = doiTac.ma.trim().toLocaleUpperCase('vi');
        const ten = doiTac.ten.trim();
        if (!ma || !ten || !doiTac.tinhThanh.trim() || !doiTac.nguonUrl.trim()) {
          set({ bao: { loai: 'canh', chu: 'Cần mã, tên trường, tỉnh/thành và nguồn chính thức.' } });
          return false;
        }
        const trungMa = get().doiTacThamKhao.some(
          (muc) =>
            muc.ma.toLocaleUpperCase('vi') === ma && (muc.id ?? muc.ma) !== doiTac.id,
        );
        if (trungMa) {
          set({ bao: { loai: 'canh', chu: `Mã ${ma} đã được dùng cho một đầu mối khác.` } });
          return false;
        }
        const banGhi: DoiTacThamKhao = {
          ...doiTac,
          id: doiTac.id ?? ma,
          ma,
          ten,
          tenNgan: doiTac.tenNgan?.trim() || null,
          tinhThanh: doiTac.tinhThanh.trim(),
          website: doiTac.website?.trim() || null,
          hinhThuc: [...new Set(doiTac.hinhThuc.map((hinhThuc) => hinhThuc.trim()).filter(Boolean))],
          nguonUrl: doiTac.nguonUrl.trim(),
          nguonTieuDe: doiTac.nguonTieuDe.trim(),
          ghiChu: doiTac.ghiChu?.trim() || null,
          hoatDong: doiTac.hoatDong ?? true,
          archivedAt: doiTac.archivedAt ?? null,
        };
        set((state) => ({
          doiTacThamKhao: state.doiTacThamKhao.some((muc) => muc.ma === banGhi.ma)
            ? state.doiTacThamKhao.map((muc) => (muc.ma === banGhi.ma ? banGhi : muc))
            : [banGhi, ...state.doiTacThamKhao],
          bao: { loai: 'ok', chu: `Đã lưu đầu mối ${banGhi.ten}.` },
        }));
        return true;
      },

      luuTruDoiTacThamKhao: (ma) =>
        set((state) => ({
          doiTacThamKhao: state.doiTacThamKhao.map((doiTac) =>
            doiTac.ma === ma
              ? { ...doiTac, hoatDong: false, archivedAt: new Date().toISOString() }
              : doiTac,
          ),
          bao: { loai: 'ok', chu: 'Đã lưu trữ đầu mối; lịch sử được giữ nguyên.' },
        })),

      khoiPhucDoiTacThamKhao: (ma) =>
        set((state) => ({
          doiTacThamKhao: state.doiTacThamKhao.map((doiTac) =>
            doiTac.ma === ma ? { ...doiTac, hoatDong: true, archivedAt: null } : doiTac,
          ),
          bao: { loai: 'ok', chu: 'Đã khôi phục đầu mối.' },
        })),

      napLaiMau: () => set({ ...khoiTao() }),
    }),
    {
      name: 'phoenix-tuyensinh-demo',
      version: 1,
      merge: hopNhatKhoDaLuu,
    },
  ),
);
