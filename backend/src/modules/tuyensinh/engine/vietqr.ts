/**
 * Chuỗi VietQR theo chuẩn EMVCo cho chuyển khoản nhanh NAPAS.
 *
 * TUYỆT ĐỐI KHÔNG HARDCODE SỐ TÀI KHOẢN THẬT — thông tin ngân hàng là tham số
 * Trường tự điền. Màn hình thu tiền phải hiện SỐ TÀI KHOẢN DẠNG CHỮ cạnh mã QR
 * để người nộp đối chiếu được (LOGIC.md §11, thuchien.md §9.6).
 */

/**
 * Bỏ dấu tiếng Việt. Nội dung chuyển khoản có dấu hay bị ngân hàng cắt hoặc
 * hiển thị sai, nên luôn chuyển sang không dấu trước khi đưa vào mã QR.
 */
export function boDau(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase();
}

/** CRC-16/CCITT-FALSE trên byte UTF-8. Giá trị kiểm chuẩn: "123456789" -> 29B1. */
export function crc16(s: string): string {
  const b = new TextEncoder().encode(s);
  let c = 0xffff;
  for (const x of b) {
    c ^= x << 8;
    for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
  }
  return c.toString(16).toUpperCase().padStart(4, '0');
}

const tlv = (id: string, v: string): string => id + String(v.length).padStart(2, '0') + v;

export interface ThamSoQR {
  /** Mã BIN ngân hàng, 6 số */
  readonly bin: string;
  readonly soTaiKhoan: string;
  readonly soTien?: number;
  readonly noiDung?: string;
}

export function chuoiVietQR({ bin, soTaiKhoan, soTien, noiDung }: ThamSoQR): string {
  if (!bin || !soTaiKhoan) return '';
  const tk =
    tlv('00', 'A000000727') +
    tlv('01', tlv('00', bin) + tlv('01', soTaiKhoan)) +
    tlv('02', 'QRIBFTTA');
  let p = tlv('00', '01') + tlv('01', soTien ? '12' : '11') + tlv('38', tk) + tlv('53', '704');
  if (soTien) p += tlv('54', String(Math.round(soTien)));
  p += tlv('58', 'VN');
  const nd = boDau(noiDung ?? '').slice(0, 99);
  if (nd) p += tlv('62', tlv('08', nd));
  p += '6304';
  return p + crc16(p);
}
