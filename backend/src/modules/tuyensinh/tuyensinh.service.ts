/**
 * Nghiệp vụ tuyển sinh. MÁY CHỦ LÀ NƠI QUYẾT ĐỊNH SỐ TIỀN.
 *
 * Không nhận số tiền từ client ở bất kỳ đâu: học phí lấy từ chương trình trong
 * cơ sở dữ liệu, tỷ lệ lấy từ bảng quy tắc đang hiệu lực, và mọi phép tính đi
 * qua engine đã kiểm thử. Client chỉ gửi "thu kỳ tiếp theo của hồ sơ này" —
 * không gửi "thu 11 triệu".
 *
 * Hai mốc thời gian không được lẫn (LOGIC.md §2.4):
 *   • DOANH SỐ ghi nhận lúc học viên đóng tiền  → `ngay_thu`
 *   • QUỸ CHI lập khi đối tác chuyển tiền về    → `dot.ngay_nhan_tien`
 * Quyền lợi của cán bộ tính trên mốc thứ hai, không phải mốc thứ nhất.
 */
import type { Prisma } from '@prisma/client';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/app-error';
import { buildPaginationMeta, getPagination, type PaginationMeta } from '../../utils/pagination';
import { luyTien, nguongKeTiep, thuongNguong as tinhThuongNguong } from './engine/luy-tien';
import {
  chiaCoCau,
  chiaDauViec,
  doanhSoQuyDoiMotKy,
  heSoQuyDoi,
  hocPhiToanKhoa,
  kiemBaoToan,
  nopDoiTacMotKy,
  pv,
  quyChiMotKy,
  thueMotKy,
  tienTrichMotKy,
} from './engine/quy-chi';
import { chonQuyTac, tinhTheoQuyTac } from './engine/quy-tac';
import { soatMoiBac } from './engine/tran-chi';
import { soCongNo } from './engine/ung-truoc';
import { so, tuyenSinhRepository as repo } from './tuyensinh.repository';
import type {
  CreateDotInput,
  CreateHoSoInput,
  GhiNhanThuInput,
  ListHoSoQuery,
  ListLanThuQuery,
  TaoTaiKhoanInput,
  TranChiQuery,
} from './tuyensinh.schema';

interface Requester {
  id: string;
  role: 'ADMIN' | 'USER';
}

const ngayISO = (d: Date): string => d.toISOString().slice(0, 10);
const ngayTu = (s: string | undefined): Date => (s ? new Date(`${s}T00:00:00.000Z`) : new Date());

/** Mốc đầu và cuối (mở) của một tháng `YYYY-MM`, theo UTC. */
function khoangThang(thang: string): { tu: Date; den: Date } {
  const [y, m] = thang.split('-').map(Number);
  return {
    tu: new Date(Date.UTC(y!, m! - 1, 1)),
    den: new Date(Date.UTC(y!, m!, 1)),
  };
}

/**
 * Nhân sự đang đăng nhập cộng phạm vi phụ trách. Một tài khoản không gắn với
 * nhân sự nào thì không có dữ liệu tuyển sinh để xem — kể cả ADMIN hệ thống,
 * trừ khi tài khoản đó được gắn vào một nhân sự vai trò ADMIN.
 */
async function boiCanhNguoiDung(requester: Requester) {
  const nhanSu = await repo.nhanSuTheoUser(requester.id);
  if (!nhanSu) {
    throw new ForbiddenError(
      'Tài khoản này chưa được gắn với nhân sự tuyển sinh nào. Quản trị cần gắn nhân sự trước.',
      'CHUA_GAN_NHAN_SU',
    );
  }
  const phamVi = await repo.phamViPhuTrach(nhanSu);
  return { nhanSu, phamVi };
}

/** Bối cảnh áp quy tắc của một lần thu: ngành/trường/hệ để chọn quy tắc cụ thể nhất. */
const dichQuyTac = (ct: { ma: string; truongMa: string; he: string }) => ({
  nganh: ct.ma,
  truong: ct.truongMa,
  he: ct.he,
});

