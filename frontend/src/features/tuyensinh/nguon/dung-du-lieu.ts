/**
 * MỘT cửa duy nhất để màn hình lấy dữ liệu và gọi hành động.
 *
 * Màn hình không biết dữ liệu đến từ localStorage hay từ API: chúng gọi các
 * hook ở đây. Đổi nguồn là đổi biến môi trường `VITE_TUYENSINH_NGUON`.
 *
 * Khác biệt quan trọng giữa hai nguồn:
 *
 *   demo — các hook tính tiền chạy `tinh-toan.ts` ngay trong trình duyệt.
 *   api  — các hook tính tiền chỉ NHẬN SỐ từ máy chủ. Frontend không tính lại
 *          tiền: client sửa được, nên client không được quyết định số tiền.
 *
 * Đường dẫn và hình dạng đã đối chiếu với `backend/src/modules/tuyensinh`,
 * nhưng CHƯA chạy thử với máy chủ đang bật.
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
  thangNay,
  tongHopThang,
  type BangLuongThang,
  type LanThuDayDu,
  type TongHopThang,
} from '../tinh-toan';
import {
  bangLuongTuApi,
  chuongTrinhTuApi,
  dotTuApi,
  hoSoTuApi,
  kyLuongTomTatTuApi,
  lanThuTuApi,
  soCongNoTuKyLuong,
  soatTuApi,
  taiKhoanTuApi,
  tongHopTuBangLuong,
  tongQuanTuApi,
} from './anh-xa';
import { laApi } from './nguon';

/** Thời gian coi dữ liệu còn tươi. Tiền thì không cache lâu. */
const TUOI = 15_000;

// ---------------------------------------------------------------------------
// Danh mục
// ---------------------------------------------------------------------------

