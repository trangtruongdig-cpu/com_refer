import { describe, expect, it } from 'vitest';
import { luyTien, nguongKeTiep, thuongNguong, timBacDatDuoc } from './luy-tien';
import { BIEU_LUONG_MEM, THUONG_NGUONG } from '../du-lieu/tham-so';

const BIEU_HIEU_CHINH = BIEU_LUONG_MEM[0]!.bac;
const BIEU_SAPO = BIEU_LUONG_MEM[1]!.bac;

describe('luyTien — bậc thang biên', () => {
  it('ví dụ kiểm tay của LOGIC.md §6: doanh số 35.000.000 ⇒ 424.000đ', () => {
    // [16M;25M) 9.000.000 × 1,6% = 144.000
    // [25M;35M) 10.000.000 × 2,8% = 280.000
    expect(luyTien(BIEU_HIEU_CHINH, 35_000_000)).toBe(424_000);
  });

  it('ví dụ kiểm tay của thuchien.md §6.3 trên biểu Sapo: 35.000.000 ⇒ 1.504.000đ', () => {
    expect(luyTien(BIEU_SAPO, 35_000_000)).toBe(1_504_000);
  });

  it('dưới ngưỡng thấp nhất không hưởng gì', () => {
    expect(luyTien(BIEU_HIEU_CHINH, 16_000_000)).toBe(0);
    expect(luyTien(BIEU_HIEU_CHINH, 15_999_999)).toBe(0);
    expect(luyTien(BIEU_HIEU_CHINH, 0)).toBe(0);
  });

  it('tỷ lệ của ngưỡng cuối áp cho mọi phần vượt', () => {
    const tai200 = luyTien(BIEU_HIEU_CHINH, 200_000_000);
    expect(luyTien(BIEU_HIEU_CHINH, 210_000_000)).toBe(tai200 + 10_000_000 * 0.062);
  });

  it('khai bậc đảo thứ tự vẫn ra cùng số', () => {
    const dao = [...BIEU_HIEU_CHINH].reverse();
    expect(luyTien(dao, 35_000_000)).toBe(424_000);
  });

  it('không phải tỷ lệ phẳng trên toàn bộ giá trị', () => {
    // Nếu hiểu sai thành phẳng, 35.000.000 × 3,6% = 1.260.000
    expect(luyTien(BIEU_HIEU_CHINH, 35_000_000)).not.toBe(1_260_000);
  });
});

describe('thưởng đạt ngưỡng — số tiền phẳng, không lũy tiến', () => {
  it('đạt 35.000.000 được 300.000', () => {
    expect(thuongNguong(THUONG_NGUONG, 35_000_000)).toBe(300_000);
  });

  it('chưa đạt ngưỡng đầu thì không có thưởng', () => {
    expect(thuongNguong(THUONG_NGUONG, 24_999_999)).toBe(0);
  });

  it('vượt ngưỡng cao nhất giữ mức cao nhất', () => {
    expect(thuongNguong(THUONG_NGUONG, 500_000_000)).toBe(2_000_000);
    expect(nguongKeTiep(THUONG_NGUONG, 500_000_000)).toBeNull();
  });

  it('ngưỡng kế tiếp dùng cho thanh tiến độ', () => {
    expect(nguongKeTiep(THUONG_NGUONG, 30_000_000)).toEqual([35_000_000, 300_000]);
  });
});

describe('timBacDatDuoc', () => {
  it('trả -1 khi chưa đạt bậc nào', () => {
    expect(
      timBacDatDuoc(
        [
          [3, 520_000],
          [6, 560_000],
        ],
        1,
      ),
    ).toBe(-1);
  });

  it('trả chỉ số bậc cao nhất đã đạt', () => {
    const bac = [
      [0, 480_000],
      [3, 520_000],
      [6, 560_000],
      [11, 600_000],
    ] as const;
    expect(timBacDatDuoc(bac, 0)).toBe(0);
    expect(timBacDatDuoc(bac, 5)).toBe(1);
    expect(timBacDatDuoc(bac, 10)).toBe(2);
    expect(timBacDatDuoc(bac, 11)).toBe(3);
  });
});
