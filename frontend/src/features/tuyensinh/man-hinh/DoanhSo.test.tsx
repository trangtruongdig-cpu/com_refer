import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DoanhSo } from './DoanhSo';

const hooks = vi.hoisted(() => ({
  useDuLieu: vi.fn(),
  useSoCongNo: vi.fn(),
  useToi: vi.fn(),
  useTongHopThang: vi.fn(),
}));

vi.mock('../dung-kho', () => hooks);
vi.mock('../tinh-toan', async (importOriginal) => {
  const actual = await importOriginal();
  return Object.assign({}, actual as object, {
    quyenLoiMotKy: vi.fn(() => ({ soTien: 875_000 })),
  });
});

const thang = new Date().toISOString().slice(0, 7);

describe('DoanhSo', () => {
  beforeEach(() => {
    hooks.useToi.mockReturnValue({ id: 'NV-01', hoTen: 'Nguyễn Thị Mai', nhom: 'Nhóm A' });
    hooks.useDuLieu.mockReturnValue({ tatCa: [], hoSo: [] });
    hooks.useSoCongNo.mockReturnValue([
      {
        thang,
        quyenLoi: 1_000_000,
        ungThem: 0,
        thuHoi: 50_000,
        thucNhan: 950_000,
        noCuoiKy: 400_000,
      },
    ]);
    hooks.useTongHopThang.mockReturnValue({
      quyenLoi: 1_000_000,
      choDoiSoat: 2_200_000,
      soHoSoMoi: 2,
      kyThuTrongThang: [
        {
          lanThu: { ma: 'LT-01', ngayThu: `${thang}-05`, kyThu: 1 },
          hoSo: { hoTen: 'Trần Minh Anh' },
          ct: { tenNganh: 'Ngôn ngữ Anh' },
          thangNhanTien: null,
        },
      ],
    });
  });

  it('đưa khoản đã tính và trạng thái chờ đối soát lên trước', () => {
    render(
      <MemoryRouter>
        <DoanhSo />
      </MemoryRouter>,
    );

    expect(screen.getByText('Thực nhận theo bảng tính tháng')).toBeInTheDocument();
    expect(screen.getAllByText('950.000đ')).toHaveLength(2);
    expect(screen.getByText('Quyền lợi đã tính sau đối soát')).toBeInTheDocument();
    expect(screen.getByText('Quỹ chi đang chờ đối soát')).toBeInTheDocument();
    expect(screen.getByText('Chờ đối soát')).toBeInTheDocument();
    expect(screen.getByText('dự kiến')).toBeInTheDocument();
  });

  it('không mô tả kết quả tính là tiền đã chuyển cho Sale', () => {
    render(
      <MemoryRouter>
        <DoanhSo />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/chưa có trạng thái xác nhận đã chuyển khoản cho Sale/i),
    ).toBeInTheDocument();
  });
});
