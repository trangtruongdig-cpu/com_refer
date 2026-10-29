import { describe, expect, it } from 'vitest';
import { chiaLamTron, dinhDang, lamTronDong, nhanTyLe, phanBo } from './tien';

describe('lamTronDong — nửa lên, xa khỏi số 0', () => {
  it('làm tròn số âm khác Math.round', () => {
    // Math.round cho -0, -1, -2. Mọi khoản thu hồi ứng trước đều âm.
    expect(lamTronDong(-0.5)).toBe(-1);
    expect(lamTronDong(-1.5)).toBe(-2);
    expect(lamTronDong(-2.5)).toBe(-3);
  });

  it('làm tròn số dương và chuẩn hoá -0', () => {
    expect(lamTronDong(0.5)).toBe(1);
    expect(lamTronDong(1.5)).toBe(2);
    expect(lamTronDong(-0.2)).toBe(0);
    expect(Object.is(lamTronDong(-0.2), -0)).toBe(false);
  });
});

describe('nhanTyLe — tỷ lệ là số nguyên phần triệu', () => {
  it('9,6% của 2.800.000 là 268.800', () => {
    expect(nhanTyLe(2_800_000, 96_000)).toBe(268_800);
  });

  it('10,4% của 2.800.000 là 291.200', () => {
    expect(nhanTyLe(2_800_000, 104_000)).toBe(291_200);
  });

  it('60% của 1.250.000 là 750.000', () => {
    expect(nhanTyLe(1_250_000, 600_000)).toBe(750_000);
  });

  it('nhân với 0 trả 0', () => {
    expect(nhanTyLe(0, 600_000)).toBe(0);
    expect(nhanTyLe(1_000_000, 0)).toBe(0);
  });
});

describe('chiaLamTron', () => {
  it('nửa lên, xa khỏi số 0', () => {
    expect(chiaLamTron(5n, 10n)).toBe(1);
    expect(chiaLamTron(-5n, 10n)).toBe(-1);
    expect(chiaLamTron(15n, 10n)).toBe(2);
  });

  it('chặn chia cho 0', () => {
    expect(() => chiaLamTron(1n, 0n)).toThrow();
  });
});

describe('phanBo — tổng luôn đúng bằng số đem chia', () => {
  it('ca thế bằng phần dư đã bắt được lỗi thật: 19.956.477 theo 44/10/48', () => {
    const ra = phanBo(19_956_477, [44, 10, 48]);
    expect(ra.reduce((a, b) => a + b, 0)).toBe(19_956_477);
    // Hai phần dư bằng nhau tuyệt đối (36/102) ⇒ đồng lẻ về phần tử ĐỨNG TRƯỚC
    expect(ra).toEqual([8_608_677, 1_956_517, 9_391_283]);
  });

  it('chia quỹ chi theo cơ cấu bảy khoản không thất thoát', () => {
    const ra = phanBo(2_800_000, [600_000, 104_000, 96_000, 50_000, 50_000, 50_000, 50_000]);
    expect(ra.reduce((a, b) => a + b, 0)).toBe(2_800_000);
    expect(ra.slice(0, 3)).toEqual([1_680_000, 291_200, 268_800]);
  });

  it('trọng số thập phân của 11 đầu việc vẫn cộng đủ', () => {
    const trongSo = [0.15, 0.12, 0.1, 0.1, 0.1, 0.1, 0.08, 0.08, 0.07, 0.06, 0.04];
    const ra = phanBo(1_680_000, trongSo);
    expect(ra.reduce((a, b) => a + b, 0)).toBe(1_680_000);
    expect(ra[0]).toBe(252_000); // 15% của 1.680.000
  });

  it('không có cơ sở phân bổ thì dồn vào phần tử đầu', () => {
    expect(phanBo(1000, [0, 0])).toEqual([1000, 0]);
    expect(phanBo(1000, [])).toEqual([]);
  });
});

describe('dinhDang', () => {
  it('in theo kiểu Việt Nam', () => {
    expect(dinhDang(1_234_567)).toBe('1.234.567đ');
    expect(dinhDang(0)).toBe('0đ');
  });
});