export const tuyenSinhService = {
  async toiLa(requester: Requester) {
    const { nhanSu, phamVi } = await boiCanhNguoiDung(requester);
    return {
      id: nhanSu.id,
      ma: nhanSu.ma,
      hoTen: nhanSu.hoTen,
      vaiTro: nhanSu.vaiTro,
      donVi: { ma: nhanSu.donVi.ma, ten: nhanSu.donVi.ten, cap: nhanSu.donVi.cap },
      soNhanSuTrongPhamVi: phamVi.length,
      quyenHeThong: requester.role,
    };
  },

  async nhanSu(requester: Requester) {
    const { phamVi } = await boiCanhNguoiDung(requester);
    const ds = await repo.danhSachNhanSu();
    // Chỉ trả về người trong phạm vi phụ trách
    return ds
      .filter((n) => phamVi.includes(n.id))
      .map((n) => ({
        id: n.id,
        ma: n.ma,
        hoTen: n.hoTen,
        vaiTro: n.vaiTro,
        nhom: n.donVi.ten,
        phong: n.donVi.cha?.ten ?? n.donVi.ten,
      }));
  },

  /**
   * Danh mục kèm MỌI con số dẫn xuất, tính ở máy chủ: quỹ chi, PV, hệ số quy
   * đổi, doanh số quy đổi. Giao diện chỉ hiển thị, không tự tính lại — hai nơi
   * tính là hai cơ hội lệch nhau.
   */
  async danhMuc() {
    const ds = await repo.danhMuc();
    return ds.map((c) => ({
      ma: c.ma,
      truongMa: c.truongMa,
      truongTen: c.truongTen,
      truongPhoenix: c.truongPhoenix,
      he: c.he,
      maNganh: c.maNganh,
      tenNganh: c.tenNganh,
      tuTrinhDo: c.tuTrinhDo,
      thoiLuongThang: c.thoiLuongThang,
      treThang: c.treThang,
      nganhSucKhoe: c.nganhSucKhoe,
      daDoiChieu: c.daDoiChieu,
      soKy: c.soKy,
      hocPhiKy: c.hocPhiKy,
      hocPhiToanKhoa: hocPhiToanKhoa(c),
      tyLeTrichPpm: c.tyLeTrichPpm,
      thuePpm: c.thuePpm,
      dinhMucKy: c.dinhMucKy,
      tienTrichKy: tienTrichMotKy(c),
      thueKy: thueMotKy(c),
      nopDoiTacKy: nopDoiTacMotKy(c),
      quyChiKy: quyChiMotKy(c),
      pv: pv(c),
      heSoQuyDoi: heSoQuyDoi(c),
      doanhSoQuyDoiKy: doanhSoQuyDoiMotKy(c),
      baoToan: kiemBaoToan(c),
    }));
  },

  /** Toàn bộ tham số đang hiệu lực tại một ngày + bảng giả định §15. */
  async thamSo(ngayStr: string | undefined) {
    const ngay = ngayTu(ngayStr);
    const [coCau, dauViec, bieu, moiBieu, thuong, quyTac, coChe, giaDinh] = await Promise.all([
      repo.coCau(ngay),
      repo.dauViec(ngay),
      repo.bieuLuongMem(ngay),
      repo.moiBieuLuongMem(),
      repo.thuongNguong(ngay),
      repo.quyTac(ngay),
      repo.thamSoCoChe(ngay),
      repo.giaDinh(),
    ]);
    return {
      ngay: ngayISO(ngay),
      coCau,
      tongCoCauPpm: coCau.reduce((t, k) => t + k.ppm, 0),
      dauViec,
      tongDauViecPpm: dauViec.reduce((t, d) => t + d.trongSoPpm, 0),
      bieuLuongMem: bieu,
      moiBieuLuongMem: moiBieu,
      thuongNguong: thuong,
      quyTac,
      thamSoCoChe: coChe,
      giaDinh,
    };
  },

  /** Chia quỹ chi của một chương trình theo cơ cấu và 11 đầu việc. */
  async coCauCuaChuongTrinh(chuongTrinhMa: string, ngayStr: string | undefined) {
    const ct = await repo.chuongTrinhTheoMa(chuongTrinhMa);
    if (!ct) throw new NotFoundError('Không tìm thấy chương trình', 'KHONG_CO_CHUONG_TRINH');
    const ngay = ngayTu(ngayStr);
    const [coCau, dauViec] = await Promise.all([repo.coCau(ngay), repo.dauViec(ngay)]);
    const quyChi = quyChiMotKy(ct);
    const chia = chiaCoCau(quyChi, coCau);
    const mangLuoi = chia.find((x) => x.khoan.ma === 'KHOAN_MANG_LUOI')?.soTien ?? 0;
    return {
      chuongTrinhMa: ct.ma,
      tenNganh: ct.tenNganh,
      truongTen: ct.truongTen,
      quyChiKy: quyChi,
      coCau: chia.map((x) => ({ ...x.khoan, soTien: x.soTien })),
      tongChiaCoCau: chia.reduce((t, x) => t + x.soTien, 0),
      khoanMangLuoi: mangLuoi,
      dauViec: chiaDauViec(mangLuoi, dauViec).map((x) => ({
        ma: x.dauViec.ma,
        ten: x.dauViec.ten,
        trongSo: x.dauViec.trongSo,
        soTien: x.soTien,
      })),
    };
  },

  /** Soát trần chi ở nhiều bậc số lượng hồ sơ (LOGIC.md §3.2). */
  async tranChi(q: TranChiQuery) {
    const ct = await repo.chuongTrinhTheoMa(q.chuongTrinhMa);
    if (!ct) throw new NotFoundError('Không tìm thấy chương trình', 'KHONG_CO_CHUONG_TRINH');
    const ngay = ngayTu(q.ngay);
    const [coCau, quyTac] = await Promise.all([repo.coCau(ngay), repo.quyTac(ngay)]);
    const cacBac = q.bac
      .split(',')
      .map((x) => Number.parseInt(x.trim(), 10))
      .filter((x) => Number.isInteger(x) && x >= 0);
    if (cacBac.length === 0) throw new BadRequestError('Danh sách bậc không hợp lệ', 'BAC_SAI');

    const ketQua = soatMoiBac(
      {
        cauTruc: ct,
        dsQuyTac: quyTac,
        coCau,
        dich: { ...dichQuyTac(ct), ngay: ngayISO(ngay) },
      },
      cacBac,
    );
    return {
      chuongTrinhMa: ct.ma,
      tenNganh: ct.tenNganh,
      truongTen: ct.truongTen,
      ngay: ngayISO(ngay),
      quyChiKy: quyChiMotKy(ct),
      bac: ketQua.map((r) => ({ soHoSoThang: r.soHoSoThang, ...r.ketQua })),
      coBacVuotTran: ketQua.some((r) => r.ketQua.vuotTran),
    };
  },

  // ---------------- hồ sơ ----------------

  async listHoSo(
    requester: Requester,
    query: ListHoSoQuery,
  ): Promise<{ items: unknown[]; meta: PaginationMeta }> {
    const { phamVi } = await boiCanhNguoiDung(requester);
    let nhanSuIds = phamVi;
    if (query.nhanSuMa) {
      const ns = await repo.nhanSuTheoMa(query.nhanSuMa);
      if (!ns || !phamVi.includes(ns.id)) {
        throw new ForbiddenError('Cán bộ này ngoài phạm vi phụ trách của bạn', 'NGOAI_PHAM_VI');
      }
      nhanSuIds = [ns.id];
    }

    const { skip, take } = getPagination(query);
    const { items, total } = await repo.hoSoTrang({
      nhanSuIds,
      skip,
      take,
      search: query.search,
      trangThai: query.trangThai,
      chuongTrinhMa: query.chuongTrinhMa,
    });

    return {
      items: items.map((h) => {
        const ct = {
          hocPhiKy: so(h.chuongTrinh.hocPhiKy),
          tyLeTrichPpm: h.chuongTrinh.tyLeTrichPpm,
          thuePpm: h.chuongTrinh.thuePpm,
          dinhMucKy: so(h.chuongTrinh.dinhMucKy),
          soKy: h.chuongTrinh.soKy,
        };
        return {
          id: h.id,
          ma: h.ma,
          hoTen: h.hoTen,
          ngaySinh: h.ngaySinh ? ngayISO(h.ngaySinh) : null,
          soCccd: h.soCccd,
          dienThoai: h.dienThoai,
          email: h.email,
          diaChi: h.diaChi,
          trinhDo: h.trinhDo,
          ghiChu: h.ghiChu,
          ngayLap: ngayISO(h.ngayLap),
          trangThai: h.trangThai,
          kyDaThu: h.kyDaThu,
          soKy: h.chuongTrinh.soKy,
          chuongTrinhMa: h.chuongTrinh.ma,
          tenNganh: h.chuongTrinh.tenNganh,
          truongTen: h.chuongTrinh.truong.ten,
          he: h.chuongTrinh.he,
          hocPhiKy: ct.hocPhiKy,
          quyChiKy: quyChiMotKy(ct),
          canBo: { ma: h.nhanSu.ma, hoTen: h.nhanSu.hoTen },
          lanThu: h.lanThu.map((l) => ({
            id: l.id,
            ma: l.ma,
            kyThu: l.kyThu,
            ngayThu: ngayISO(l.ngayThu),
            soTien: so(l.soTien),
            soChungTu: l.soChungTu,
            trangThai: l.trangThai,
            coDot: l.dotDoiSoatId !== null,
          })),
        };
      }),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async taoHoSo(requester: Requester, input: CreateHoSoInput) {
    const { nhanSu } = await boiCanhNguoiDung(requester);
    const ct = await repo.chuongTrinhTheoMa(input.chuongTrinhMa);
    if (!ct) throw new NotFoundError('Không tìm thấy chương trình', 'KHONG_CO_CHUONG_TRINH');

    const ma = await repo.maHoSoKeTiep();
    const hs = await repo.taoHoSo({
      ma,
      chuongTrinhId: ct.id,
      hoTen: input.hoTen,
      ngaySinh: input.ngaySinh ? new Date(`${input.ngaySinh}T00:00:00.000Z`) : null,
      soCccd: input.soCccd,
      dienThoai: input.dienThoai,
      email: input.email,
      diaChi: input.diaChi,
      trinhDo: input.trinhDo,
      noiCongTac: input.noiCongTac,
      ghiChu: input.ghiChu,
      // Hồ sơ luôn thuộc về cán bộ đang đăng nhập — không nhận nhanSuId từ client
      nhanSuId: nhanSu.id,
      ngayLap: new Date(),
      trangThai: 'CHO_THANH_TOAN',
      ...(input.tep.length > 0 ? { tep: { create: input.tep } } : {}),
    });
    return { id: hs.id, ma: hs.ma, hoTen: hs.hoTen, chuongTrinhMa: ct.ma };
  },

  /**
   * Ghi nhận thu kỳ KẾ TIẾP. Số tiền và số kỳ do máy chủ suy ra; cơ sở dữ liệu
   * còn chặn thêm lần nữa (chứng từ rỗng, vượt số kỳ, trùng kỳ).
   */
  async ghiNhanThu(requester: Requester, hoSoId: string, input: GhiNhanThuInput) {
    const { phamVi } = await boiCanhNguoiDung(requester);
    const hs = await repo.hoSoTheoId(hoSoId);
    if (!hs) throw new NotFoundError('Không tìm thấy hồ sơ', 'KHONG_CO_HO_SO');
    if (!phamVi.includes(hs.nhanSuId)) {
      throw new ForbiddenError('Hồ sơ này ngoài phạm vi phụ trách của bạn', 'NGOAI_PHAM_VI');
    }
    if (hs.trangThai === 'THOI_HOC') {
      throw new BadRequestError('Hồ sơ đã thôi học — không ghi nhận thu', 'HO_SO_THOI_HOC');
    }

    const kyThu = hs.lanThu.length + 1;
    if (kyThu > hs.chuongTrinh.soKy) {
      throw new BadRequestError(
        `Hồ sơ đã đóng đủ ${hs.chuongTrinh.soKy} kỳ học phí toàn khoá`,
        'DU_HOC_PHI',
      );
    }

    const ma = await repo.maLanThuKeTiep();
    const lt = await repo.taoLanThu({
      ma,
      hoSoId: hs.id,
      kyThu,
      ngayThu: input.ngayThu ? new Date(`${input.ngayThu}T00:00:00.000Z`) : new Date(),
      // Số tiền LẤY TỪ CHƯƠNG TRÌNH, không lấy từ client
      soTien: hs.chuongTrinh.hocPhiKy,
      soChungTu: input.soChungTu,
      bienLaiTen: input.bienLaiTen,
      taiKhoanId: input.taiKhoanId,
      // Cán bộ hưởng là chủ hồ sơ, không phải người bấm nút
      nhanSuId: hs.nhanSuId,
      dotDoiSoatId: null,
      // Doanh số ghi nhận ngay, nhưng TIỀN CHƯA VỀ TRƯỜNG
      trangThai: 'CHO_DOI_SOAT',
    });
    return {
      id: lt.id,
      ma: lt.ma,
      kyThu: lt.kyThu,
      soTien: so(lt.soTien),
      ngayThu: ngayISO(lt.ngayThu),
      trangThai: lt.trangThai,
      ghiChu: 'Đã ghi nhận doanh số. Quỹ chi CHƯA được lập — chờ đối tác chuyển tiền về.',
    };
  },

  async listLanThu(requester: Requester, q: ListLanThuQuery) {
    const { phamVi } = await boiCanhNguoiDung(requester);
    const ds = await repo.lanThus({
      nhanSuIds: phamVi,
      trangThai: q.trangThai,
      truongMa: q.truongMa,
      chuaCoDot: q.chuaCoDot,
      take: q.limit,
    });
    return ds.map((l) => ({
      id: l.id,
      ma: l.ma,
      kyThu: l.kyThu,
      ngayThu: ngayISO(l.ngayThu),
      soTien: so(l.soTien),
      soChungTu: l.soChungTu,
      trangThai: l.trangThai,
      hoSoMa: l.hoSo.ma,
      hocVien: l.hoSo.hoTen,
      chuongTrinhMa: l.hoSo.chuongTrinh.ma,
      tenNganh: l.hoSo.chuongTrinh.tenNganh,
      truongMa: l.hoSo.chuongTrinh.truong.ma,
      truongTen: l.hoSo.chuongTrinh.truong.ten,
      canBo: { ma: l.nhanSu.ma, hoTen: l.nhanSu.hoTen },
      dot: l.dotDoiSoat ? { id: l.dotDoiSoat.id, ma: l.dotDoiSoat.ma, trangThai: l.dotDoiSoat.trangThai } : null,
    }));
  },

  // ---------------- đối soát ----------------

  async listDot() {
    const ds = await repo.dotDoiSoats();
    return ds.map((d) => ({
      id: d.id,
      ma: d.ma,
      truongMa: d.truong.ma,
      truongTen: d.truong.ten,
      ngayLap: ngayISO(d.ngayLap),
      ngayNhanTien: d.ngayNhanTien ? ngayISO(d.ngayNhanTien) : null,
      trangThai: d.trangThai,
      ghiChu: d.ghiChu,
      soLanThu: d.lanThu.length,
      tongHocPhi: d.lanThu.reduce((t, l) => t + so(l.soTien), 0),
      // Quỹ chi chỉ CÓ THẬT khi đợt đã nhận tiền; trước đó đây là số dự kiến
      quyChiDuKien: d.lanThu.reduce(
        (t, l) =>
          t +
          quyChiMotKy({
            hocPhiKy: so(l.hoSo.chuongTrinh.hocPhiKy),
            tyLeTrichPpm: l.hoSo.chuongTrinh.tyLeTrichPpm,
            thuePpm: l.hoSo.chuongTrinh.thuePpm,
            dinhMucKy: so(l.hoSo.chuongTrinh.dinhMucKy),
            soKy: l.hoSo.chuongTrinh.soKy,
          }),
        0,
      ),
    }));
  },

  async taoDot(requester: Requester, input: CreateDotInput) {
    const { nhanSu } = await boiCanhNguoiDung(requester);
    if (nhanSu.vaiTro === 'NV') {
      throw new ForbiddenError('Chỉ trưởng nhóm, trưởng phòng hoặc quản trị lập được đợt đối soát', 'KHONG_DU_QUYEN');
    }
    const truong = (await repo.truongs()).find((t) => t.ma === input.truongMa);
    if (!truong) throw new NotFoundError('Không tìm thấy trường', 'KHONG_CO_TRUONG');

    const ma = await repo.maDotKeTiep();
    const dot = await repo.taoDot({
      ma,
      truongId: truong.id,
      ngayLap: new Date(),
      ghiChu: input.ghiChu,
      lanThuIds: input.lanThuIds,
    });
    return {
      id: dot.id,
      ma: dot.ma,
      trangThai: dot.trangThai,
      ghiChu: 'Đã lập đợt. Quỹ chi CHƯA được lập — chờ xác nhận tiền thật về.',
    };
  },

  async nhanTien(requester: Requester, dotId: string, ngayNhanTien: string | undefined) {
    const { nhanSu } = await boiCanhNguoiDung(requester);
    // Xác nhận tiền về là mốc sinh ra quỹ chi — chỉ trưởng phòng và quản trị
    if (nhanSu.vaiTro !== 'TP' && nhanSu.vaiTro !== 'ADMIN') {
      throw new ForbiddenError(
        'Chỉ trưởng phòng hoặc quản trị xác nhận được tiền về — đây là mốc lập quỹ chi',
        'KHONG_DU_QUYEN',
      );
    }
    const dot = await repo.dotTheoId(dotId);
    if (!dot) throw new NotFoundError('Không tìm thấy đợt đối soát', 'KHONG_CO_DOT');
    if (dot.trangThai === 'DA_NHAN_TIEN') {
      throw new BadRequestError('Đợt này đã nhận tiền', 'DA_NHAN_TIEN');
    }
    const d = await repo.nhanTien(
      dotId,
      ngayNhanTien ? new Date(`${ngayNhanTien}T00:00:00.000Z`) : new Date(),
    );
    return {
      id: d.id,
      ma: d.ma,
      trangThai: d.trangThai,
      ngayNhanTien: d.ngayNhanTien ? ngayISO(d.ngayNhanTien) : null,
      soLanThuChuyenTrangThai: d.lanThu.length,
      ghiChu: 'Tiền đã về — quỹ chi của các kỳ thu trong đợt được lập.',
    };
  },

  async taiKhoans() {
    const ds = await repo.taiKhoans();
    return ds.map((t) => ({
      id: t.id,
      tenChu: t.tenChu,
      tenNganHang: t.tenNganHang,
      bin: t.bin,
      soTaiKhoan: t.soTaiKhoan,
    }));
  },

  async taoTaiKhoan(requester: Requester, input: TaoTaiKhoanInput) {
    const { nhanSu } = await boiCanhNguoiDung(requester);
    if (nhanSu.vaiTro !== 'ADMIN') {
      throw new ForbiddenError('Chỉ quản trị khai được tài khoản nhận tiền', 'KHONG_DU_QUYEN');
    }
    const t = await repo.taoTaiKhoan(input);
    return { id: t.id, tenChu: t.tenChu, soTaiKhoan: t.soTaiKhoan };
  },

  // ---------------- kỳ lương ----------------

  async listKyLuong() {
    const ds = await repo.kyLuongs();
    return ds.map((k) => ({
      thang: k.thang,
      trangThai: k.trangThai,
      ngayMo: k.ngayMo.toISOString(),
      ngayChot: k.ngayChot?.toISOString() ?? null,
      tongThucNhan: so(k.tongThucNhan),
      thuLaoTn: so(k.thuLaoTn),
      thuLaoTp: so(k.thuLaoTp),
      quyChiPhatSinh: so(k.quyChiPhatSinh),
      vuotTran: k.vuotTran,
      soDong: k.bang.length,
    }));
  },

  async xemKyLuong(thang: string) {
    const k = await repo.kyLuongTheoThang(thang);
    if (!k) throw new NotFoundError(`Chưa tính kỳ lương ${thang}`, 'CHUA_CO_KY_LUONG');
    return {
      thang: k.thang,
      trangThai: k.trangThai,
      ngayMo: k.ngayMo.toISOString(),
      ngayChot: k.ngayChot?.toISOString() ?? null,
      tongThucNhan: so(k.tongThucNhan),
      thuLaoTn: so(k.thuLaoTn),
      thuLaoTp: so(k.thuLaoTp),
      quyChiPhatSinh: so(k.quyChiPhatSinh),
      vuotTran: k.vuotTran,
      snapshot: k.snapshot,
      bang: k.bang
        .map((d) => ({
          nhanSuMa: d.nhanSu.ma,
          hoTen: d.nhanSu.hoTen,
          vaiTro: d.nhanSu.vaiTro,
          nhom: d.nhanSu.donVi.ten,
          soHoSoMoi: d.soHoSoMoi,
          soKyThu: d.soKyThu,
          hocPhiThucThu: so(d.hocPhiThucThu),
          doanhSoQuyDoi: so(d.doanhSoQuyDoi),
          luongMem: so(d.luongMem),
          thuongNguong: so(d.thuongNguong),
          quyenLoi: so(d.quyenLoi),
          ungThem: so(d.ungThem),
          thuHoi: so(d.thuHoi),
          thucNhan: so(d.thucNhan),
          noCuoiKy: so(d.noCuoiKy),
          nhanh: d.nhanh,
        }))
        .sort((a, b) => b.thucNhan - a.thucNhan || a.nhanSuMa.localeCompare(b.nhanSuMa)),
    };
  },

  /**
   * Tính (hoặc tính lại) kỳ lương một tháng.
   *
   * Trước khi tính, CHỤP ẢNH toàn bộ tham số vào `snapshot` để kỳ này tính lại
   * được y nguyên sau khi chính sách đổi (LOGIC.md §9, §10). Kỳ đã chốt thì
   * trigger ở cơ sở dữ liệu chặn ghi — không cần kiểm lại ở đây, nhưng vẫn báo
   * lỗi sớm cho người dùng hiểu vì sao.
   */
  async tinhKyLuong(requester: Requester, thang: string) {
    const { nhanSu } = await boiCanhNguoiDung(requester);
    if (nhanSu.vaiTro !== 'TP' && nhanSu.vaiTro !== 'ADMIN') {
      throw new ForbiddenError('Chỉ trưởng phòng hoặc quản trị tính được kỳ lương', 'KHONG_DU_QUYEN');
    }
    const daCo = await repo.kyLuongTheoThang(thang);
    if (daCo?.trangThai === 'DA_CHOT') {
      throw new BadRequestError(
        `Kỳ lương ${thang} đã chốt — bất biến. Sai sót đi qua bút toán điều chỉnh ở kỳ sau.`,
        'KY_DA_CHOT',
      );
    }

    const { tu, den } = khoangThang(thang);
    // Tham số lấy tại NGÀY CUỐI của tháng tính — chính sách hiệu lực giữa tháng
    // vẫn áp cho kỳ đó, giống cách kế toán chốt theo cuối kỳ.
    const ngayThamSo = new Date(den.getTime() - 86_400_000);

    const [coCau, quyTac, bieu, thuongBang, coChe, moiNhanSu] = await Promise.all([
      repo.coCau(ngayThamSo),
      repo.quyTac(ngayThamSo),
      repo.bieuLuongMem(ngayThamSo),
      repo.thuongNguong(ngayThamSo),
      repo.thamSoCoChe(ngayThamSo),
      repo.danhSachNhanSu(),
    ]);
    if (!coChe) {
      throw new BadRequestError(
        `Chưa có tham số cơ chế lương hiệu lực tại ${ngayISO(ngayThamSo)}`,
        'THIEU_THAM_SO_CO_CHE',
      );
    }

    // Kỳ lương tính cho TOÀN phòng, không theo phạm vi người bấm
    const moiId = moiNhanSu.map((n) => n.id);
    const [hoSoMoi, thuTrongThang, tienVe, noDau] = await Promise.all([
      repo.hoSoMoiTrongThang(tu, den, moiId),
      repo.lanThuGhiNhanTrongThang(tu, den, moiId),
      repo.lanThuTienVeTrongThang(tu, den, moiId),
      repo.noDauKy(thang, moiId),
    ]);

    const demHoSo = new Map(hoSoMoi.map((g) => [g.nhanSuId, g._count._all]));

    const cauTrucCua = (ct: {
      hocPhiKy: bigint;
      tyLeTrichPpm: number;
      thuePpm: number;
      dinhMucKy: bigint;
      soKy: number;
    }) => ({
      hocPhiKy: so(ct.hocPhiKy),
      tyLeTrichPpm: ct.tyLeTrichPpm,
      thuePpm: ct.thuePpm,
      dinhMucKy: so(ct.dinhMucKy),
      soKy: ct.soKy,
    });

    // --- Doanh số quy đổi và học phí thực thu: theo lần thu GHI NHẬN trong tháng
    const doanhSo = new Map<string, number>();
    const hocPhi = new Map<string, number>();
    const soKy = new Map<string, number>();
    for (const l of thuTrongThang) {
      const c = cauTrucCua(l.hoSo.chuongTrinh);
      doanhSo.set(l.nhanSuId, (doanhSo.get(l.nhanSuId) ?? 0) + doanhSoQuyDoiMotKy(c));
      hocPhi.set(l.nhanSuId, (hocPhi.get(l.nhanSuId) ?? 0) + so(l.soTien));
      soKy.set(l.nhanSuId, (soKy.get(l.nhanSuId) ?? 0) + 1);
    }

    // --- Quyền lợi: theo lần thu CÓ TIỀN VỀ trong tháng, qua quy tắc của vai trò
    const quyenLoi = new Map<string, number>();
    let quyChiPhatSinh = 0;
    let thuLaoTn = 0;
    let thuLaoTp = 0;
    let coBiChan = false;

    const nhanSuTheoId = new Map(moiNhanSu.map((n) => [n.id, n]));

    for (const l of tienVe) {
      const ct = l.hoSo.chuongTrinh;
      const c = cauTrucCua(ct);
      const quyChi = quyChiMotKy(c);
      quyChiPhatSinh += quyChi;

      const dich = {
        ...dichQuyTac({ ma: ct.ma, truongMa: ct.truong.ma, he: ct.he }),
        ngay: ngayISO(ngayThamSo),
      };
      const boiCanh = {
        quyChiKy: quyChi,
        hocPhiKy: c.hocPhiKy,
        soHoSoThang: demHoSo.get(l.nhanSuId) ?? 0,
        doanhSoQuyDoi: doanhSo.get(l.nhanSuId) ?? 0,
      };

      const qtNv = chonQuyTac(quyTac, { vaiTro: 'NV', ...dich });
      if (qtNv) {
        const kq = tinhTheoQuyTac(qtNv, boiCanh);
        quyenLoi.set(l.nhanSuId, (quyenLoi.get(l.nhanSuId) ?? 0) + kq.soTien);
        if (kq.biChan) coBiChan = true;
      }

      // Thù lao quản lý gắn với PHẠM VI PHỤ TRÁCH của hồ sơ đó, không theo số người
      const chuHoSo = nhanSuTheoId.get(l.nhanSuId);
      const qtTn = chonQuyTac(quyTac, { vaiTro: 'TN', ...dich });
      if (qtTn && chuHoSo) {
        const kq = tinhTheoQuyTac(qtTn, boiCanh);
        thuLaoTn += kq.soTien;
        const tn = moiNhanSu.find((n) => n.vaiTro === 'TN' && n.donViId === chuHoSo.donViId);
        if (tn) quyenLoi.set(tn.id, (quyenLoi.get(tn.id) ?? 0) + kq.soTien);
      }
      const qtTp = chonQuyTac(quyTac, { vaiTro: 'TP', ...dich });
      if (qtTp && chuHoSo) {
        const kq = tinhTheoQuyTac(qtTp, boiCanh);
        thuLaoTp += kq.soTien;
        const tp = moiNhanSu.find(
          (n) => n.vaiTro === 'TP' && n.donViId === chuHoSo.donVi.chaId,
        );
        if (tp) quyenLoi.set(tp.id, (quyenLoi.get(tp.id) ?? 0) + kq.soTien);
      }
    }

    // --- Sổ công nợ ba nhánh cho từng người
    const bang: Omit<Prisma.BangLuongDongUncheckedCreateInput, 'kyLuongId'>[] = [];
    let tongThucNhan = 0;

    for (const n of moiNhanSu) {
      if (n.vaiTro === 'ADMIN') continue; // quản trị không hưởng quỹ chi
      const ds = doanhSo.get(n.id) ?? 0;
      const ql = quyenLoi.get(n.id) ?? 0;
      const soMoi = demHoSo.get(n.id) ?? 0;

      // Lương mềm và thưởng ngưỡng là CỘT THÔNG TIN: `soCongNo` chỉ nhận quyền
      // lợi. Việc chúng có cộng vào thực nhận hay không là điểm còn phải chốt
      // chính sách — xem ghi chú trả về trong `canhBao`.
      const lm = bieu && n.vaiTro === 'NV' ? luyTien(bieu.bac, ds) : 0;
      const tn = n.vaiTro === 'NV' ? tinhThuongNguong(thuongBang, ds) : 0;

      const kq = soCongNo(
        { quyenLoi: ql, soHoSoMoi: soMoi, noDauKy: noDau.get(n.id) ?? 0 },
        coChe,
      );
      tongThucNhan += kq.thucNhan;

      bang.push({
        nhanSuId: n.id,
        soHoSoMoi: soMoi,
        soKyThu: soKy.get(n.id) ?? 0,
        hocPhiThucThu: BigInt(hocPhi.get(n.id) ?? 0),
        doanhSoQuyDoi: BigInt(ds),
        luongMem: BigInt(lm),
        thuongNguong: BigInt(tn),
        quyenLoi: BigInt(kq.quyenLoi),
        ungThem: BigInt(kq.ungThem),
        thuHoi: BigInt(kq.thuHoi),
        thucNhan: BigInt(kq.thucNhan),
        noCuoiKy: BigInt(kq.noCuoiKy),
        nhanh: kq.nhanh,
      });
    }

    // Vượt trần khi tổng chi của kỳ vượt quỹ chi phát sinh trong kỳ
    const tongChi = thuLaoTn + thuLaoTp + [...quyenLoi.values()].reduce((a, b) => a + b, 0);
    const vuotTran = quyChiPhatSinh > 0 && tongChi > quyChiPhatSinh;

    const snapshot = {
      ngayThamSo: ngayISO(ngayThamSo),
      tinhLuc: new Date().toISOString(),
      coCau,
      quyTac,
      bieuLuongMem: bieu,
      thuongNguong: thuongBang,
      thamSoCoChe: coChe,
    } satisfies Record<string, unknown>;

    const ky = await repo.luuKyLuong(
      thang,
      {
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        tongThucNhan: BigInt(tongThucNhan),
        thuLaoTn: BigInt(thuLaoTn),
        thuLaoTp: BigInt(thuLaoTp),
        quyChiPhatSinh: BigInt(quyChiPhatSinh),
        vuotTran,
      },
      bang,
    );

    const canhBao: string[] = [];
    if (vuotTran) {
      canhBao.push(
        `Tổng chi ${tongChi.toLocaleString('vi-VN')}đ vượt quỹ chi phát sinh ${quyChiPhatSinh.toLocaleString('vi-VN')}đ — kỳ này KHÔNG chốt được.`,
      );
    }
    if (coBiChan) {
      canhBao.push('Có quy tắc bị trần cắt bớt. Người điều hành phải sửa chính sách, không để lệch âm thầm.');
    }
    if (quyChiPhatSinh === 0) {
      canhBao.push(
        'Chưa có đợt đối soát nào nhận tiền trong tháng này, nên chưa có quỹ chi. Quyền lợi bằng 0 và cán bộ đạt chỉ tiêu chỉ nhận ứng trước.',
      );
    }
    canhBao.push(
      'Lương mềm và thưởng ngưỡng hiện là cột thông tin, chưa cộng vào thực nhận: LOGIC.md §8.1 định nghĩa thực hưởng đúng bằng phần quỹ chi, còn §6 mô tả biểu lũy tiến riêng. Cần chốt chính sách trước khi trả tiền.',
    );

    return { ...(await this.xemKyLuong(ky.thang)), canhBao };
  },

  async chotKyLuong(requester: Requester, thang: string) {
    const { nhanSu } = await boiCanhNguoiDung(requester);
    if (nhanSu.vaiTro !== 'TP' && nhanSu.vaiTro !== 'ADMIN') {
      throw new ForbiddenError('Chỉ trưởng phòng hoặc quản trị chốt được kỳ lương', 'KHONG_DU_QUYEN');
    }
    const ky = await repo.kyLuongTheoThang(thang);
    if (!ky) throw new NotFoundError(`Chưa tính kỳ lương ${thang}`, 'CHUA_CO_KY_LUONG');
    if (ky.trangThai === 'DA_CHOT') {
      throw new BadRequestError(`Kỳ lương ${thang} đã chốt`, 'KY_DA_CHOT');
    }
    if (ky.vuotTran) {
      throw new BadRequestError(
        'Vượt trần chi — không chốt được kỳ. Sửa cơ cấu hoặc quy tắc trước.',
        'VUOT_TRAN',
      );
    }
    await repo.chotKyLuong(thang);
    return this.xemKyLuong(thang);
  },

  /** Tiến độ tới ngưỡng thưởng kế tiếp — dùng cho thanh tiến độ ở màn Tổng quan. */
  async tongQuan(requester: Requester) {
    const { nhanSu, phamVi } = await boiCanhNguoiDung(requester);
    const ngay = new Date();
    const thang = `${ngay.getUTCFullYear()}-${String(ngay.getUTCMonth() + 1).padStart(2, '0')}`;
    const { tu, den } = khoangThang(thang);

    const [thuThang, tienVe, hoSoMoi, bieu, thuongBang, coChe] = await Promise.all([
      repo.lanThuGhiNhanTrongThang(tu, den, phamVi),
      repo.lanThuTienVeTrongThang(tu, den, phamVi),
      repo.hoSoMoiTrongThang(tu, den, phamVi),
      repo.bieuLuongMem(ngay),
      repo.thuongNguong(ngay),
      repo.thamSoCoChe(ngay),
    ]);

    const cauTruc = (ct: {
      hocPhiKy: bigint;
      tyLeTrichPpm: number;
      thuePpm: number;
      dinhMucKy: bigint;
      soKy: number;
    }) => ({
      hocPhiKy: so(ct.hocPhiKy),
      tyLeTrichPpm: ct.tyLeTrichPpm,
      thuePpm: ct.thuePpm,
      dinhMucKy: so(ct.dinhMucKy),
      soKy: ct.soKy,
    });

    const doanhSoQuyDoi = thuThang.reduce(
      (t, l) => t + doanhSoQuyDoiMotKy(cauTruc(l.hoSo.chuongTrinh)),
      0,
    );
    const hocPhiThucThu = thuThang.reduce((t, l) => t + so(l.soTien), 0);
    const quyChiDaVe = tienVe.reduce((t, l) => t + quyChiMotKy(cauTruc(l.hoSo.chuongTrinh)), 0);
    const soHoSoMoi = hoSoMoi.reduce((t, g) => t + g._count._all, 0);
    const choDoiSoat = thuThang.filter((l) => l.trangThai === 'CHO_DOI_SOAT').length;

    return {
      thang,
      vaiTro: nhanSu.vaiTro,
      phamVi: phamVi.length,
      soHoSoMoi,
      chiTieuHoSo: coChe?.chiTieuHoSo ?? null,
      datChiTieu: coChe ? soHoSoMoi >= coChe.chiTieuHoSo : null,
      mucSan: coChe?.mucSan ?? null,
      soKyThu: thuThang.length,
      hocPhiThucThu,
      doanhSoQuyDoi,
      quyChiDaVe,
      soKyChoDoiSoat: choDoiSoat,
      luongMem: bieu ? luyTien(bieu.bac, doanhSoQuyDoi) : 0,
      thuongNguong: tinhThuongNguong(thuongBang, doanhSoQuyDoi),
      nguongKeTiep: nguongKeTiep(thuongBang, doanhSoQuyDoi),
    };
  },
};
