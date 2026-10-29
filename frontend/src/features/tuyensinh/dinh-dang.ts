/** Định dạng số và ngày cho giao diện. Không chứa phép tính tiền nào. */

export const tien = (n: number): string =>
  `${Math.round(n || 0).toLocaleString('vi-VN')}đ`.replace(/[\u00a0\u202f]/g, ' ');

/** Tiền viết gọn cho ô số nhỏ: 15.680.000 → "15,68 tr". */
export function tienGon(n: number): string {
  const x = Math.round(n || 0);
  if (Math.abs(x) >= 1_000_000_000) return `${(x / 1_000_000_000).toFixed(2)} tỷ`.replace('.', ',');
  if (Math.abs(x) >= 1_000_000) return `${(x / 1_000_000).toFixed(2)} tr`.replace('.', ',');
  return tien(x);
}

/** Tỷ lệ từ số thực 0..1. */
export const pt = (x: number): string =>
  `${(x * 100).toFixed(Math.abs(x) >= 0.1 ? 1 : 2).replace('.', ',')}%`;

/** Tỷ lệ từ số nguyên phần triệu: 96_000 → "9,6%". */
export const ptPpm = (ppm: number): string => pt(ppm / 1_000_000);

/** PV in theo kiểu bảng của LOGIC.md: CẮT ba chữ số, không làm tròn. */
export function pvChu(x: number): string {
  const cat = Math.trunc(x * 1000) / 1000;
  return cat.toFixed(3).replace('.', ',');
}

/** Hệ số quy đổi in ba chữ số, có làm tròn. */
export const heSoChu = (x: number): string => x.toFixed(3).replace('.', ',');

/** `2026-09-15` → `15/09/2026`. */
export const ngayVn = (s: string): string =>
  s ? s.split('-').reverse().join('/') : '—';

/** `2026-09` → `09/2026`. */
export const thangVn = (s: string): string => (s ? s.split('-').reverse().join('/') : '—');

export const chuCai = (s: string): string =>
  (s || '?')
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((x) => x[0] ?? '')
    .join('')
    .toUpperCase();
