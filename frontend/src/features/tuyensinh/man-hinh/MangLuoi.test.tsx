import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CHUONG_TRINH } from '../du-lieu/danh-muc';
import { ChiTietChuongTrinh } from './ChiTietChuongTrinh';
import { MangLuoi } from './MangLuoi';

const hooks = vi.hoisted(() => ({
  useDanhMuc: vi.fn(),
  useSoatTran: vi.fn(),
}));

vi.mock('../dung-kho', () => hooks);

function renderMangLuoi() {
  return render(
    <MemoryRouter initialEntries={['/tuyensinh']}>
      <Routes>
        <Route path="/tuyensinh" element={<MangLuoi />} />
        <Route path="/tuyensinh/chuong-trinh/:ma" element={<ChiTietChuongTrinh />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function moNhomLoc(user: ReturnType<typeof userEvent.setup>, ten: string) {
  const nutNhom = screen.getByRole('button', { name: ten });
  if (nutNhom.getAttribute('aria-expanded') !== 'true') {
    await user.click(nutNhom);
  }
}

describe('MangLuoi', () => {
  beforeEach(() => {
    hooks.useDanhMuc.mockReturnValue({ chuongTrinh: CHUONG_TRINH, dangTai: false });
    hooks.useSoatTran.mockReturnValue({ chi: [] });
  });

  it('trình bày chương trình trên lưới chung với nhận diện trường trong từng chip', () => {
    renderMangLuoi();

    const danhSach = screen.getByRole('list', { name: 'Danh sách chương trình' });
    const chuongTrinhVietTri = screen.getByRole('link', {
      name: /Ngôn ngữ Anh.*Đại học Công nghiệp Việt Trì/,
    });
    expect(within(danhSach).getAllByRole('link').length).toBeGreaterThan(5);
    expect(chuongTrinhVietTri).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Quản trị kinh doanh.*Số liệu chưa đối chiếu.*Đại học Công nghiệp Việt Trì/,
      }),
    ).toBeInTheDocument();
    expect(danhSach).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-3');
    expect(within(danhSach).getAllByText(/Cao đẳng → Đại học/)).toHaveLength(4);
    expect(within(danhSach).getByText(/Trung cấp → Đại học/)).toBeInTheDocument();
    expect(within(chuongTrinhVietTri).queryByText(/4 kỳ/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Trường Đại học đối tác 02' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Đại học Công nghiệp Việt Trì' }),
    ).not.toBeInTheDocument();
    const logoVietTri = within(chuongTrinhVietTri).getByRole('img', {
      name: 'Logo Đại học Công nghiệp Việt Trì',
    });
    expect(logoVietTri).toHaveAttribute('src', '/brand/dai-hoc-cong-nghiep-viet-tri.svg');
    expect(logoVietTri).toHaveClass('size-7', 'object-cover', 'object-left');
    const chuongTrinhPhoenix = screen.getByRole('link', {
      name: /Bào chế đông dược.*Trường Trung cấp Quốc tế Phoenix/,
    });
    const logoPhoenix = within(chuongTrinhPhoenix).getByRole('img', {
      name: 'Logo Trường Trung cấp Quốc tế Phoenix',
    });
    expect(logoPhoenix).toHaveAttribute('src', '/brand/phoenix-logo-full.png');
    expect(logoPhoenix).toHaveClass('size-7', 'object-contain');

    const chuongTrinhTDMU = screen.getByRole('link', {
      name: /Ngôn ngữ Anh.*Trường Đại học Thủ Dầu Một/,
    });
    expect(
      within(chuongTrinhTDMU).getByRole('img', {
        name: 'Logo Trường Đại học Thủ Dầu Một',
      }),
    ).toHaveAttribute('src', '/brand/tdmu.svg');

    const chuongTrinhHCCT = within(danhSach)
      .getAllByRole('link', {
        name: /Truyền thông đa phương tiện.*Trường Cao đẳng Thương mại và Du lịch Hà Nội/,
      })
      .find(
        (link) =>
          link.getAttribute('href') ===
          '/tuyensinh/chuong-trinh/HCCT-CD_TRUYEN_THONG_DA_PHUONG_TIEN',
      )!;
    expect(
      within(chuongTrinhHCCT).getByRole('img', {
        name: 'Logo Trường Cao đẳng Thương mại và Du lịch Hà Nội',
      }),
    ).toHaveAttribute('src', '/brand/hcct-official.png');
  });

  it('lọc sản phẩm ngắn hạn và mở chi tiết tư vấn không có luồng thu tiền', async () => {
    const user = userEvent.setup();
    renderMangLuoi();

    await user.click(screen.getByRole('button', { name: /Chứng chỉ \/ ngắn hạn/ }));

    expect(screen.getByRole('link', { name: /Chăm sóc da — Chứng chỉ \/ ngắn hạn/ })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Sơ cấp Chăm sóc da/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Chăm sóc da — Chứng chỉ \/ ngắn hạn/ }));

    expect(screen.getByRole('heading', { name: 'Chăm sóc da' })).toBeInTheDocument();
    expect(screen.getByText(/Sale cần hỏi/)).toBeInTheDocument();
    expect(screen.getByText(/không tính số tiền Sale nhận/i)).toBeInTheDocument();
    expect(screen.getByText('Tối đa đến 70% · chưa chốt cơ sở tính')).toBeInTheDocument();
    expect(screen.getByText(/Thứ 3 hằng tuần theo lịch chung 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/1\.750\.000đ/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Lập hồ sơ ngành này/i })).not.toBeInTheDocument();
    expect(hooks.useSoatTran).toHaveBeenCalledWith(undefined, 3);
  });

  it('lọc được sơ cấp và các chương trình nhận hồ sơ người đã có bằng đại học', async () => {
    const user = userEvent.setup();
    renderMangLuoi();

    await user.click(screen.getByRole('button', { name: /^Sơ cấp/ }));
    expect(screen.getByRole('link', { name: /Sơ cấp nghề Chăm sóc da/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ngôn ngữ Anh/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Văn bằng 2/ }));
    expect(
      screen.getByText(/có tuyến VB2 hoặc nhận hồ sơ người đã có bằng đại học/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Ngôn ngữ Anh.*Văn bằng 2.*Trường Đại học Thủ Dầu Một/,
      }),
    ).toBeInTheDocument();
    const chuongTrinhNEU = screen.getAllByRole('link', {
      name: /Đại học Kinh tế Quốc dân/,
    });
    expect(chuongTrinhNEU).toHaveLength(4);
    expect(
      within(chuongTrinhNEU[0]!).getByRole('img', {
        name: 'Logo Đại học Kinh tế Quốc dân',
      }),
    ).toHaveAttribute('src', '/brand/neu-emblem.webp');
  });

  it('tìm theo tên trường không dấu và xóa tìm kiếm để trở lại danh sách', async () => {
    const user = userEvent.setup();
    renderMangLuoi();

    const input = screen.getByRole('searchbox', { name: 'Tìm trường hoặc ngành' });
    await user.type(input, 'thu dau mot');

    const danhSach = screen.getByRole('list', { name: 'Danh sách chương trình' });
    expect(within(danhSach).getAllByRole('link')).toHaveLength(3);
    expect(
      within(danhSach)
        .getAllByRole('link')
        .every((link) => link.getAttribute('aria-label')?.includes('Trường Đại học Thủ Dầu Một')),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Xóa tìm kiếm' }));
    expect(within(danhSach).getAllByRole('link').length).toBeGreaterThan(100);
  });

  it('lọc một trường, hiển thị số lượng và cho phép xóa tất cả bộ lọc', async () => {
    const user = userEvent.setup();
    renderMangLuoi();

    const nutBoLocTruong = screen.getByRole('button', { name: 'Trường' });
    expect(nutBoLocTruong).toHaveAttribute('aria-expanded', 'false');
    await moNhomLoc(user, 'Trường');
    expect(nutBoLocTruong).toHaveAttribute('aria-expanded', 'true');

    const truongTDMU = screen.getByRole('button', {
      name: /Trường Đại học Thủ Dầu Một\s+3/,
    });
    await user.click(truongTDMU);

    const danhSach = screen.getByRole('list', { name: 'Danh sách chương trình' });
    const ketQua = within(danhSach).getAllByRole('link');
    expect(ketQua).toHaveLength(3);
    expect(
      ketQua.every((link) =>
        link.getAttribute('aria-label')?.includes('Trường Đại học Thủ Dầu Một'),
      ),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Xóa tất cả bộ lọc' }));
    expect(within(danhSach).getAllByRole('link').length).toBeGreaterThan(100);
  });

  it('kết hợp nhiều trường theo phép OR với loại chương trình và từ khóa', async () => {
    const user = userEvent.setup();
    renderMangLuoi();
    await moNhomLoc(user, 'Trường');

    await user.click(screen.getByRole('button', { name: /Trường Đại học Thủ Dầu Một/ }));
    await user.click(screen.getByRole('button', { name: /Bưu chính Viễn thông/ }));

    let danhSach = screen.getByRole('list', { name: 'Danh sách chương trình' });
    let ketQua = within(danhSach).getAllByRole('link');
    expect(ketQua.length).toBeGreaterThan(3);
    expect(
      ketQua.every((link) =>
        /Trường Đại học Thủ Dầu Một|Bưu chính Viễn thông/.test(
          link.getAttribute('aria-label') ?? '',
        ),
      ),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: /^Văn bằng 2/ }));
    const timKiem = screen.getByRole('searchbox', { name: 'Tìm trường hoặc ngành' });
    await user.type(timKiem, 'thu dau mot');

    danhSach = screen.getByRole('list', { name: 'Danh sách chương trình' });
    ketQua = within(danhSach).getAllByRole('link');
    expect(ketQua.length).toBeGreaterThan(0);
    expect(
      ketQua.every((link) =>
        /Văn bằng 2|Nhận người có bằng ĐH/.test(link.getAttribute('aria-label') ?? ''),
      ),
    ).toBe(true);
    expect(
      ketQua.every((link) =>
        link.getAttribute('aria-label')?.includes('Trường Đại học Thủ Dầu Một'),
      ),
    ).toBe(true);
  });

  it('lọc theo ngành không dấu, kết hợp với trường và xóa bộ lọc', async () => {
    const user = userEvent.setup();
    renderMangLuoi();
    await moNhomLoc(user, 'Ngành học');

    await user.type(screen.getByRole('searchbox', { name: 'Tìm ngành học' }), 'ngon ngu anh');
    const nganhNgonNguAnh = screen.getByRole('button', {
      name: /Ngôn ngữ Anh\s+\d+/,
    });
    await user.click(nganhNgonNguAnh);

    const danhSach = screen.getByRole('list', { name: 'Danh sách chương trình' });
    let ketQua = within(danhSach).getAllByRole('link');
    expect(ketQua.length).toBeGreaterThan(1);
    expect(ketQua.every((link) => link.getAttribute('aria-label')?.includes('Ngôn ngữ Anh'))).toBe(
      true,
    );

    await moNhomLoc(user, 'Trường');
    await user.click(screen.getByRole('button', { name: /Trường Đại học Thủ Dầu Một/ }));
    ketQua = within(danhSach).getAllByRole('link');
    expect(ketQua.length).toBeGreaterThan(0);
    expect(ketQua.every((link) => link.getAttribute('aria-label')?.includes('Ngôn ngữ Anh'))).toBe(
      true,
    );
    expect(
      ketQua.every((link) =>
        link.getAttribute('aria-label')?.includes('Trường Đại học Thủ Dầu Một'),
      ),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: /^Văn bằng 2/ }));
    ketQua = within(danhSach).getAllByRole('link');
    expect(ketQua).toHaveLength(1);
    expect(ketQua[0]?.getAttribute('aria-label')).toContain('Trường Đại học Thủ Dầu Một');

    await user.click(screen.getByRole('button', { name: 'Xóa tất cả bộ lọc' }));
    expect(screen.getByRole('searchbox', { name: 'Tìm ngành học' })).toHaveValue('');
    expect(within(danhSach).getAllByRole('link').length).toBeGreaterThan(100);
  });
});
