/**
 * Nơi DUY NHẤT module tuyển sinh làm việc với Prisma.
 *
 * Quy ước ở biên: TIỀN trong cơ sở dữ liệu là `BIGINT`, còn engine tính tiền
 * dùng `number` (an toàn tới 9·10^15 đồng, dư sức cho VND). Chuyển đổi xảy ra
 * ĐÚNG MỘT LẦN ở đây, bằng `so()`, nên không có BigInt nào lọt ra tới JSON —
 * `res.json` không serialize được BigInt và sẽ ném lỗi lúc chạy.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CauTrucHocPhi } from './engine/quy-chi';
import type { QuyTac } from './engine/quy-tac';

/** BigInt → number. Đồng đều ở một chỗ để không lẫn hai kiểu trong service. */
export const so = (v: bigint): number => Number(v);

const ngayISO = (d: Date): string => d.toISOString().slice(0, 10);

export interface ChuongTrinhDay extends CauTrucHocPhi {
  id: string;
  ma: string;
  truongMa: string;
  truongTen: string;
  truongPhoenix: boolean;
  he: string;
  maNganh: string;
  tenNganh: string;
  tuTrinhDo: string;
  thoiLuongThang: number;
  treThang: number;
  nganhSucKhoe: boolean;
  daDoiChieu: boolean;
}

type ChuongTrinhRow = Prisma.ChuongTrinhGetPayload<{ include: { truong: true } }>;

function mapChuongTrinh(c: ChuongTrinhRow): ChuongTrinhDay {
  return {
    id: c.id,
    ma: c.ma,
    truongMa: c.truong.ma,
    truongTen: c.truong.ten,
    truongPhoenix: c.truong.laPhoenix,
    he: c.he,
    maNganh: c.maNganh,
    tenNganh: c.tenNganh,
    tuTrinhDo: c.tuTrinhDo,
    thoiLuongThang: c.thoiLuongThang,
    treThang: c.truong.treThang,
    nganhSucKhoe: c.nganhSucKhoe,
    daDoiChieu: c.daDoiChieu,
    // Phần CauTrucHocPhi mà engine cần
    hocPhiKy: so(c.hocPhiKy),
    tyLeTrichPpm: c.tyLeTrichPpm,
    thuePpm: c.thuePpm,
    dinhMucKy: so(c.dinhMucKy),
    soKy: c.soKy,
  };
}

/** Điều kiện khoảng hiệu lực: `hieu_luc_tu <= ngay < hieu_luc_den`. */
const conHieuLuc = (ngay: Date) => ({
  hieuLucTu: { lte: ngay },
  OR: [{ hieuLucDen: null }, { hieuLucDen: { gt: ngay } }],
});