export function useDanhMuc(): { chuongTrinh: readonly ChuongTrinh[]; dangTai: boolean } {
  const q = useQuery({
    queryKey: ['tuyensinh', 'danh-muc'],
    queryFn: async () => (await apiTs.layDanhMuc()).map(chuongTrinhTuApi),
    enabled: laApi,
    staleTime: 5 * 60_000,
  });
  return { chuongTrinh: laApi ? (q.data ?? []) : CHUONG_TRINH, dangTai: laApi && q.isLoading };
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
  // Kho vẫn được đọc ở cả hai nguồn: cơ cấu quỹ chi và tham số cơ chế hiện còn
  // nằm ở đây, chờ chuyển sang `/tham-so` của máy chủ.
  const khoHoSo = useKho((s) => s.hoSo);
  const khoLanThu = useKho((s) => s.lanThu);
  const khoDot = useKho((s) => s.dotDoiSoat);
  const khoTaiKhoan = useKho((s) => s.taiKhoan);
  const coCau = useKho((s) => s.coCau);
  const thamSoCoChe = useKho((s) => s.thamSoCoChe);
  const khoKyLuong = useKho((s) => s.kyLuong);

  const qHoSo = useQuery({
    queryKey: ['tuyensinh', 'ho-so'],
    queryFn: async () => (await apiTs.layHoSo({ limit: 100 })).ds.map(hoSoTuApi),
    enabled: laApi,
    staleTime: TUOI,
  });
  const qLanThu = useQuery({
    queryKey: ['tuyensinh', 'lan-thu'],
    queryFn: async () => await apiTs.layLanThu({ limit: 500 }),
    enabled: laApi,
    staleTime: TUOI,
  });
  const qDot = useQuery({
    queryKey: ['tuyensinh', 'dot-doi-soat'],
    queryFn: apiTs.layDotDoiSoat,
    enabled: laApi,
    staleTime: TUOI,
  });
  const qKyLuong = useQuery({
    queryKey: ['tuyensinh', 'ky-luong'],
    queryFn: async () => (await apiTs.layDsKyLuong()).map(kyLuongTomTatTuApi),
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
  const lanThuApi = useMemo(() => qLanThu.data ?? [], [qLanThu.data]);
  const lanThu = useMemo(
    () => (laApi ? lanThuApi.map(lanThuTuApi) : khoLanThu),
    [lanThuApi, khoLanThu],
  );
  const dotDoiSoat = useMemo(
    () =>
      laApi
        ? (qDot.data ?? []).map((d) =>
            dotTuApi(
              d,
              lanThuApi.filter((l) => l.dot?.ma === d.ma).map((l) => l.ma),
            ),
          )
        : khoDot,
    [qDot.data, lanThuApi, khoDot],
  );
  const kyLuong = useMemo(
    () => (laApi ? (qKyLuong.data ?? []) : khoKyLuong),
    [qKyLuong.data, khoKyLuong],
  );
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
  /**
   * `tepThat` hiện chỉ dùng ở nguồn demo để hiện tên tệp. Backend chưa có
   * endpoint tải nội dung tệp lên, nên nguồn api chỉ gửi siêu dữ liệu.
   */
  lapHoSo: (nhap: NhapHoSo, tepThat?: readonly File[]) => Promise<string | null>;
  ghiNhanThu: (vao: GhiNhanThu) => Promise<boolean>;
  taoDotDoiSoat: (truongMa: string, lanThuMa: string[]) => Promise<void>;
  danhDauNhanTien: (dotMa: string) => Promise<void>;
  themTaiKhoan: (tk: Omit<TaiKhoan, 'id'>) => Promise<void>;
  capNhatCoCau: (ppmTheoMa: Record<string, number>) => boolean;
  capNhatCoChe: (ts: ThamSoCoChe) => void;
  /** Ở nguồn api, máy chủ tự chụp ảnh tham số và tính; `kyDemo` chỉ dùng ở demo. */
  tinhKyLuong: (thang: string, kyDemo: KyLuong) => Promise<boolean>;
  chotKyLuong: (thang: string) => Promise<boolean>;
  napLaiMau: () => void;
}

export function useHanhDong(): HanhDong {
  const kho = useKho();
  // Phải lấy hồ sơ từ lớp nguồn, KHÔNG từ kho demo: ở nguồn api mỗi hồ sơ có
  // khoá uuid của máy chủ, và POST /ho-so/:id/lan-thu chỉ nhận uuid đó. Lấy
  // nhầm kho demo thì gửi lên mã HS… và máy chủ trả 422.
  const { dotDoiSoat, lanThu, hoSo } = useDuLieu();
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
      lapHoSo: async (nhap) => {
        if (!laApi) return kho.lapHoSo(nhap);
        // Chỉ gửi siêu dữ liệu tệp: backend chưa nhận nội dung tệp
        const ra = await bat(
          () => apiTs.taoHoSo({ ...nhap, tep: [...nhap.tep] }),
          'Không lưu được hồ sơ.',
        );
        if (!ra) return null;
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
        if (ra) kho.datBao({ loai: 'ok', chu: ra.ghiChu });
        return ra !== null;
      },

      taoDotDoiSoat: async (truongMa, lanThuMa) => {
        if (!laApi) return kho.taoDotDoiSoat(truongMa, lanThuMa);
        const ids = lanThuMa
          .map((ma) => lanThu.find((l) => l.ma === ma)?.id)
          .filter((x): x is string => !!x);
        const ra = await bat(
          () => apiTs.taoDotDoiSoat({ truongMa, lanThuIds: ids }),
          'Không lập được đợt đối soát.',
        );
        if (ra) kho.datBao({ loai: 'tin', chu: ra.ghiChu });
      },

      danhDauNhanTien: async (dotMa) => {
        if (!laApi) return kho.danhDauNhanTien(dotMa);
        const d = dotDoiSoat.find((x) => x.ma === dotMa);
        const ra = await bat(
          () => apiTs.nhanTienDot(d?.id ?? dotMa),
          'Không xác nhận được tiền về.',
        );
        if (ra) kho.datBao({ loai: 'ok', chu: ra.ghiChu });
      },

      themTaiKhoan: async (tk) => {
        if (!laApi) return kho.themTaiKhoan(tk);
        const ra = await bat(() => apiTs.taoTaiKhoan(tk), 'Không thêm được tài khoản.');
        if (ra) kho.datBao({ loai: 'ok', chu: 'Đã thêm tài khoản nhận tiền.' });
      },

      tinhKyLuong: async (thang, kyDemo) => {
        if (!laApi) return kho.luuKyLuong(kyDemo);
        const ra = await bat(() => apiTs.tinhKyLuong(thang), 'Không tính được kỳ lương.');
        if (ra) kho.datBao({ loai: 'ok', chu: `Đã tính kỳ lương ${thang}.` });
        return ra !== null;
      },

      chotKyLuong: async (thang) => {
        if (!laApi) return kho.chotKyLuong(thang);
        const ra = await bat(
          () => apiTs.chotKyLuong(thang),
          'Không chốt được kỳ lương — có thể đang vượt trần chi.',
        );
        if (ra) {
          kho.datBao({ loai: 'ok', chu: `Đã chốt kỳ lương ${thang}. Kỳ đã chốt không sửa được.` });
        }
        return ra !== null;
      },

      // Bàn van cơ cấu và tham số cơ chế còn chạy ở kho ở cả hai nguồn: máy chủ
      // mới có endpoint ĐỌC `/tham-so`, chưa có endpoint ghi.
      capNhatCoCau: kho.capNhatCoCau,
      capNhatCoChe: kho.capNhatCoChe,
      napLaiMau: kho.napLaiMau,
    }),
    [bat, dotDoiSoat, hoSo, kho, lanThu],
  );
}

