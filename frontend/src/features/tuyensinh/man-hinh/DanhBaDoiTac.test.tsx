import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DoiTacThamKhao } from '../du-lieu/doi-tac-tham-khao';
import { DanhBaDoiTac, QuanLyDanhBaDoiTac } from './DanhBaDoiTac';

const hooks = vi.hoisted(() => ({
  useDanhBaDoiTac: vi.fn(),
  useHanhDongDanhBaDoiTac: vi.fn(),
  useToi: vi.fn(),
}));

vi.mock('../dung-kho', () => ({ useToi: hooks.useToi }));
vi.mock('../nguon/doi-tac-tham-khao', () => ({
  useDanhBaDoiTac: hooks.useDanhBaDoiTac,
  useHanhDongDanhBaDoiTac: hooks.useHanhDongDanhBaDoiTac,
}));

const taoDoiTac = (
  ma: string,
  ten: string,
  vung: DoiTacThamKhao['vung'],
  tinhThanh: string,
  ghiDe: Partial<DoiTacThamKhao> = {},
): DoiTacThamKhao => ({
  id: ma,
  ma,
  ten,
  tenNgan: ma,
  tinhThanh,
  vung,
  website: 'https://example.edu.vn',
  hinhThuc: ['TU_XA'],
  trangThaiHopTac: 'TIEM_NANG',
  nguonUrl: 'https://example.edu.vn/tuyen-sinh',
  nguonTieuDe: 'Thông báo tuyển sinh',
  ngayRaSoat: '2026-10-31',
  hienThiCongKhai: true,
  ghiChu: 'Thông tin tham khảo.',
  hoatDong: true,
  archivedAt: null,
  ...ghiDe,
});

describe('DanhBaDoiTac', () => {
  let danhBa: DoiTacThamKhao[];
  let hanhDong: {
    luu: ReturnType<typeof vi.fn>;
    luuTru: ReturnType<typeof vi.fn>;
    khoiPhuc: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    danhBa = [
      taoDoiTac('NORTH', 'Trường Đại học Miền Bắc', 'MIEN_BAC', 'Hà Nội'),
      taoDoiTac('SOUTH', 'Trường Đại học Miền Nam', 'MIEN_NAM', 'Cần Thơ'),
    ];
    hanhDong = {
      luu: vi.fn().mockResolvedValue(true),
      luuTru: vi.fn(async (doiTac: DoiTacThamKhao) => {
        danhBa = danhBa.map((muc) =>
          muc.ma === doiTac.ma
            ? { ...muc, hoatDong: false, archivedAt: '2026-10-31T00:00:00.000Z' }
            : muc,
        );
        return true;
      }),
      khoiPhuc: vi.fn(async (doiTac: DoiTacThamKhao) => {
        danhBa = danhBa.map((muc) =>
          muc.ma === doiTac.ma ? { ...muc, hoatDong: true, archivedAt: null } : muc,
        );
        return true;
      }),
    };
    hooks.useDanhBaDoiTac.mockImplementation((choQuanTri = false) => ({
      doiTac: choQuanTri
        ? danhBa
        : danhBa.filter((doiTac) => doiTac.hoatDong !== false && !doiTac.archivedAt),
      dangTai: false,
      loi: false,
    }));
    hooks.useHanhDongDanhBaDoiTac.mockReturnValue(hanhDong);
    hooks.useToi.mockReturnValue({ vaiTro: 'ADMIN' });
  });

  it('lọc danh bạ công khai theo khu vực và chỉ dẫn tới nguồn, không vào chi tiết chương trình', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DanhBaDoiTac />
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByRole('combobox', { name: 'Khu vực' }), 'MIEN_BAC');

    const danhSach = screen.getByRole('list', { name: 'Danh sách trường tiềm năng' });
    expect(within(danhSach).getByText('Trường Đại học Miền Bắc')).toBeInTheDocument();
    expect(within(danhSach).queryByText('Trường Đại học Miền Nam')).not.toBeInTheDocument();
    expect(
      within(danhSach).queryByRole('link', { name: /chuong-trinh/i }),
    ).not.toBeInTheDocument();
    expect(within(danhSach).queryByText('Thông tin tham khảo.')).not.toBeInTheDocument();
    expect(within(danhSach).getByRole('link', { name: /Thông báo tuyển sinh/ })).toHaveAttribute(
      'href',
      'https://example.edu.vn/tuyen-sinh',
    );
  });

  it('chỉ hiện khu vực quản lý cho ADMIN và mở đúng các thao tác', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MemoryRouter>
        <QuanLyDanhBaDoiTac />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Quản lý danh bạ trường' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Thêm trường' }));
    expect(screen.getByRole('heading', { name: 'Thêm đầu mối trường' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Ngày rà soát nguồn/)).toHaveValue(
      new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10),
    );
    await user.type(screen.getByLabelText(/Tên trường/), 'Trường Đại học Mới');
    await user.type(screen.getByLabelText(/Tỉnh \/ thành/), 'Hà Nội');
    await user.type(screen.getByLabelText(/Tên nguồn/), 'Thông báo tuyển sinh');
    await user.type(
      screen.getByLabelText(/URL nguồn/),
      'https://example.edu.vn/tuyen-sinh',
    );
    await user.click(screen.getByRole('button', { name: 'Thêm đầu mối' }));
    expect(hanhDong.luu).toHaveBeenCalledWith(
      expect.objectContaining({
        ma: 'TRUONG-DAI-HOC-MOI',
        hienThiCongKhai: true,
        nguonUrl: 'https://example.edu.vn/tuyen-sinh',
      }),
    );

    const nutSua = within(
      screen.getByRole('list', { name: 'Trường đang hoạt động' }),
    ).getAllByRole('button', { name: 'Sửa' })[0]!;
    await user.click(nutSua);
    expect(
      screen.getByRole('heading', { name: 'Sửa Trường Đại học Miền Bắc' }),
    ).toBeInTheDocument();
    const hienThiCongKhai = screen.getByLabelText('Hiển thị trên danh bạ công khai');
    expect(hienThiCongKhai).toBeChecked();
    await user.click(hienThiCongKhai);
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(hanhDong.luu).toHaveBeenLastCalledWith(
      expect.objectContaining({ ma: 'NORTH', hienThiCongKhai: false }),
    );

    const xacNhan = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(screen.getByRole('button', { name: 'Lưu trữ Trường Đại học Miền Bắc' }));
    expect(xacNhan).toHaveBeenCalledWith(
      'Lưu trữ Trường Đại học Miền Bắc? Lịch sử đầu mối sẽ được giữ lại.',
    );
    expect(hanhDong.luuTru).not.toHaveBeenCalled();
    xacNhan.mockReturnValue(true);
    const dauMoi = danhBa[0]!;
    await user.click(screen.getByRole('button', { name: 'Lưu trữ Trường Đại học Miền Bắc' }));
    expect(hanhDong.luuTru).toHaveBeenCalledWith(dauMoi);
    await user.click(screen.getByRole('button', { name: 'Xem đã lưu trữ' }));
    expect(screen.getByText('Trường Đại học Miền Bắc')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Khôi phục' }));
    expect(hanhDong.khoiPhuc).toHaveBeenCalledWith(
      expect.objectContaining({ ma: 'NORTH', hoatDong: false }),
    );

    hooks.useToi.mockReturnValue({ vaiTro: 'NV' });
    rerender(
      <MemoryRouter>
        <QuanLyDanhBaDoiTac />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('heading', { name: 'Quản lý danh bạ trường' })).toBeNull();
  });
});
