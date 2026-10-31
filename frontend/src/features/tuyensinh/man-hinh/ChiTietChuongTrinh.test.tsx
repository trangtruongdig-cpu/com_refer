import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CHUONG_TRINH } from '../du-lieu/danh-muc';
import { ChiTietChuongTrinh } from './ChiTietChuongTrinh';

const hooks = vi.hoisted(() => ({
  useDanhMuc: vi.fn(),
  useSoatTran: vi.fn(),
}));

vi.mock('../dung-kho', () => hooks);

function renderChiTiet(ma = 'DHCNVT-NNA') {
  return render(
    <MemoryRouter initialEntries={[`/tuyensinh/chuong-trinh/${ma}`]}>
      <Routes>
        <Route path="/tuyensinh/chuong-trinh/:ma" element={<ChiTietChuongTrinh />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ChiTietChuongTrinh', () => {
  beforeEach(() => {
    hooks.useDanhMuc.mockReturnValue({ chuongTrinh: CHUONG_TRINH, dangTai: false });
    hooks.useSoatTran.mockReturnValue({
      chi: [{ ma: 'NV', soTien: 1_500_000 }],
    });
  });

  it('hiển thị lộ trình và số kỳ của chương trình', () => {
    renderChiTiet();

    expect(screen.getByRole('heading', { name: 'Ngôn ngữ Anh' })).toBeInTheDocument();
    expect(screen.getByText('Liên thông: Cao đẳng → Đại học')).toBeInTheDocument();
    expect(screen.getByText('18 tháng · 4 kỳ')).toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: '4 kỳ đào tạo' })).getAllByText(/^Kỳ/),
    ).toHaveLength(4);
  });

  it('hiển thị đúng cả THCS và THPT cho trung cấp Phoenix ngoài khối sức khỏe', () => {
    renderChiTiet('TC-CSSD');

    expect(screen.getByText('Tuyển từ THCS / THPT')).toBeInTheDocument();
    expect(screen.getByText(/tốt nghiệp THCS, THPT hoặc tương đương/i)).toBeInTheDocument();
  });

  it('chỉ hiện học phí theo kỳ như đang chờ thông báo và khoản Sale là tạm tính', () => {
    renderChiTiet();

    expect(screen.getByRole('heading', { name: 'Học phí theo kỳ' })).toBeInTheDocument();
    expect(screen.getAllByText('Chưa có thông báo học phí')).toHaveLength(4);
    expect(screen.getByText(/học phí mỗi kỳ có thể khác nhau/i)).toBeInTheDocument();
    expect(screen.getByText(/tạm tính theo dữ liệu hiện có/i)).toBeInTheDocument();
    expect(screen.getByText('Khoản Sale dự kiến sau đối soát')).toBeInTheDocument();
    expect(screen.queryByText('44.000.000đ')).not.toBeInTheDocument();
  });

  it('giữ checklist điều kiện, giấy tờ và đường sang lập hồ sơ', () => {
    renderChiTiet();

    expect(screen.getByRole('heading', { name: 'Điều kiện dự tuyển' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hồ sơ cần thu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lập hồ sơ ngành này' })).toHaveAttribute(
      'href',
      '/tuyensinh/lap-ho-so?ct=DHCNVT-NNA',
    );
  });

  it('không tính khoản Sale từ số liệu chương trình chưa đối chiếu', () => {
    renderChiTiet('DHCNVT-QTKD');

    expect(screen.getByText(/số liệu mẫu chưa được đối chiếu/i)).toBeInTheDocument();
    expect(screen.queryByText('Khoản Sale dự kiến sau đối soát')).not.toBeInTheDocument();
    expect(hooks.useSoatTran).toHaveBeenCalledWith(undefined, 3);
  });

  it('hiển thị thông tin VB2 TDMU, phí theo tín chỉ và không mở luồng hồ sơ/hoa hồng', () => {
    renderChiTiet('TDMU-NGON_NGU_ANH');

    expect(screen.getByRole('heading', { name: 'Ngôn ngữ Anh' })).toBeInTheDocument();
    expect(screen.getAllByText('Văn bằng 2 được trường gọi tên chính thức')).toHaveLength(2);
    expect(
      screen.getByText(
        'Đại học từ xa, học trực tuyến; thi kết thúc học phần theo kế hoạch của trường',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('477.500đ / tín chỉ')).toBeInTheDocument();
    expect(
      screen.getByText('70 tín chỉ, dự kiến 2 năm; học phí đóng theo tín chỉ và chia 4 đợt.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Chỉ tuyển ngành còn chỉ tiêu sau đợt 1/)).toBeInTheDocument();
    expect(screen.getByText(/Chưa có hoa hồng hoặc tiền Sale được xác minh/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Thông báo 227\/TB-ĐHTDM/ })).toHaveAttribute(
      'href',
      'https://tdmu.edu.vn/hinh/thuvien/taptin/10-27-2026-2-54-30-pm227TB.signed.pdf',
    );
    expect(screen.queryByRole('link', { name: /Lập hồ sơ ngành này/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Khoản Sale dự kiến sau đối soát')).not.toBeInTheDocument();
  });
});
