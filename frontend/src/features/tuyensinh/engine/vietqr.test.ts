import { describe, expect, it } from 'vitest';
import { boDau, chuoiVietQR, crc16 } from './vietqr';

describe('crc16 — CCITT-FALSE', () => {
  it('giá trị kiểm chuẩn "123456789" là 29B1', () => {
    expect(crc16('123456789')).toBe('29B1');
  });
});

describe('boDau', () => {
  it('bỏ dấu, bỏ ký tự lạ, in hoa', () => {
    expect(boDau('Nguyễn Thị Hương')).toBe('NGUYEN THI HUONG');
    expect(boDau('HS2609-01 Đỗ Văn Nam KY1')).toBe('HS260901 DO VAN NAM KY1');
  });
});

describe('chuoiVietQR', () => {
  const chuoi = chuoiVietQR({
    bin: '970415',
    soTaiKhoan: '0000001234567',
    soTien: 11_000_000,
    noiDung: 'HS01 Nguyễn Thu Hà KY1',
  });

  it('mở đầu bằng phiên bản EMVCo và điểm khởi tạo động', () => {
    expect(chuoi.startsWith('000201010212')).toBe(true);
  });

  it('bốn ký tự cuối là CRC của toàn bộ chuỗi phía trước', () => {
    const than = chuoi.slice(0, -4);
    expect(chuoi.slice(-4)).toBe(crc16(than));
    expect(than.endsWith('6304')).toBe(true);
  });

  it('có mã tiền VND, mã quốc gia và số tiền', () => {
    expect(chuoi).toContain('5303704');
    expect(chuoi).toContain('5802VN');
    expect(chuoi).toContain('540811000000');
  });

  it('nội dung chuyển khoản được bỏ dấu', () => {
    expect(chuoi).toContain('HS01 NGUYEN THU HA KY1');
  });

  it('thiếu số tài khoản hoặc mã ngân hàng thì không dựng chuỗi', () => {
    expect(chuoiVietQR({ bin: '', soTaiKhoan: '123' })).toBe('');
    expect(chuoiVietQR({ bin: '970415', soTaiKhoan: '' })).toBe('');
  });
});
