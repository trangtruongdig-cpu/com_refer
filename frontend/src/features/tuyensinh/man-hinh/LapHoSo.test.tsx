import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CHUONG_TRINH } from '../du-lieu/danh-muc';
import { LapHoSo } from './LapHoSo';

const hooks = vi.hoisted(() => ({
  useDanhMuc: vi.fn(),
  useChuongTrinh: vi.fn(),
  useHanhDong: vi.fn(),
}));

vi.mock('../dung-kho', () => hooks);

function renderLapHoSo(ma: string) {
  return render(
    <MemoryRouter initialEntries={[`/tuyensinh/lap-ho-so?ct=${ma}`]}>
      <LapHoSo />
    </MemoryRouter>,
  );
}

describe('LapHoSo', () => {
  beforeEach(() => {
    hooks.useDanhMuc.mockReturnValue({ chuongTrinh: CHUONG_TRINH });
    hooks.useChuongTrinh.mockImplementation((ma: string) =>
      CHUONG_TRINH.find((chuongTrinh) => chuongTrinh.ma === ma),
    );
    hooks.useHanhDong.mockReturnValue({ lapHoSo: vi.fn() });
  });

  it('không yêu cầu Sale khai bằng cấp cho khóa ngắn hạn', () => {
    renderLapHoSo('NH-CSSD-PTTM');

    expect(screen.queryByText('Trình độ và ngành đã hoàn thành')).not.toBeInTheDocument();
    expect(screen.getByText(/Khóa ngắn hạn không yêu cầu khai bằng cấp/i)).toBeInTheDocument();
  });

  it('vẫn yêu cầu trình độ đầu vào cho chương trình trung cấp đang vận hành', () => {
    renderLapHoSo('TC-CSSD');

    const tenTruong = screen.getByText('Trình độ và ngành đã hoàn thành');
    const input = tenTruong.closest('label')?.querySelector('input');

    expect(input).toBeRequired();
  });
});
