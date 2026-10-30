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
 *   nhanSuMa      → nhanSuId
 *   dotDoiSoatId  → dotDoiSoatMa
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
  soKy: 4,
  hocPhiKy: 11_000_000,
  tyLeTrichPpm: 300_000,
  thuePpm: 0,
  dinhMucKy: 500_000,
  treThang: 5,
  nganhSucKhoe: false,
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
    noiCongTac: '',
    ghiChu: '',
    nhanSuMa: 'NV01',
    ngayLap: '2026-10-05',
    trangThai: 'DANG_HOC',
    kyDaThu: 1,
    tep: [{ muc: 'Bản sao căn cước công dân', ten: 'cccd.jpg' }],
  };

  it('đổi nhanSuMa thành nhanSuId và giữ khoá máy chủ', () => {
    const hs = hoSoTuApi(api);
    expect(hs.nhanSuId).toBe('NV01');
    expect(hs.id).toBe('6f1b0d9e-0000-4000-8000-000000000001');
    expect(hs.ma).toBe('HS2610001');
  });

  it('giữ nguyên tệp đính kèm', () => {
    expect(hoSoTuApi(api).tep).toHaveLength(1);
  });
});

describe('lanThuTuApi', () => {
  const api: LanThuApi = {
    id: '6f1b0d9e-0000-4000-8000-000000000002',
    ma: 'LT2610001K1',
    hoSoId: '6f1b0d9e-0000-4000-8000-000000000001',
    hoSoMa: 'HS2610001',
    kyThu: 1,
    ngayThu: '2026-10-12',
    soTien: 11_000_000,
    soChungTu: 'UNC-202610-01',
    bienLaiTen: null,
    taiKhoanId: '6f1b0d9e-0000-4000-8000-000000000003',
    nhanSuMa: 'NV01',
    dotDoiSoatId: null,
    trangThai: 'CHO_DOI_SOAT',
  };

  it('đổi dotDoiSoatId thành dotDoiSoatMa, giữ null khi chưa xếp đợt', () => {
    expect(lanThuTuApi(api).dotDoiSoatMa).toBeNull();
    expect(lanThuTuApi({ ...api, dotDoiSoatId: 'x' }).dotDoiSoatMa).toBe('x');
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
    lanThuIds: ['6f1b0d9e-0000-4000-8000-000000000002'],
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
