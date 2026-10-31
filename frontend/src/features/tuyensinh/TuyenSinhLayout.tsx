/**
 * Khung tuyển sinh với điều hướng bên trái trên desktop và điều hướng dưới
 * trên điện thoại.
 *
 * Bộ chọn người dùng chỉ là công cụ demo; nguồn API lấy danh tính từ phiên.
 */
import { useEffect } from 'react';
import {
  ArrowLeftRight,
  FilePlus2,
  FolderOpen,
  Landmark,
  LayoutGrid,
  LogIn,
  Settings2,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useToi } from './dung-kho';
import { NHAN_SU, TEN_VAI_TRO } from './du-lieu/nhan-su';
import { useKho } from './kho/kho.store';
import { laApi } from './nguon/nguon';
import { BangTin } from './thanh-phan/ui';
import { useAuthStore } from '@/stores/auth.store';

interface Tab {
  readonly to: string;
  readonly ten: string;
  readonly icon: LucideIcon;
  readonly choVaiTro?: readonly string[];
}

const TABS: readonly Tab[] = [
  { to: '/tuyensinh', ten: 'Mạng lưới', icon: LayoutGrid },
  { to: '/tuyensinh/doi-tac-tham-khao', ten: 'Trường tiềm năng', icon: Landmark },
  { to: '/tuyensinh/lap-ho-so', ten: 'Lập hồ sơ', icon: FilePlus2 },
  { to: '/tuyensinh/ho-so', ten: 'Hồ sơ của tôi', icon: FolderOpen },
  { to: '/tuyensinh/doanh-so', ten: 'Doanh số', icon: WalletCards },
  {
    to: '/tuyensinh/doi-soat',
    ten: 'Đối soát',
    icon: ArrowLeftRight,
    choVaiTro: ['TP', 'ADMIN'],
  },
  {
    to: '/tuyensinh/quan-tri',
    ten: 'Quản trị',
    icon: Settings2,
    choVaiTro: ['TN', 'TP', 'ADMIN'],
  },
];

function NguoiDungMenu({
  toiLaId,
  doiNguoiDung,
  toi,
  compact = false,
  khach = false,
}: {
  toiLaId: string;
  doiNguoiDung: (id: string) => void;
  toi: ReturnType<typeof useToi>;
  compact?: boolean;
  khach?: boolean;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', compact && 'items-end')}>
      {laApi ? (
        khach ? (
          <NavLink
            to="/login"
            className="inline-flex min-h-9 items-center gap-2 text-[12px] font-semibold text-phoenix-purple"
          >
            <LogIn aria-hidden="true" className="size-4" />
            Đăng nhập
          </NavLink>
        ) : (
          <>
            <span className="max-w-full truncate text-[12.5px] font-semibold text-phoenix-ink">
              {toi.hoTen}
            </span>
            <span className="truncate text-[11px] text-phoenix-muted">
              {TEN_VAI_TRO[toi.vaiTro]} · {toi.nhom}
            </span>
          </>
        )
      ) : (
        <>
          <label className="sr-only" htmlFor={compact ? 'nguoi-dung-mobile' : 'nguoi-dung-desktop'}>
            Chọn người dùng demo
          </label>
          <select
            id={compact ? 'nguoi-dung-mobile' : 'nguoi-dung-desktop'}
            value={toiLaId}
            onChange={(e) => doiNguoiDung(e.target.value)}
            className={cn(
              'min-w-0 cursor-pointer rounded-md border border-phoenix-line bg-background',
              'px-2 py-1.5 text-[12px] font-semibold text-phoenix-ink',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring',
              compact ? 'max-w-[154px]' : 'w-full',
            )}
          >
            {NHAN_SU.map((n) => (
              <option key={n.id} value={n.id}>
                {n.hoTen}
              </option>
            ))}
          </select>
          <span
            className={cn(
              'truncate text-phoenix-muted',
              compact ? 'max-w-[154px] text-right text-[10px]' : 'text-[11px]',
            )}
          >
            {compact
              ? TEN_VAI_TRO[toi.vaiTro]
              : `${TEN_VAI_TRO[toi.vaiTro]} · ${toi.nhom} · ${toi.phong}`}
          </span>
        </>
      )}
    </div>
  );
}