// ---------------------------------------------------------------------------
// Các hook TÍNH TIỀN
// ---------------------------------------------------------------------------

export function useTongHopThang(nhanSuId: string | null, thang: string): TongHopThang {
  const { tatCa, hoSo } = useDuLieu();
  const laThangNay = thang === thangNay();

  // Tháng hiện tại có /tong-quan; tháng cũ lấy từ kỳ lương đã tính của tháng đó.
  const qNay = useQuery({
    queryKey: ['tuyensinh', 'tong-quan'],
    queryFn: apiTs.layTongQuan,
    enabled: laApi && laThangNay,
    staleTime: TUOI,
  });
  const qKy = useQuery({
    queryKey: ['tuyensinh', 'ky-luong', thang],
    queryFn: () => apiTs.layKyLuong(thang),
    enabled: laApi && !laThangNay,
    retry: false,
    staleTime: TUOI,
  });

  const qKyNay = useQuery({
    queryKey: ['tuyensinh', 'ky-luong', thang],
    queryFn: () => apiTs.layKyLuong(thang),
    enabled: laApi && laThangNay,
    retry: false,
    staleTime: TUOI,
  });

  // Ở nguồn api, máy chủ ĐÃ lọc theo phạm vi phụ trách (NV thấy mình, TN thấy
  // nhóm, TP thấy phòng). Lọc lại theo một người nữa là lọc hai lần: trưởng
  // phòng sẽ thấy bảng rỗng trong khi số tổng vẫn chạy.
  const cucBo = useMemo(
    () => tongHopThang(tatCa, hoSo, laApi ? null : nhanSuId, thang),
    [tatCa, hoSo, nhanSuId, thang],
  );
  if (!laApi) return cucBo;
  if (laThangNay) {
    // `/tong-quan` không trả quyền lợi của riêng người này — lấy ở dòng bảng lương
    const dong = nhanSuId ? qKyNay.data?.bang.find((x) => x.nhanSuMa === nhanSuId) : undefined;
    return qNay.data ? tongQuanTuApi(qNay.data, cucBo, dong?.quyenLoi) : cucBo;
  }
  return (qKy.data ? tongHopTuBangLuong(qKy.data, nhanSuId, cucBo) : null) ?? cucBo;
}

export function useSoCongNo(nhanSuId: string, den: string): DongMoPhong[] {
  const { tatCa, hoSo, thamSoCoChe } = useDuLieu();

  // Máy chủ chưa có endpoint sổ công nợ riêng: dựng từ các kỳ lương đã tính.
  const q = useQuery({
    queryKey: ['tuyensinh', 'so-cong-no', nhanSuId, den],
    queryFn: async () => {
      const ds = await apiTs.layDsKyLuong();
      const cacKy = await Promise.all(
        ds.filter((k) => k.thang <= den).map((k) => apiTs.layKyLuong(k.thang)),
      );
      return soCongNoTuKyLuong(cacKy, nhanSuId);
    },
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
    queryFn: () => apiTs.layKyLuong(thang),
    enabled: laApi,
    retry: false,
    staleTime: TUOI,
  });
  const cucBo = useMemo(
    () => bangLuongThang(tatCa, hoSo, toi, thang, thamSoCoChe, coCau),
    [tatCa, hoSo, toi, thang, thamSoCoChe, coCau],
  );
  return laApi ? (q.data ? bangLuongTuApi(q.data, toi.phong) : cucBo) : cucBo;
}

export function useSoatTran(ct: ChuongTrinh | undefined, soHoSoThang: number): KetQuaSoat | null {
  const { coCau } = useDuLieu();
  const q = useQuery({
    queryKey: ['tuyensinh', 'tran-chi', ct?.ma, soHoSoThang],
    queryFn: () => apiTs.laySoatTran(ct!.ma, String(soHoSoThang)),
    enabled: laApi && !!ct,
    staleTime: 60_000,
  });
  const cucBo = useMemo(
    () => (ct ? soatChuongTrinh(ct, coCau, soHoSoThang) : null),
    [ct, coCau, soHoSoThang],
  );
  return laApi ? (q.data ? soatTuApi(q.data, soHoSoThang) : cucBo) : cucBo;
}
