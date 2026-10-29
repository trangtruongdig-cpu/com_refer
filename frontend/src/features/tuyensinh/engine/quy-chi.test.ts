import { describe, expect, it } from 'vitest';
import { CHUONG_TRINH, timChuongTrinh } from '../du-lieu/danh-muc';
import { CO_CAU_QUY_CHI, DAU_VIEC } from '../du-lieu/tham-so';
import { pvChu } from '../dinh-dang';
import {
  chiaCoCau,
  chiaDauViec,
  doanhSoQuyDoiMotKy,
  heSoQuyDoi,
  hocPhiToanKhoa,
  kiemBaoToan,
  pv,
  quyChiMotKy,
  tienTrichMotKy,
} from './quy-chi';

const ct = (ma: string) => timChuongTrinh(ma)!;

describe('quỹ chi một kỳ — LOGIC.md §2.2 và §3.2', () => {
  it('DHCNVT-NNA: 11.000.000 × 30% − 500.000 = 2.800.000', () => {
    expect(tienTrichMotKy(ct('DHCNVT-NNA'))).toBe(3_300_000);
    expect(quyChiMotKy(ct('DHCNVT-NNA'))).toBe(2_800_000);
  });

  it('DHCNVT-NNA: quỹ chi là 25,5% học phí', () => {
    const c = ct('DHCNVT-NNA');
    expect(((quyChiMotKy(c) / c.hocPhiKy) * 100).toFixed(1)).toBe('25.5');
  });

  it('TC-DD: sản phẩm của Trường, quỹ chi 1.250.000', () => {
    expect(quyChiMotKy(ct('TC-DD'))).toBe(1_250_000);
  });

  it('DH-DT02-GDMN: trích 25%, quỹ chi 2.050.000', () => {
    expect(quyChiMotKy(ct('DH-DT02-GDMN'))).toBe(2_050_000);
  });

  it('NH-CSSD-PTTM: quỹ chi 800.000 — mốc neo của PV', () => {
    expect(quyChiMotKy(ct('NH-CSSD-PTTM'))).toBe(800_000);
  });

  it('mọi chương trình giữ bất biến bảo toàn học phí và có quỹ chi dương', () => {
    for (const c of CHUONG_TRINH) {
      expect(kiemBaoToan(c), c.ma).toBe(true);
    }
  });

  it('học phí toàn khoá đại học 44 triệu nhưng Trường chỉ thực nhận 11,2 triệu', () => {
    const c = ct('DHCNVT-NNA');
    expect(hocPhiToanKhoa(c)).toBe(44_000_000);
    expect(quyChiMotKy(c) * c.soKy).toBe(11_200_000);
  });
});

describe('PV — LOGIC.md §5.1', () => {
  it('bảng PV khớp từng dòng', () => {
    // Bảng trong LOGIC.md in PV theo kiểu CẮT ba chữ số (1.250.000/800.000 =
    // 1,5625 in ra 1,562), nên kiểm thử so giá trị đúng rồi so cả cách in.
    expect(pv(ct('NH-CSSD-PTTM'))).toBe(1);
    expect(pv(ct('TC-DD'))).toBe(1.5625);
    expect(pv(ct('DH-DT02-GDMN'))).toBe(2.5625);
    expect(pv(ct('DHCNVT-NNA'))).toBe(3.5);
  });

  it('PV in ra khớp bảng của tài liệu', () => {
    expect(pvChu(pv(ct('NH-CSSD-PTTM')))).toBe('1,000');
    expect(pvChu(pv(ct('TC-DD')))).toBe('1,562');
    expect(pvChu(pv(ct('DH-DT02-GDMN')))).toBe('2,562');
    expect(pvChu(pv(ct('DHCNVT-NNA')))).toBe('3,500');
  });
});

describe('hệ số quy đổi — LOGIC.md §5.2', () => {
  it('trung cấp là mốc 1,000', () => {
    expect(heSoQuyDoi(ct('TC-DD')).toFixed(3)).toBe('1.000');
  });

  it('dải hệ số chạy từ 1,000 đến 2,240', () => {
    expect(heSoQuyDoi(ct('DH-DT02-GDMN')).toFixed(3)).toBe('1.148');
    expect(heSoQuyDoi(ct('DHCNVT-NNA')).toFixed(3)).toBe('1.425');
    expect(heSoQuyDoi(ct('NH-CSSD-PTTM')).toFixed(3)).toBe('2.240');
  });

  it('doanh số quy đổi = quỹ chi × 5,6', () => {
    expect(doanhSoQuyDoiMotKy(ct('TC-DD'))).toBe(7_000_000);
    expect(doanhSoQuyDoiMotKy(ct('DHCNVT-NNA'))).toBe(15_680_000);
  });

  it('một đồng doanh số quy đổi mang về cho Trường đúng bằng nhau ở mọi hệ', () => {
    const ty = CHUONG_TRINH.map((c) => quyChiMotKy(c) / doanhSoQuyDoiMotKy(c));
    for (const t of ty) expect(t).toBeCloseTo(ty[0]!, 9);
  });
});

describe('cơ cấu quỹ chi — LOGIC.md §2.2, §3', () => {
  it('bảy khoản cộng đúng 100%', () => {
    expect(CO_CAU_QUY_CHI.reduce((t, k) => t + k.ppm, 0)).toBe(1_000_000);
  });

  it('chia 2.800.000 ra đúng sơ đồ của §2.2', () => {
    const chia = chiaCoCau(2_800_000, CO_CAU_QUY_CHI);
    const theoMa = Object.fromEntries(chia.map((x) => [x.khoan.ma, x.soTien]));
    expect(theoMa.KHOAN_MANG_LUOI).toBe(1_680_000);
    expect(theoMa.THU_LAO_TP).toBe(291_200);
    expect(theoMa.THU_LAO_TN).toBe(268_800);
    expect(theoMa.DOI_NGOAI).toBe(140_000);
    expect(chia.reduce((t, x) => t + x.soTien, 0)).toBe(2_800_000);
  });

  it('mười một đầu việc có tổng trọng số đúng 1,00 và chia không thất thoát', () => {
    expect(DAU_VIEC.reduce((t, d) => t + d.trongSo, 0)).toBeCloseTo(1, 10);
    const chia = chiaDauViec(1_680_000, DAU_VIEC);
    expect(chia.reduce((t, x) => t + x.soTien, 0)).toBe(1_680_000);
  });
});