function MucDieuHuong({ tab, mobile = false }: { tab: Tab; mobile?: boolean }) {
  const Icon = tab.icon;
  const { pathname } = useLocation();

  return (
    <NavLink
      to={tab.to}
      end={tab.to === '/tuyensinh'}
      className={({ isActive }) =>
        cn(
          'group flex min-w-0 items-center font-medium transition-colors',
          mobile
            ? 'min-h-14 flex-col justify-center gap-1 rounded-md px-1 py-1 text-center'
            : 'gap-3 rounded-md px-3 py-2.5 text-[13.5px]',
          isActive || (tab.to === '/tuyensinh' && pathname.startsWith('/tuyensinh/chuong-trinh/'))
            ? 'bg-phoenix-lavender-50 font-semibold text-phoenix-purple-700'
            : 'text-phoenix-slate hover:bg-phoenix-panel hover:text-phoenix-ink',
        )
      }
    >
      <Icon aria-hidden="true" className={cn('shrink-0', mobile ? 'size-[18px]' : 'size-[18px]')} />
      <span className={cn(mobile && 'max-w-full text-[9.5px] leading-3')}>
        {mobile && tab.to === '/tuyensinh/ho-so' ? 'Hồ sơ' : tab.ten}
      </span>
    </NavLink>
  );
}

export function TuyenSinhLayout() {
  const toiLaId = useKho((s) => s.toiLaId);
  const doiNguoiDung = useKho((s) => s.doiNguoiDung);
  const bao = useKho((s) => s.bao);
  const datBao = useKho((s) => s.datBao);
  const toi = useToi();
  const user = useAuthStore((state) => state.user);
  const laQuanTriHeThong = laApi && user?.role === 'ADMIN';
  const tabs = TABS.filter(
    (tab) =>
      (laApi && !user
        ? tab.to === '/tuyensinh/doi-tac-tham-khao'
        : !tab.choVaiTro ||
          tab.choVaiTro.includes(toi.vaiTro) ||
          (tab.to === '/tuyensinh/quan-tri' && laQuanTriHeThong)),
  );

  useEffect(() => {
    if (!bao || bao.loai === 'loi') return;
    const h = setTimeout(() => datBao(null), 5000);
    return () => clearTimeout(h);
  }, [bao, datBao]);

  return (
    <div className="phoenix min-h-dvh bg-phoenix-surface lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-phoenix-line bg-card lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <img
            src="/brand/phoenix-icon.png"
            alt="Phoenix"
            className="size-10 flex-none object-contain"
          />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold text-phoenix-navy">
              Tuyển sinh liên kết
            </div>
            <div className="truncate text-[11px] text-phoenix-muted">
              Trường Trung cấp Quốc tế Phoenix
            </div>
          </div>
        </div>

        <nav aria-label="Điều hướng chính" className="flex flex-col gap-1 px-3">
          {tabs.map((tab) => (
            <MucDieuHuong key={tab.to} tab={tab} />
          ))}
        </nav>

        <div className="mt-auto border-t border-phoenix-line p-4">
          <NguoiDungMenu
            toiLaId={toiLaId}
            doiNguoiDung={doiNguoiDung}
            toi={toi}
            khach={laApi && !user}
          />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-phoenix-line bg-card/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/brand/phoenix-icon.png"
              alt="Phoenix"
              className="size-8 flex-none object-contain"
            />
            <span className="truncate text-[13px] font-bold text-phoenix-navy">
              Tuyển sinh liên kết
            </span>
          </div>
          <NguoiDungMenu
            toiLaId={toiLaId}
            doiNguoiDung={doiNguoiDung}
            toi={toi}
            compact
            khach={laApi && !user}
          />
        </header>

        <ScrollRestoration />

        <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 lg:gap-7 lg:px-10 lg:py-8 lg:pb-10">
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

      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-phoenix-line bg-card/95 px-1 pt-1 backdrop-blur lg:hidden"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => (
          <MucDieuHuong key={tab.to} tab={tab} mobile />
        ))}
      </nav>
    </div>
  );
}
