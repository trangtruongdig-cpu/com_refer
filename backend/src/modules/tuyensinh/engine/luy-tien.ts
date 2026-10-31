/**
 * Biểu lũy tiến — ngữ nghĩa BẬC THANG BIÊN. Xem LOGIC.md §6.
 *
 * Tỷ lệ gắn với ngưỡng `T` áp cho KHOẢNG `[T, T_kế_tiếp)`, không áp cho toàn bộ
 * giá trị. Tỷ lệ của ngưỡng cuối áp cho mọi phần vượt ngưỡng đó. Phần giá trị
 * dưới ngưỡng thấp nhất không được hưởng gì.
 *
 * Cộng dồn bằng BigInt và làm tròn MỘT LẦN ở cuối: làm tròn từng khoảng rồi
 * cộng sẽ ra số khác.
 */
import { chiaLamTron } from './tien';

export interface Bac {
  /** Ngưỡng dưới của khoảng, đơn vị đồng */
  readonly nguongTu: number;
  /** Tỷ lệ của khoảng, số nguyên phần triệu */
  readonly ppm: number;
}

/** Khai bậc gọn dạng `[ngưỡng, ppm]` cho bảng tham số. */
export type BacRutGon = Bac | readonly [number, number];

function docBac(bac: readonly BacRutGon[]): Bac[] {
  return bac.map((b) => ('nguongTu' in b ? b : { nguongTu: b[0], ppm: b[1] }));
}

/** Sắp theo ngưỡng tăng dần — bảng tham số có thể khai đảo thứ tự. */
function sapXep(b: Bac[]): Bac[] {
  return [...b].sort((x, y) => x.nguongTu - y.nguongTu);
}

export function luyTien(bac: readonly BacRutGon[], giaTri: number): number {
  const b = sapXep(docBac(bac));
  if (b.length === 0) return 0;
  if (giaTri <= b[0]!.nguongTu) return 0; // dưới ngưỡng thấp nhất: không hưởng gì

  let tong = 0n; // ← BigInt, quy ước Ba
  for (let i = 0; i < b.length; i++) {
    const dayKhoang = b[i]!.nguongTu;
    if (giaTri <= dayKhoang) break;
    const tranKhoang = i + 1 < b.length ? b[i + 1]!.nguongTu : null;
    const dinh = tranKhoang === null ? giaTri : Math.min(giaTri, tranKhoang);
    const phan = dinh - dayKhoang;
    if (phan > 0) tong += BigInt(phan) * BigInt(b[i]!.ppm);
  }
  return chiaLamTron(tong, 1_000_000n); // ← làm tròn MỘT LẦN
}

/**
 * Bậc cao nhất đã đạt: chỉ số (trong bảng ĐÃ SẮP) của bậc cuối cùng có
 * `nguongTu <= giaTri`. Trả `-1` khi chưa đạt bậc nào.
 */
export function timBacDatDuoc(bac: readonly BacRutGon[], giaTri: number): number {
  const b = sapXep(docBac(bac));
  let ketQua = -1;
  for (let i = 0; i < b.length; i++) if (giaTri >= b[i]!.nguongTu) ketQua = i;
  return ketQua;
}

/** Bảng thưởng đạt ngưỡng: `[ngưỡng, số tiền phẳng]`. */
export type BacThuong = readonly [number, number];

/**
 * Thưởng đạt ngưỡng — SỐ TIỀN PHẲNG của ngưỡng cao nhất đã vượt, không lũy
 * tiến. Khác hẳn tỷ lệ khoảng ở trên; lẫn hai cái là lỗi.
 */
export function thuongNguong(bang: readonly BacThuong[], giaTri: number): number {
  let muc = 0;
  for (const [nguong, thuong] of [...bang].sort((a, b) => a[0] - b[0])) {
    if (giaTri >= nguong) muc = thuong;
  }
  return muc;
}

/** Ngưỡng thưởng kế tiếp chưa đạt, dùng cho thanh tiến độ. */
export function nguongKeTiep(bang: readonly BacThuong[], giaTri: number): BacThuong | null {
  return [...bang].sort((a, b) => a[0] - b[0]).find(([n]) => giaTri < n) ?? null;
}
