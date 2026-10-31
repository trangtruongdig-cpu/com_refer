import { describe, expect, it } from 'vitest';
import type { DoiTacThamKhao } from '../du-lieu/doi-tac-tham-khao';
import { locDoiTacCongKhai } from './doi-tac-tham-khao';

const taoDoiTac = (ghiDe: Partial<DoiTacThamKhao> = {}): DoiTacThamKhao => ({
  ma: 'TEST',
  ten: 'Trường kiểm thử',
  tinhThanh: 'Hà Nội',
  vung: 'MIEN_BAC',
  hinhThuc: [],
  trangThaiHopTac: 'TIEM_NANG',
  nguonUrl: 'https://example.edu.vn',
  nguonTieuDe: 'Nguồn kiểm thử',
  ngayRaSoat: '2026-10-31',
  ...ghiDe,
});

describe('locDoiTacCongKhai', () => {
  it('ẩn đầu mối đã lưu trữ hoặc được admin tắt hiển thị', () => {
    const congKhai = taoDoiTac({ ma: 'PUBLIC' });
    const biAn = taoDoiTac({ ma: 'HIDDEN', hienThiCongKhai: false });
    const daLuuTru = taoDoiTac({
      ma: 'ARCHIVED',
      hoatDong: false,
      archivedAt: '2026-10-31T00:00:00.000Z',
    });

    expect(locDoiTacCongKhai([congKhai, biAn, daLuuTru])).toEqual([congKhai]);
  });

  it('giữ tương thích với đầu mối cũ chưa có trường hiển thị', () => {
    const doiTacCu = taoDoiTac();

    expect(locDoiTacCongKhai([doiTacCu])).toEqual([doiTacCu]);
  });
});
