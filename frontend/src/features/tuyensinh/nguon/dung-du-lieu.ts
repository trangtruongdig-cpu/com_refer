/**
 * MỘT cửa duy nhất để màn hình lấy dữ liệu và gọi hành động.
 *
 * Màn hình không biết dữ liệu đến từ localStorage hay từ API: chúng gọi các
 * hook ở đây. Đổi nguồn là đổi biến môi trường `VITE_TUYENSINH_NGUON`, không
 * phải sửa màn hình.
 *
 * Khác biệt quan trọng giữa hai nguồn:
 *
 *   demo — các hook tính tiền chạy `tinh-toan.ts` ngay trong trình duyệt.
 *   api  — các hook tính tiền chỉ NHẬN SỐ từ máy chủ. Frontend không tính lại
 *          tiền: client sửa được, nên client không được quyết định số tiền.
 *
 * Phần `api` dưới đây đã viết theo lược đồ Zod và Prisma của backend nhưng
 * CHƯA CHẠY ĐỐI CHIẾU với máy chủ thật. Khi backend bật, kiểm từng hook, sửa
 * hình dạng ở `anh-xa.ts` nếu lệch, rồi bỏ ghi chú này.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import * as apiTs from '@/api/tuyensinh.api';
import { CHUONG_TRINH, type ChuongTrinh } from '../du-lieu/danh-muc';
import type { NhanSu } from '../du-lieu/nhan-su';
import type { KhoanCoCau } from '../engine/quy-chi';
import type { KetQuaSoat } from '../engine/tran-chi';
import type { DongMoPhong, ThamSoCoChe } from '../engine/ung-truoc';
import { useKho, type GhiNhanThu, type NhapHoSo } from '../kho/kho.store';
import type { DotDoiSoat, HoSo, KyLuong, LanThu, TaiKhoan } from '../kho/kho.types';
import {
  bangLuongThang,
  ghepLanThu,
  soCongNoCuaNhanSu,
  soatChuongTrinh,
  tongHopThang,
  type BangLuongThang,
  type LanThuDayDu,
  type TongHopThang,
} from '../tinh-toan';
import { chuongTrinhTuApi, dotTuApi, hoSoTuApi, lanThuTuApi, taiKhoanTuApi } from './anh-xa';
import { laApi } from './nguon';

/** Thời gian coi dữ liệu còn tươi. Tiền thì không cache lâu. */
const TUOI = 15_000;

// ---------------------------------------------------------------------------
// Danh mục
// ---------------------------------------------------------------------------

export function useDanhMuc(): { chuongTrinh: readonly ChuongTrinh[]; dangTai: boolean } {
  const q = useQuery({
    queryKey: ['tuyensinh', 'chuong-trinh'],
    queryFn: async () => (await apiTs.layChuongTrinh()).map(chuongTrinhTuApi),
    enabled: laApi,
    staleTime: 5 * 60_000,
  });
  return {
    chuongTrinh: laApi ? (q.data ?? []) : CHUONG_TRINH,
    dangTai: laApi && q.isLoading,
  };
}

export function useChuongTrinh(ma: string): ChuongTrinh | undefined {
  const { chuongTrinh } = useDanhMuc();
  return chuongTrinh.find((c) => c.ma === ma);
}

// ---------------------------------------------------------------------------
// Dữ liệu nền
// ---------------------------------------------------------------------------

export interface DuLieu {
  hoSo: readonly HoSo[];
  lanThu: readonly LanThu[];
  dotDoiSoat: readonly DotDoiSoat[];
  taiKhoan: readonly TaiKhoan[];
  coCau: readonly KhoanCoCau[];
  thamSoCoChe: ThamSoCoChe;
  kyLuong: readonly KyLuong[];
  tatCa: readonly LanThuDayDu[];
  dangTai: boolean;
}

