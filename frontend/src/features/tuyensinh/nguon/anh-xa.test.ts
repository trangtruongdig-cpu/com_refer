import { describe, expect, it } from 'vitest';
import type {
  ChuongTrinhApi,
  DotDoiSoatApi,
  HoSoApi,
  LanThuApi,
  TaiKhoanApi,
} from '@/api/tuyensinh.api';
import { quyChiMotKy } from '../engine/quy-chi';
import { chuongTrinhTuApi, dotTuApi, hoSoTuApi, lanThuTuApi, taiKhoanTuApi } from './anh-xa';

/**
 * Lớp chống hỏng là chỗ DUY NHẤT biết tên trường của API khác tên trường của
 * nghiệp vụ. Ba chỗ dễ sai nhất — và kiểm thử này giữ cả ba:
 *
 *   canBo.ma      → nhanSuId
 *   dot.ma        → dotDoiSoatMa
 *   id (uuid máy chủ) phải được giữ lại, vì mọi lệnh gọi API sau đó cần nó.
 */

const ctApi: ChuongTrinhApi = {
  ma: 'DHCNVT-NNA',
  truongMa: 'DHCNVT',
  truongTen: 'Đại học Công nghiệp Việt Trì',
  truongPhoenix: false,
  he: 'DH',
  maNganh: 'NNA',
  tenNganh: 'Ngôn ngữ Anh',
  tuTrinhDo: 'CD',
  thoiLuongThang: 18,
  treThang: 5,
  nganhSucKhoe: false,
  daDoiChieu: true,
  soKy: 4,
  hocPhiKy: 11_000_000,
  hocPhiToanKhoa: 44_000_000,
  tyLeTrichPpm: 300_000,
  thuePpm: 0,
  dinhMucKy: 500_000,
  tienTrichKy: 3_300_000,
  thueKy: 0,
  nopDoiTacKy: 7_700_000,
  quyChiKy: 2_800_000,
  pv: 1,
  heSoQuyDoi: 1,
  doanhSoQuyDoiKy: 11_000_000,
  baoToan: true,
};

describe('chuongTrinhTuApi', () => {
  it('giữ đủ tham số để engine tính được quỹ chi', () => {
    const ct = chuongTrinhTuApi(ctApi);
    expect(quyChiMotKy(ct)).toBe(2_800_000);
  });

  it('giữ nguyên mã, hệ và trình độ đầu vào', () => {
    const ct = chuongTrinhTuApi(ctApi);
    expect(ct.ma).toBe('DHCNVT-NNA');
    expect(ct.he).toBe('DH');
    expect(ct.tuTrinhDo).toBe('CD');
  });
});

describe('hoSoTuApi', () => {
  const api: HoSoApi = {
    id: '6f1b0d9e-0000-4000-8000-000000000001',
    ma: 'HS2610001',
    chuongTrinhMa: 'DHCNVT-NNA',
    hoTen: 'Nguyễn Thu Hà',
    ngaySinh: '2001-05-12',
    soCccd: '001301001234',
    dienThoai: '0912345678',
    email: '',
    diaChi: 'Hà Nội',
    trinhDo: 'Cao đẳng',
    ghiChu: '',
    ngayLap: '2026-10-05',
    trangThai: 'DANG_HOC',
    kyDaThu: 1,
    soKy: 4,
    tenNganh: 'Ngôn ngữ Anh',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    he: 'DH',
    hocPhiKy: 11_000_000,
    quyChiKy: 2_800_000,
    canBo: { ma: 'NV01', hoTen: 'Nguyễn Thị Hương' },
    lanThu: [],
  };

  it('đổi canBo.ma thành nhanSuId và giữ khoá máy chủ', () => {
    const hs = hoSoTuApi(api);
    expect(hs.nhanSuId).toBe('NV01');
    expect(hs.id).toBe('6f1b0d9e-0000-4000-8000-000000000001');
    expect(hs.ma).toBe('HS2610001');
  });

  it('để trống tệp và nơi công tác chưa có trong phản hồi API', () => {
    expect(hoSoTuApi(api).tep).toEqual([]);
    expect(hoSoTuApi(api).noiCongTac).toBe('');
  });
});

describe('lanThuTuApi', () => {
  const api: LanThuApi = {
    id: '6f1b0d9e-0000-4000-8000-000000000002',
    ma: 'LT2610001K1',
    hoSoMa: 'HS2610001',
    hocVien: 'Nguyễn Thu Hà',
    chuongTrinhMa: 'DHCNVT-NNA',
    tenNganh: 'Ngôn ngữ Anh',
    truongMa: 'DHCNVT',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    kyThu: 1,
    ngayThu: '2026-10-12',
    soTien: 11_000_000,
    soChungTu: 'UNC-202610-01',
    canBo: { ma: 'NV01', hoTen: 'Nguyễn Thị Hương' },
    dot: null,
    trangThai: 'CHO_DOI_SOAT',
  };

  it('đổi mã đợt lồng nhau thành dotDoiSoatMa, giữ null khi chưa xếp đợt', () => {
    expect(lanThuTuApi(api).dotDoiSoatMa).toBeNull();
    expect(
      lanThuTuApi({
        ...api,
        dot: { id: 'dot-id', ma: 'DS261001', trangThai: 'CHUA_NHAN_TIEN' },
      }).dotDoiSoatMa,
    ).toBe('DS261001');
  });

  it('chưa đối soát thì trạng thái vẫn là chờ — doanh số có, quỹ chi chưa', () => {
    expect(lanThuTuApi(api).trangThai).toBe('CHO_DOI_SOAT');
  });
});

describe('dotTuApi', () => {
  const api: DotDoiSoatApi = {
    id: '6f1b0d9e-0000-4000-8000-000000000004',
    ma: 'DS261001',
    truongMa: 'DHCNVT',
    truongTen: 'Đại học Công nghiệp Việt Trì',
    ngayLap: '2026-10-10',
    ngayNhanTien: null,
    trangThai: 'CHUA_NHAN_TIEN',
    ghiChu: '',
    soLanThu: 1,
    tongHocPhi: 11_000_000,
    quyChiDuKien: 2_800_000,
  };

  it('nhận danh sách mã lần thu từ bên ngoài, giữ trạng thái chưa nhận tiền', () => {
    const d = dotTuApi(api, ['LT2610001K1']);
    expect(d.lanThuMa).toEqual(['LT2610001K1']);
    expect(d.trangThai).toBe('CHUA_NHAN_TIEN');
    expect(d.ngayNhanTien).toBeNull();
  });
});

describe('taiKhoanTuApi', () => {
  it('giữ nguyên mã BIN và số tài khoản, không tự định dạng lại', () => {
    const api: TaiKhoanApi = {
      id: '6f1b0d9e-0000-4000-8000-000000000003',
      tenChu: 'TRUONG TRUNG CAP QUOC TE PHOENIX',
      tenNganHang: 'Ngân hàng demo',
      bin: '970415',
      soTaiKhoan: '0000001234567',
    };
    expect(taiKhoanTuApi(api)).toEqual(api);
  });
});