export const tuyenSinhRepository = {
  // ---------------- nhân sự & phạm vi phụ trách ----------------

  nhanSuTheoUser(userId: string) {
    return prisma.nhanSu.findUnique({ where: { userId }, include: { donVi: true } });
  },

  nhanSuTheoMa(ma: string) {
    return prisma.nhanSu.findUnique({ where: { ma }, include: { donVi: true } });
  },

  /**
   * Nhân sự trong phạm vi phụ trách — quyết định quyền XEM (LOGIC.md §4).
   * NV: chính mình. TN: cán bộ cùng nhóm. TP: mọi nhóm thuộc phòng. ADMIN: tất cả.
   */
  async phamViPhuTrach(nhanSu: { id: string; vaiTro: string; donViId: string }): Promise<string[]> {
    if (nhanSu.vaiTro === 'ADMIN') {
      const tatCa = await prisma.nhanSu.findMany({ select: { id: true } });
      return tatCa.map((n) => n.id);
    }
    if (nhanSu.vaiTro === 'NV') return [nhanSu.id];
    if (nhanSu.vaiTro === 'TN') {
      const cungNhom = await prisma.nhanSu.findMany({
        where: { donViId: nhanSu.donViId },
        select: { id: true },
      });
      return cungNhom.map((n) => n.id);
    }
    // TP: phạm vi là các Nhóm treo dưới Phòng của mình, cộng chính mình
    const nhom = await prisma.donVi.findMany({
      where: { chaId: nhanSu.donViId },
      select: { id: true },
    });
    const trongPhong = await prisma.nhanSu.findMany({
      where: { donViId: { in: [...nhom.map((d) => d.id), nhanSu.donViId] } },
      select: { id: true },
    });
    return trongPhong.map((n) => n.id);
  },

  danhSachNhanSu() {
    return prisma.nhanSu.findMany({
      where: { hoatDong: true },
      include: { donVi: { include: { cha: true } } },
      orderBy: [{ vaiTro: 'asc' }, { ma: 'asc' }],
    });
  },

  // ---------------- danh mục ----------------

  async danhMuc(): Promise<ChuongTrinhDay[]> {
    const rows = await prisma.chuongTrinh.findMany({
      include: { truong: true },
      orderBy: [{ truong: { ma: 'asc' } }, { ma: 'asc' }],
    });
    return rows.map(mapChuongTrinh);
  },

  async chuongTrinhTheoMa(ma: string): Promise<ChuongTrinhDay | null> {
    const row = await prisma.chuongTrinh.findUnique({ where: { ma }, include: { truong: true } });
    return row ? mapChuongTrinh(row) : null;
  },

  truongs() {
    return prisma.truong.findMany({ orderBy: { ma: 'asc' } });
  },

  taiKhoans() {
    return prisma.taiKhoan.findMany({ where: { hoatDong: true }, orderBy: { tenChu: 'asc' } });
  },

  taoTaiKhoan(data: Prisma.TaiKhoanCreateInput) {
    return prisma.taiKhoan.create({ data });
  },

  // ---------------- tham số theo hiệu lực ----------------

  async coCau(ngay: Date) {
    const rows = await prisma.coCauQuyChi.findMany({
      where: conHieuLuc(ngay),
      orderBy: { ppm: 'desc' },
    });
    return rows.map((k) => ({
      ma: k.ma,
      ten: k.ten,
      ppm: k.ppm,
      theoHoaDon: k.theoHoaDon,
      hieuLucTu: ngayISO(k.hieuLucTu),
    }));
  },

  async dauViec(ngay: Date) {
    const rows = await prisma.dauViec.findMany({
      where: conHieuLuc(ngay),
      orderBy: [{ trongSoPpm: 'desc' }, { ma: 'asc' }],
    });
    // Engine nhận trọng số dạng phân số; cơ sở dữ liệu lưu ppm để tổng kiểm được
    return rows.map((d) => ({
      ma: d.ma,
      ten: d.ten,
      trongSo: d.trongSoPpm / 1_000_000,
      trongSoPpm: d.trongSoPpm,
    }));
  },

  async bieuLuongMem(ngay: Date) {
    const b = await prisma.bieuLuyTien.findFirst({
      where: { ma: 'LUONG_MEM_CB', ...conHieuLuc(ngay) },
      include: { bac: { orderBy: { nguongTu: 'asc' } } },
    });
    if (!b) return null;
    return {
      ma: b.ma,
      ten: b.ten,
      hieuLucTu: ngayISO(b.hieuLucTu),
      hieuLucDen: b.hieuLucDen ? ngayISO(b.hieuLucDen) : null,
      ghiChu: b.ghiChu,
      bac: b.bac.map((x) => [so(x.nguongTu), x.ppm] as [number, number]),
    };
  },

  /** Mọi phiên bản biểu — màn Quản trị cần thấy cả bản đã đóng khoảng. */
  async moiBieuLuongMem() {
    const rows = await prisma.bieuLuyTien.findMany({
      where: { ma: 'LUONG_MEM_CB' },
      include: { bac: { orderBy: { nguongTu: 'asc' } } },
      orderBy: { hieuLucTu: 'desc' },
    });
    return rows.map((b) => ({
      ma: b.ma,
      ten: b.ten,
      hieuLucTu: ngayISO(b.hieuLucTu),
      hieuLucDen: b.hieuLucDen ? ngayISO(b.hieuLucDen) : null,
      ghiChu: b.ghiChu,
      bac: b.bac.map((x) => [so(x.nguongTu), x.ppm] as [number, number]),
    }));
  },

  async thuongNguong(ngay: Date) {
    const rows = await prisma.thuongNguong.findMany({
      where: conHieuLuc(ngay),
      orderBy: { nguongTu: 'asc' },
    });
    return rows.map((t) => [so(t.nguongTu), so(t.soTien)] as [number, number]);
  },

  async quyTac(ngay: Date): Promise<QuyTac[]> {
    const rows = await prisma.quyTacTinhTien.findMany({
      where: conHieuLuc(ngay),
      include: { bac: { orderBy: { nguongTu: 'asc' } } },
    });
    return rows.map((q) => ({
      ma: q.ma,
      vaiTro: q.vaiTro,
      phamVi: {
        ...(q.phamViNganh ? { nganh: q.phamViNganh } : {}),
        ...(q.phamViTruong ? { truong: q.phamViTruong } : {}),
        ...(q.phamViHe ? { he: q.phamViHe } : {}),
      },
      coSo: q.coSo,
      loaiGiaTri: q.loaiGiaTri,
      cachXacDinh: q.cachXacDinh,
      ...(q.giaTriPpm === null ? {} : { giaTriPpm: q.giaTriPpm }),
      ...(q.soTien === null ? {} : { soTien: so(q.soTien) }),
      bacSoLuong: q.bac
        .filter((b) => b.loai === 'SO_LUONG')
        .map((b) => [so(b.nguongTu), b.ppm] as [number, number]),
      bacTien: q.bac
        .filter((b) => b.loai === 'TIEN')
        .map((b) => [so(b.nguongTu), b.ppm] as [number, number]),
      tranPpm: q.tranPpm,
      hieuLucTu: ngayISO(q.hieuLucTu),
      hieuLucDen: q.hieuLucDen ? ngayISO(q.hieuLucDen) : null,
      ghiChu: q.ghiChu,
    }));
  },

  async thamSoCoChe(ngay: Date) {
    const r = await prisma.thamSoCoChe.findFirst({
      where: conHieuLuc(ngay),
      orderBy: { hieuLucTu: 'desc' },
    });
    return r ? { mucSan: so(r.mucSan), chiTieuHoSo: r.chiTieuHoSo, hieuLucTu: ngayISO(r.hieuLucTu) } : null;
  },

  giaDinh() {
    return prisma.giaDinh.findMany({ orderBy: { so: 'asc' } });
  },

  // ---------------- hồ sơ ----------------

  async hoSoTrang(params: {
    nhanSuIds: string[];
    skip: number;
    take: number;
    search?: string | undefined;
    trangThai?: Prisma.HoSoWhereInput['trangThai'];
    chuongTrinhMa?: string | undefined;
  }) {
    const where: Prisma.HoSoWhereInput = {
      nhanSuId: { in: params.nhanSuIds },
      ...(params.trangThai ? { trangThai: params.trangThai } : {}),
      ...(params.chuongTrinhMa ? { chuongTrinh: { ma: params.chuongTrinhMa } } : {}),
      ...(params.search
        ? {
            OR: [
              { hoTen: { contains: params.search, mode: 'insensitive' } },
              { ma: { contains: params.search, mode: 'insensitive' } },
              { soCccd: { contains: params.search } },
              { dienThoai: { contains: params.search } },
            ],
          }
        : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.hoSo.findMany({
        where,
        include: {
          chuongTrinh: { include: { truong: true } },
          nhanSu: true,
          lanThu: { orderBy: { kyThu: 'asc' } },
        },
        orderBy: { ngayLap: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.hoSo.count({ where }),
    ]);
    return { items, total };
  },

  hoSoTheoId(id: string) {
    return prisma.hoSo.findUnique({
      where: { id },
      include: {
        chuongTrinh: { include: { truong: true } },
        nhanSu: true,
        lanThu: { orderBy: { kyThu: 'asc' } },
        tep: true,
      },
    });
  },

  async maHoSoKeTiep(): Promise<string> {
    const nam = new Date().getFullYear().toString().slice(2);
    const dem = await prisma.hoSo.count();
    return `HS${nam}${String(dem + 1).padStart(5, '0')}`;
  },

  taoHoSo(data: Prisma.HoSoUncheckedCreateInput) {
    return prisma.hoSo.create({ data, include: { chuongTrinh: true } });
  },

  // ---------------- lần thu & đối soát ----------------

  async maLanThuKeTiep(): Promise<string> {
    const dem = await prisma.lanThu.count();
    const nam = new Date().getFullYear().toString().slice(2);
    return `LT${nam}${String(dem + 1).padStart(6, '0')}`;
  },

  taoLanThu(data: Prisma.LanThuUncheckedCreateInput) {
    return prisma.lanThu.create({ data });
  },

  lanThus(params: {
    nhanSuIds: string[];
    trangThai?: Prisma.LanThuWhereInput['trangThai'];
    truongMa?: string | undefined;
    chuaCoDot?: boolean | undefined;
    take: number;
  }) {
    return prisma.lanThu.findMany({
      where: {
        nhanSuId: { in: params.nhanSuIds },
        ...(params.trangThai ? { trangThai: params.trangThai } : {}),
        ...(params.chuaCoDot ? { dotDoiSoatId: null } : {}),
        ...(params.truongMa
          ? { hoSo: { chuongTrinh: { truong: { ma: params.truongMa } } } }
          : {}),
      },
      include: {
        hoSo: { include: { chuongTrinh: { include: { truong: true } } } },
        nhanSu: true,
        dotDoiSoat: true,
      },
      orderBy: { ngayThu: 'desc' },
      take: params.take,
    });
  },

  dotDoiSoats() {
    return prisma.dotDoiSoat.findMany({
      include: {
        truong: true,
        lanThu: { include: { hoSo: { include: { chuongTrinh: true } } } },
      },
      orderBy: { ngayLap: 'desc' },
    });
  },

  dotTheoId(id: string) {
    return prisma.dotDoiSoat.findUnique({ where: { id }, include: { truong: true, lanThu: true } });
  },

  async maDotKeTiep(): Promise<string> {
    const dem = await prisma.dotDoiSoat.count();
    const n = new Date();
    return `DS${n.getFullYear().toString().slice(2)}${String(n.getMonth() + 1).padStart(2, '0')}${String(dem + 1).padStart(3, '0')}`;
  },

  /**
   * Lập đợt và gán lần thu trong MỘT giao dịch. Đợt mới luôn CHUA_NHAN_TIEN —
   * trạng thái lần thu KHÔNG đổi ở bước này, vì tiền chưa về.
   */
  taoDot(data: { ma: string; truongId: string; ngayLap: Date; ghiChu: string; lanThuIds: string[] }) {
    return prisma.$transaction(async (tx) => {
      const dot = await tx.dotDoiSoat.create({
        data: {
          ma: data.ma,
          truongId: data.truongId,
          ngayLap: data.ngayLap,
          ghiChu: data.ghiChu,
          trangThai: 'CHUA_NHAN_TIEN',
        },
      });
      await tx.lanThu.updateMany({
        where: { id: { in: data.lanThuIds }, dotDoiSoatId: null },
        data: { dotDoiSoatId: dot.id },
      });
      return dot;
    });
  },

  /**
   * Đánh dấu đợt đã nhận tiền. Trigger `trg_dot_lan_toa_nhan_tien` tự chuyển
   * các lần thu trong đợt sang DA_NHAN_TIEN — đây là mốc quỹ chi được lập.
   */
  nhanTien(id: string, ngayNhanTien: Date) {
    return prisma.dotDoiSoat.update({
      where: { id },
      data: { trangThai: 'DA_NHAN_TIEN', ngayNhanTien },
      include: { truong: true, lanThu: true },
    });
  },

  // ---------------- kỳ lương ----------------

  kyLuongs() {
    return prisma.kyLuong.findMany({
      include: { bang: { include: { nhanSu: true } } },
      orderBy: { thang: 'desc' },
    });
  },

  kyLuongTheoThang(thang: string) {
    return prisma.kyLuong.findUnique({
      where: { thang },
      include: { bang: { include: { nhanSu: { include: { donVi: true } } } } },
    });
  },

  /** Hồ sơ mới trong khoảng tháng, nhóm theo cán bộ. */
  hoSoMoiTrongThang(tu: Date, den: Date, nhanSuIds: string[]) {
    return prisma.hoSo.groupBy({
      by: ['nhanSuId'],
      where: { ngayLap: { gte: tu, lt: den }, nhanSuId: { in: nhanSuIds } },
      _count: { _all: true },
    });
  },

  /** Lần thu GHI NHẬN trong tháng — đây là doanh số, tiền chưa chắc đã về. */
  lanThuGhiNhanTrongThang(tu: Date, den: Date, nhanSuIds: string[]) {
    return prisma.lanThu.findMany({
      where: { ngayThu: { gte: tu, lt: den }, nhanSuId: { in: nhanSuIds } },
      include: { hoSo: { include: { chuongTrinh: { include: { truong: true } } } } },
    });
  },

  /**
   * Lần thu có TIỀN VỀ trong tháng — mốc quỹ chi được lập, nên đây mới là cơ sở
   * tính quyền lợi. Lọc theo `ngay_nhan_tien` của ĐỢT, không theo ngày thu.
   */
  lanThuTienVeTrongThang(tu: Date, den: Date, nhanSuIds: string[]) {
    return prisma.lanThu.findMany({
      where: {
        nhanSuId: { in: nhanSuIds },
        trangThai: 'DA_NHAN_TIEN',
        dotDoiSoat: { trangThai: 'DA_NHAN_TIEN', ngayNhanTien: { gte: tu, lt: den } },
      },
      include: { hoSo: { include: { chuongTrinh: { include: { truong: true } } } } },
    });
  },

  /** Nợ ứng trước cuối kỳ gần nhất ĐÃ CHỐT trước tháng này — nợ cuốn sang. */
  async noDauKy(thang: string, nhanSuIds: string[]): Promise<Map<string, number>> {
    const truoc = await prisma.kyLuong.findFirst({
      where: { thang: { lt: thang }, trangThai: 'DA_CHOT' },
      include: { bang: true },
      orderBy: { thang: 'desc' },
    });
    const m = new Map<string, number>();
    for (const id of nhanSuIds) m.set(id, 0);
    for (const d of truoc?.bang ?? []) {
      if (m.has(d.nhanSuId)) m.set(d.nhanSuId, so(d.noCuoiKy));
    }
    return m;
  },

  /** Lưu kỳ lương: xoá bảng cũ rồi ghi lại. Trigger chặn nếu kỳ đã chốt. */
  luuKyLuong(
    thang: string,
    tong: {
      snapshot: Prisma.InputJsonValue;
      tongThucNhan: bigint;
      thuLaoTn: bigint;
      thuLaoTp: bigint;
      quyChiPhatSinh: bigint;
      vuotTran: boolean;
    },
    bang: Omit<Prisma.BangLuongDongUncheckedCreateInput, 'kyLuongId'>[],
  ) {
    return prisma.$transaction(async (tx) => {
      const ky = await tx.kyLuong.upsert({
        where: { thang },
        update: tong,
        create: { thang, ...tong },
      });
      await tx.bangLuongDong.deleteMany({ where: { kyLuongId: ky.id } });
      if (bang.length > 0) {
        await tx.bangLuongDong.createMany({
          data: bang.map((d) => ({ ...d, kyLuongId: ky.id })),
        });
      }
      return tx.kyLuong.findUniqueOrThrow({
        where: { id: ky.id },
        include: { bang: { include: { nhanSu: { include: { donVi: true } } } } },
      });
    });
  },

  chotKyLuong(thang: string) {
    return prisma.kyLuong.update({
      where: { thang },
      data: { trangThai: 'DA_CHOT', ngayChot: new Date() },
      include: { bang: { include: { nhanSu: { include: { donVi: true } } } } },
    });
  },
};

export type TuyenSinhRepository = typeof tuyenSinhRepository;