export function useDuLieu(): DuLieu {
  // Kho luôn được đọc: ở nguồn api nó chỉ còn giữ cơ cấu, tham số cơ chế và
  // thông báo — phần sẽ chuyển sang bảng tham số của máy chủ ở bước sau.
  const khoHoSo = useKho((s) => s.hoSo);
  const khoLanThu = useKho((s) => s.lanThu);
  const khoDot = useKho((s) => s.dotDoiSoat);
  const khoTaiKhoan = useKho((s) => s.taiKhoan);
  const coCau = useKho((s) => s.coCau);
  const thamSoCoChe = useKho((s) => s.thamSoCoChe);
  const kyLuong = useKho((s) => s.kyLuong);

  const qHoSo = useQuery({
    queryKey: ['tuyensinh', 'ho-so'],
    queryFn: async () => (await apiTs.layHoSo({ limit: 100 })).ds.map(hoSoTuApi),
    enabled: laApi,
    staleTime: TUOI,
  });
  const qLanThu = useQuery({
    queryKey: ['tuyensinh', 'lan-thu'],
    queryFn: async () => (await apiTs.layLanThu()).map(lanThuTuApi),
    enabled: laApi,
    staleTime: TUOI,
  });
  const qDot = useQuery({
    queryKey: ['tuyensinh', 'dot-doi-soat'],
    queryFn: async () => {
      const [ds, lt] = await Promise.all([apiTs.layDotDoiSoat(), apiTs.layLanThu()]);
      return ds.map((d) =>
        dotTuApi(
          d,
          lt.filter((x) => x.dotDoiSoatId === d.id).map((x) => x.ma),
        ),
      );
    },
    enabled: laApi,
    staleTime: TUOI,
  });
  const qTaiKhoan = useQuery({
    queryKey: ['tuyensinh', 'tai-khoan'],
    queryFn: async () => (await apiTs.layTaiKhoan()).map(taiKhoanTuApi),
    enabled: laApi,
    staleTime: 5 * 60_000,
  });

  // Bọc useMemo để tham chiếu ổn định: `?? []` tạo mảng mới mỗi lần render,
  // kéo theo `tatCa` tính lại và cả cây màn hình vẽ lại không cần thiết.
  const hoSo = useMemo(() => (laApi ? (qHoSo.data ?? []) : khoHoSo), [qHoSo.data, khoHoSo]);
  const lanThu = useMemo(
    () => (laApi ? (qLanThu.data ?? []) : khoLanThu),
    [qLanThu.data, khoLanThu],
  );
  const dotDoiSoat = useMemo(() => (laApi ? (qDot.data ?? []) : khoDot), [qDot.data, khoDot]);
  const taiKhoan = useMemo(
    () => (laApi ? (qTaiKhoan.data ?? []) : khoTaiKhoan),
    [qTaiKhoan.data, khoTaiKhoan],
  );

  const tatCa = useMemo(() => ghepLanThu(hoSo, lanThu, dotDoiSoat), [hoSo, lanThu, dotDoiSoat]);

  return {
    hoSo,
    lanThu,
    dotDoiSoat,
    taiKhoan,
    coCau,
    thamSoCoChe,
    kyLuong,
    tatCa,
    dangTai: laApi && (qHoSo.isLoading || qLanThu.isLoading || qDot.isLoading),
  };
}

// ---------------------------------------------------------------------------
// Hành động
// ---------------------------------------------------------------------------

export interface HanhDong {
  /** `tepThat` chỉ dùng ở nguồn api: tải lên theo đúng thứ tự `nhap.tep`. */
  lapHoSo: (nhap: NhapHoSo, tepThat?: readonly File[]) => Promise<string | null>;
  ghiNhanThu: (vao: GhiNhanThu) => Promise<boolean>;
  taoDotDoiSoat: (truongMa: string, lanThuMa: string[]) => Promise<void>;
  danhDauNhanTien: (dotMa: string) => Promise<void>;
  themTaiKhoan: (tk: Omit<TaiKhoan, 'id'>) => Promise<void>;
  capNhatCoCau: (ppmTheoMa: Record<string, number>) => boolean;
  capNhatCoChe: (ts: ThamSoCoChe) => void;
  luuKyLuong: (ky: KyLuong) => boolean;
  chotKyLuong: (thang: string) => boolean;
  napLaiMau: () => void;
}

