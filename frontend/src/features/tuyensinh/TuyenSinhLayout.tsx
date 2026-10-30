/**
 * Khung ứng dụng tuyển sinh liên kết: thanh điều hướng dính trên, một khung nội
 * dung đổi theo tab. Ưu tiên điện thoại — cán bộ làm việc ngoài hiện trường.
 *
 * Bộ chọn người dùng ở góc phải là CÔNG CỤ DEMO, đứng chỗ của đăng nhập thật.
 * Khi nối với API, thay bằng phiên đăng nhập và phân quyền của backend
 * (thuchien.md §10).
 */
import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { chuCai } from './dinh-dang';
import { useToi } from './dung-kho';
import { NHAN_SU, TEN_VAI_TRO } from './du-lieu/nhan-su';
import { useKho } from './kho/kho.store';
import { laApi } from './nguon/nguon';
import { BangTin } from './thanh-phan/ui';

interface Tab {
  readonly to: string;
  readonly ten: string;
  /** Vai trò được thấy tab này */
  readonly choVaiTro?: readonly string[];
}

const TABS: readonly Tab[] = [
  { to: '/tuyensinh', ten: 'Mạng lưới' },
  { to: '/tuyensinh/lap-ho-so', ten: 'Lập hồ sơ' },
  { to: '/tuyensinh/ho-so', ten: 'Hồ sơ của tôi' },
  { to: '/tuyensinh/doanh-so', ten: 'Doanh số' },
  { to: '/tuyensinh/doi-soat', ten: 'Đối soát', choVaiTro: ['TP', 'ADMIN'] },
  { to: '/tuyensinh/quan-tri', ten: 'Quản trị', choVaiTro: ['TN', 'TP', 'ADMIN'] },
];

export function TuyenSinhLayout() {
  const toiLaId = useKho((s) => s.toiLaId);
  const doiNguoiDung = useKho((s) => s.doiNguoiDung);
  const bao = useKho((s) => s.bao);
  const datBao = useKho((s) => s.datBao);
  // Nguồn api lấy người đăng nhập; nguồn demo lấy theo bộ chọn ở trên
  const toi = useToi();

  // Thông báo thành công tự tắt; lỗi phải để người dùng đọc rồi tự đóng
  useEffect(() => {
    if (!bao || bao.loai === 'loi') return;
    const h = setTimeout(() => datBao(null), 5000);
    return () => clearTimeout(h);
  }, [bao, datBao]);

  return (
    <div className="phoenix min-h-screen bg-phoenix-surface">
      <header className="sticky top-0 z-20 border-b border-phoenix-line bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-[1100px] px-4 pt-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src="/brand/phoenix-icon.png"
                alt=""
                className="h-8 w-8 flex-none rounded-md object-contain"
              />
              <div className="flex min-w-0 flex-col">
                <b className="truncate text-[15px] font-bold tracking-tight text-phoenix-navy">
                  Tuyển sinh liên kết
                </b>
                <span className="truncate text-[11px] text-phoenix-muted">
                  Trường Trung cấp Quốc tế Phoenix
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {laApi ? (
                <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
                  <span className="truncate text-[12.5px] font-semibold text-phoenix-ink">
                    {toi.hoTen}
                  </span>
                  <span className="text-[10.5px] text-phoenix-muted">
                    {TEN_VAI_TRO[toi.vaiTro]} · {toi.nhom}
                  </span>
                </div>
              ) : (
                <label className="flex min-w-0 flex-col items-end gap-0.5 text-right">
                  <span className="sr-only">Chọn người dùng demo</span>
                  <select
                    value={toiLaId}
                    onChange={(e) => doiNguoiDung(e.target.value)}
                    className={cn(
                      'max-w-[190px] cursor-pointer rounded-md border border-phoenix-line',
                      'bg-background px-2 py-1 text-[12.5px] font-semibold text-phoenix-ink',
                      'outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  >
                    {NHAN_SU.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.hoTen} — {TEN_VAI_TRO[n.vaiTro]}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10.5px] text-phoenix-muted">
                    {toi.nhom} · {toi.phong}
                  </span>
                </label>
              )}
              <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-grad-brand text-[12px] font-bold text-white">
                {chuCai(toi.hoTen)}
              </div>
            </div>
          </div>

          <nav
            aria-label="Chuyển màn hình"
            className="mt-2 flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.filter((t) => !t.choVaiTro || t.choVaiTro.includes(toi.vaiTro)).map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/tuyensinh'}
                className={({ isActive }) =>
                  cn(
                    'flex-none border-b-[2.5px] px-3 pb-2 pt-1.5 text-[13.5px] font-medium',
                    'whitespace-nowrap transition-colors',
                    isActive
                      ? 'border-phoenix-purple font-semibold text-phoenix-purple'
                      : 'border-transparent text-phoenix-slate hover:text-phoenix-ink',
                  )
                }
              >
                {t.ten}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1100px] flex-col gap-5 px-4 pb-20 pt-5">
        {bao ? (
          <button
            type="button"
            onClick={() => datBao(null)}
            className="text-left"
            aria-label="Đóng thông báo"
          >
            <BangTin loai={bao.loai}>{bao.chu}</BangTin>
          </button>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}
