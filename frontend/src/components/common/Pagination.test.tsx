import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('hiển thị trang hiện tại và tổng số bản ghi', () => {
    render(<Pagination page={2} totalPages={5} total={48} onPageChange={vi.fn()} />);

    expect(screen.getByText('Trang 2 / 5 · 48 bản ghi')).toBeInTheDocument();
  });

  it('gọi onPageChange với trang kế tiếp / trước đó', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    await user.click(screen.getByRole('button', { name: 'Trang trước' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('vô hiệu hóa nút ở trang đầu và trang cuối', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeEnabled();

    rerender(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
  });
});