export function useHanhDong(): HanhDong {
  const kho = useKho();
  const hoSo = useKho((s) => s.hoSo);
  const dot = useKho((s) => s.dotDoiSoat);
  const qc = useQueryClient();

  const lamMoi = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['tuyensinh'] });
  }, [qc]);

  const bat = useCallback(
    async <T>(viec: () => Promise<T>, loi: string): Promise<T | null> => {
      try {
        const ra = await viec();
        lamMoi();
        return ra;
      } catch {
        kho.datBao({ loai: 'loi', chu: loi });
        return null;
      }
    },
    [kho, lamMoi],
  );

  return useMemo<HanhDong>(
    () => ({
      lapHoSo: async (nhap, tepThat) => {
        if (!laApi) return kho.lapHoSo(nhap);
        const ra = await bat(
          () => apiTs.taoHoSo({ ...nhap, tep: [...nhap.tep] }),
          'Không lưu được hồ sơ.',
        );
        if (!ra) return null;
        // Tải tệp sau khi có hồ sơ: một tệp hỏng không làm mất cả hồ sơ đã nhập
        for (const [i, tep] of (tepThat ?? []).entries()) {
          const muc = nhap.tep[i]?.muc ?? '';
          const xong = await bat(
            () => apiTs.taiTepHoSo(ra.id, muc, tep),
            `Không tải lên được ${tep.name}. Đính kèm lại sau.`,
          );
          if (!xong) break;
        }
        kho.datBao({ loai: 'ok', chu: `Đã lưu hồ sơ ${ra.ma}` });
        return ra.ma;
      },

      ghiNhanThu: async (vao) => {
        if (!laApi) return kho.ghiNhanThu(vao) !== null;
        const hs = hoSo.find((h) => h.ma === vao.hoSoMa);
        const ra = await bat(
          () =>
            apiTs.ghiNhanThu(hs?.id ?? vao.hoSoMa, {
              soChungTu: vao.soChungTu,
              taiKhoanId: vao.taiKhoanId,
              bienLaiTen: vao.bienLaiTen,
            }),
          'Không ghi nhận được khoản thu.',
        );
        if (ra) kho.datBao({ loai: 'ok', chu: `Đã ghi nhận thu kỳ ${ra.kyThu}` });
        return ra !== null;
      },

      taoDotDoiSoat: async (truongMa, lanThuMa) => {
        if (!laApi) return kho.taoDotDoiSoat(truongMa, lanThuMa);
        await bat(
          () => apiTs.taoDotDoiSoat({ truongMa, lanThuIds: lanThuMa }),
          'Không lập được đợt đối soát.',
        );
      },

      danhDauNhanTien: async (dotMa) => {
        if (!laApi) return kho.danhDauNhanTien(dotMa);
        const d = dot.find((x) => x.ma === dotMa);
        await bat(() => apiTs.khopDotDoiSoat(d?.id ?? dotMa), 'Không khớp được đợt đối soát.');
      },

      themTaiKhoan: async (tk) => {
        if (!laApi) return kho.themTaiKhoan(tk);
        await bat(() => apiTs.taoTaiKhoan(tk), 'Không thêm được tài khoản.');
      },

      // Bàn van và kỳ lương còn chạy ở kho: bước sau chuyển sang bảng tham số
      // và endpoint /ky-luong của máy chủ.
      capNhatCoCau: kho.capNhatCoCau,
      capNhatCoChe: kho.capNhatCoChe,
      luuKyLuong: kho.luuKyLuong,
      chotKyLuong: kho.chotKyLuong,
      napLaiMau: kho.napLaiMau,
    }),
    [bat, dot, hoSo, kho],
  );
}

// ---------------------------------------------------------------------------
// Các hook TÍNH TIỀN
// ---------------------------------------------------------------------------

export function useTongHopThang(nhanSuId: string | null, thang: string): TongHopThang {
  const { tatCa, hoSo } = useDuLieu();
  const q = useQuery({
    queryKey: ['tuyensinh', 'doanh-so', thang, nhanSuId],
    queryFn: () => apiTs.layDoanhSo(thang, nhanSuId ?? undefined) as Promise<TongHopThang>,
    enabled: laApi,
    staleTime: TUOI,
  });
  const cucBo = useMemo(
    () => tongHopThang(tatCa, hoSo, nhanSuId, thang),
    [tatCa, hoSo, nhanSuId, thang],
  );
  return laApi ? (q.data ?? cucBo) : cucBo;
}

export function useSoCongNo(nhanSuId: string, den: string): DongMoPhong[] {
  const { tatCa, hoSo, thamSoCoChe } = useDuLieu();
  const q = useQuery({
    queryKey: ['tuyensinh', 'so-cong-no', nhanSuId, den],
    queryFn: () => apiTs.laySoCongNo(nhanSuId, den) as Promise<DongMoPhong[]>,
    enabled: laApi,
    staleTime: TUOI,
  });
  const cucBo = useMemo(
    () => soCongNoCuaNhanSu(tatCa, hoSo, nhanSuId, den, thamSoCoChe),
    [tatCa, hoSo, nhanSuId, den, thamSoCoChe],
  );
  return laApi ? (q.data ?? cucBo) : cucBo;
}

export function useBangLuong(toi: NhanSu, thang: string): BangLuongThang {
  const { tatCa, hoSo, thamSoCoChe, coCau } = useDuLieu();
  const q = useQuery({
    queryKey: ['tuyensinh', 'ky-luong', thang],
    queryFn: () => apiTs.layKyLuong(thang) as Promise<BangLuongThang>,
    enabled: laApi,
    staleTime: TUOI,
  });
  const cucBo = useMemo(
    () => bangLuongThang(tatCa, hoSo, toi, thang, thamSoCoChe, coCau),
    [tatCa, hoSo, toi, thang, thamSoCoChe, coCau],
  );
  return laApi ? (q.data ?? cucBo) : cucBo;
}

export function useSoatTran(ct: ChuongTrinh | undefined, soHoSoThang: number): KetQuaSoat | null {
  const { coCau } = useDuLieu();
  const q = useQuery({
    queryKey: ['tuyensinh', 'tran-chi', ct?.ma, soHoSoThang],
    queryFn: () => apiTs.laySoatTran(ct!.ma, String(soHoSoThang)) as Promise<KetQuaSoat>,
    enabled: laApi && !!ct,
    staleTime: 60_000,
  });
  const cucBo = useMemo(
    () => (ct ? soatChuongTrinh(ct, coCau, soHoSoThang) : null),
    [ct, coCau, soHoSoThang],
  );
  return laApi ? (q.data ?? cucBo) : cucBo;
}
