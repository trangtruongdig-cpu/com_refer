/**
 * Số học tiền tệ cho bảng lương. Bản TypeScript của `engine/tien.py`.
 *
 * Copy từ thuchien.md §6.2 — đã đối sánh với engine Python trên 180.805 ca,
 * 0 lệch. Chỉ thêm `!` ở vài chỗ truy cập mảng cho `noUncheckedIndexedAccess`
 * của dự án này; ngữ nghĩa không đổi.
 *
 * Ba quy ước, mỗi quy ước ứng với một lỗi đã thật sự xảy ra:
 *
 *  1. Tiền luôn là số nguyên đồng. `number` đủ chỗ: VND lớn nhất gặp được cỡ
 *     10^9, còn `Number.MAX_SAFE_INTEGER` là 9.007.199.254.740.991.
 *  2. Làm tròn nửa lên, XA KHỎI SỐ 0. `Math.round` làm tròn về phía +∞ nên sai
 *     với số âm — mà mọi khoản thu hồi ứng trước đều là số âm.
 *  3. Tỷ lệ truyền vào dưới dạng SỐ NGUYÊN PHẦN TRIỆU, không phải số thực.
 *     `NUMERIC(8,6)` của PostgreSQL đúng bằng sáu chữ số thập phân.
 */

/** Làm tròn một giá trị thực về số nguyên đồng, nửa lên, xa khỏi số 0. */
export function lamTronDong(giaTri: number): number {
  const ketQua = Math.sign(giaTri) * Math.round(Math.abs(giaTri));
  return ketQua === 0 ? 0 : ketQua; // chuẩn hoá -0 thành 0
}

/** Nhân một khoản tiền với tỷ lệ cho dưới dạng số nguyên phần triệu. */
export function nhanTyLe(soTien: number, ppm: number): number {
  if (soTien === 0 || ppm === 0) return 0;
  return lamTronDong((soTien * ppm) / 1_000_000);
}

/** Chia `tu / mau` (BigInt) và làm tròn nửa lên, xa khỏi số 0. */
export function chiaLamTron(tu: bigint, mau: bigint): number {
  if (mau === 0n) throw new Error('chia cho 0');
  const am = tu < 0n !== mau < 0n;
  const a = tu < 0n ? -tu : tu;
  const m = mau < 0n ? -mau : mau;
  let thuong = a / m;
  if ((a % m) * 2n >= m) thuong += 1n;
  const ketQua = Number(am ? -thuong : thuong);
  return ketQua === 0 ? 0 : ketQua;
}

/** Số chữ số thập phân trong BIỂU DIỄN CHUỖI của x — khớp `str()` của Python. */
function soThapPhan(x: number): number {
  let s = String(x);
  let mu = 0;
  const e = s.search(/[eE]/);
  if (e >= 0) {
    mu = -Number.parseInt(s.slice(e + 1), 10);
    s = s.slice(0, e);
  }
  const i = s.indexOf('.');
  return Math.max(0, (i < 0 ? 0 : s.length - i - 1) + mu);
}

/** `x * 10^d` thành BigInt chính xác, đọc từ chuỗi nên không có sai số dấu phẩy động. */
function nhanLuyThua10(x: number, d: number): bigint {
  if (!Number.isFinite(x)) throw new Error(`không quy đổi được ${x}`);
  let s = String(x);
  let mu = 0;
  const e = s.search(/[eE]/);
  if (e >= 0) {
    mu = Number.parseInt(s.slice(e + 1), 10);
    s = s.slice(0, e);
  }
  let dau = 1n;
  if (s[0] === '-') {
    dau = -1n;
    s = s.slice(1);
  } else if (s[0] === '+') s = s.slice(1);
  const i = s.indexOf('.');
  if (i >= 0) {
    mu -= s.length - i - 1;
    s = s.slice(0, i) + s.slice(i + 1);
  }
  const tong = mu + d;
  if (tong < 0) throw new Error(`mất độ chính xác khi quy đổi ${x}`);
  return dau * BigInt(s === '' ? '0' : s) * 10n ** BigInt(tong);
}

/**
 * Chia `tongTien` theo `trongSo`, bảo đảm `sum(kết quả) === tongTien`.
 *
 * Phương pháp phần dư lớn nhất. Phần dư so sánh bằng SỐ NGUYÊN CHÍNH XÁC, không
 * phải `number`: hai phần dư bằng nhau tuyệt đối nhưng khác độ lớn sẽ mất số bit
 * khác nhau khi trừ bằng dấu phẩy động, và thế bằng bị phá vỡ sai hướng — lệch
 * đúng 1 đồng. Lỗi này đã bắt được thật trên 4/2.090 ca ngẫu nhiên.
 *
 * Khi phần dư bằng nhau, `sort` ổn định (ES2019+) giữ đúng thứ tự khai báo, nên
 * đồng lẻ về phần tử đứng trước. Engine Python cũng vậy.
 */
export function phanBo(tongTien: number, trongSo: readonly number[]): number[] {
  if (trongSo.length === 0) return [];
  const tongTrongSo = trongSo.reduce((a, b) => a + b, 0);
  if (tongTrongSo <= 0) {
    // Không có cơ sở phân bổ: dồn toàn bộ vào phần tử đầu để không thất thoát.
    return [tongTien, ...Array<number>(trongSo.length - 1).fill(0)];
  }

  const d = Math.max(soThapPhan(tongTrongSo), ...trongSo.map(soThapPhan));
  const mau = nhanLuyThua10(tongTrongSo, d);
  const T = BigInt(tongTien);

  const tu = trongSo.map((w) => T * nhanLuyThua10(w, d));
  // BigInt `/` cắt về phía 0 — đúng như `int()` của Python, không phải Math.floor
  const phanNguyen = tu.map((n) => Number(n / mau));
  const conThua = tongTien - phanNguyen.reduce((a, b) => a + b, 0);
  const du = tu.map((n, i) => n - BigInt(phanNguyen[i]!) * mau); // cùng mẫu ⇒ so trực tiếp

  const xep = trongSo
    .map((_, i) => i)
    .sort((a, b) => (du[b]! > du[a]! ? 1 : du[b]! < du[a]! ? -1 : 0));
  for (let i = 0; i < conThua; i++) {
    const vt = xep[i % xep.length]!;
    phanNguyen[vt] = phanNguyen[vt]! + 1;
  }
  return phanNguyen;
}

/** Định dạng tiền để in ra báo cáo: 1234567 -> '1.234.567đ'. */
export function dinhDang(soTien: number): string {
  return `${soTien.toLocaleString('vi-VN').replace(/[,\u00a0\u202f ]/g, '.')}đ`;
}
