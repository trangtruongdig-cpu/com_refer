/**
 * Thành phần giao diện dùng chung, dựng theo theme Phoenix
 * (src/styles/phoenix-theme.css — copy từ repo khiemnguyendinh/phoenix-skills).
 *
 * Yêu cầu chức năng, không phải trang trí: CHẠY TỐT Ở BỀ NGANG 400px. Cán bộ
 * tuyển sinh dùng điện thoại ngoài hiện trường.
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function The({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-phoenix-line bg-card p-4 shadow-phoenix-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TheBam({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'cursor-pointer rounded-lg border border-phoenix-line bg-card p-4 shadow-phoenix-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-phoenix-purple',
        'hover:shadow-phoenix-md focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="kicker block">{children}</span>;
}

export function DauMuc({
  tieuDe,
  phu,
  children,
  cap = 1,
}: {
  tieuDe: string;
  phu?: string;
  children?: ReactNode;
  cap?: 1 | 2;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {cap === 1 ? (
          <h1 className="font-display text-[26px] font-bold uppercase leading-tight tracking-tight text-phoenix-navy sm:text-[32px]">
            {tieuDe}
          </h1>
        ) : (
          <h2 className="font-display text-[19px] font-semibold uppercase leading-tight tracking-tight text-phoenix-navy">
            {tieuDe}
          </h2>
        )}
        {children}
      </div>
      {phu ? <p className="max-w-3xl text-sm text-phoenix-muted">{phu}</p> : null}
    </div>
  );
}

const MAU_CO = {
  he: 'bg-phoenix-lavender-50 text-phoenix-purple-700',
  ok: 'bg-phoenix-success-bg text-phoenix-success-fg',
  cho: 'bg-phoenix-warning-bg text-phoenix-warning-fg',
  loi: 'bg-phoenix-danger-bg text-phoenix-danger-fg',
  xam: 'bg-phoenix-sunken text-phoenix-slate',
  vang: 'bg-phoenix-yellow/25 text-phoenix-yellow-600',
} as const;

export type LoaiCo = keyof typeof MAU_CO;

export function Co({
  loai = 'xam',
  children,
  className,
}: {
  loai?: LoaiCo;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5',
        'text-[11px] font-semibold',
        MAU_CO[loai],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function OSo({
  nhan,
  so,
  phu,
  mau = 'thuong',
}: {
  nhan: string;
  so: string;
  phu?: string;
  mau?: 'thuong' | 'chinh' | 'tien' | 'canh';
}) {
  const mauSo = {
    thuong: 'text-phoenix-ink',
    chinh: 'text-phoenix-purple',
    tien: 'text-phoenix-yellow-600',
    canh: 'text-phoenix-danger-fg',
  }[mau];
  return (
    <The className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-phoenix-muted">
        {nhan}
      </span>
      <span className={cn('text-[22px] font-extrabold leading-tight tabular-nums', mauSo)}>
        {so}
      </span>
      {phu ? <span className="text-[11.5px] leading-snug text-phoenix-muted">{phu}</span> : null}
    </The>
  );
}

export function Mini({ nhan, gia }: { nhan: string; gia: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-phoenix-muted">
        {nhan}
      </span>
      <span className="truncate text-[13.5px] font-bold tabular-nums text-phoenix-ink">{gia}</span>
    </div>
  );
}

const MAU_TIN = {
  tin: 'bg-phoenix-info-bg text-phoenix-info-fg',
  ok: 'bg-phoenix-success-bg text-phoenix-success-fg',
  canh: 'bg-phoenix-warning-bg text-phoenix-warning-fg',
  loi: 'bg-phoenix-danger-bg text-phoenix-danger-fg',
} as const;

export function BangTin({
  loai = 'tin',
  children,
}: {
  loai?: keyof typeof MAU_TIN;
  children: ReactNode;
}) {
  const dau = { tin: 'i', ok: '✓', canh: '!', loi: '✕' }[loai];
  return (
    <div className={cn('flex gap-2.5 rounded-xl px-3.5 py-3 text-[13px]', MAU_TIN[loai])}>
      <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-white/70 text-[11px] font-bold">
        {dau}
      </span>
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  );
}

export function Dong({
  mt,
  phu,
  gt,
  tong = false,
}: {
  mt: ReactNode;
  phu?: ReactNode;
  gt: ReactNode;
  tong?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-3 py-1.5',
        tong
          ? 'mt-1 border-t-2 border-phoenix-line pt-2.5'
          : 'border-b border-dashed border-phoenix-line last:border-b-0',
      )}
    >
      <span className="min-w-0 text-[13px]">
        <span className={cn(tong && 'font-semibold')}>{mt}</span>
        {phu ? (
          <small className="block text-[11.5px] leading-snug text-phoenix-muted">{phu}</small>
        ) : null}
      </span>
      <span
        className={cn(
          'whitespace-nowrap font-semibold tabular-nums',
          tong ? 'text-[17px] text-phoenix-yellow-600' : 'text-[13px]',
        )}
      >
        {gt}
      </span>
    </div>
  );
}

export function TienDo({ tyLe }: { tyLe: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-phoenix-sunken">
      <div
        className="h-full rounded-full bg-grad-brand transition-[width] duration-300"
        style={{ width: `${Math.max(0, Math.min(1, tyLe)) * 100}%` }}
      />
    </div>
  );
}

export function Cuon({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-phoenix-line bg-card shadow-phoenix-sm">
      {children}
    </div>
  );
}

export function Bang({ children, hep = false }: { children: ReactNode; hep?: boolean }) {
  return (
    <table
      className={cn('w-full border-collapse text-[13px]', hep ? 'min-w-[380px]' : 'min-w-[640px]')}
    >
      {children}
    </table>
  );
}

export function Th({
  children,
  so = false,
}: {
  children?: ReactNode;
  so?: boolean;
}) {
  return (
    <th
      className={cn(
        'whitespace-nowrap border-b border-phoenix-line bg-phoenix-sunken px-3 py-2',
        'text-[10.5px] font-bold uppercase tracking-[0.06em] text-phoenix-muted',
        so ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  so = false,
  className,
}: {
  children?: ReactNode;
  so?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'border-b border-phoenix-line px-3 py-2 align-top',
        so && 'whitespace-nowrap text-right tabular-nums',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function HangNhom({ children, colSpan }: { children: ReactNode; colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn(
          'border-b border-phoenix-line bg-phoenix-lavender-50 px-3 py-1.5',
          'text-[11.5px] font-bold uppercase tracking-[0.04em] text-phoenix-purple-700',
        )}
      >
        {children}
      </td>
    </tr>
  );
}

export function Rong({ children }: { children: ReactNode }) {
  return <div className="px-4 py-9 text-center text-sm text-phoenix-muted">{children}</div>;
}

export function Ghi({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-phoenix-muted">{children}</p>;
}

export function Nhan({
  ten,
  batBuoc = false,
  children,
}: {
  ten: string;
  batBuoc?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-semibold text-phoenix-ink">
        {ten}
        {batBuoc ? <span className="text-phoenix-danger-fg"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

const O_NHAP =
  'w-full min-w-0 rounded-md border border-phoenix-line bg-background px-3 py-2 text-sm ' +
  'text-phoenix-ink outline-none transition-colors focus-visible:border-phoenix-purple ' +
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1';

export function ONhap(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(O_NHAP, props.className)} />;
}

export function OChon(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(O_NHAP, props.className)} />;
}

export function OVan(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(O_NHAP, 'min-h-16 resize-y', props.className)} />;
}

export function Luoi({
  cot = 2,
  children,
  className,
}: {
  cot?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  const be = { 2: 'min-w-[260px]', 3: 'min-w-[190px]', 4: 'min-w-[140px]' }[cot];
  return (
    <div
      className={cn('grid gap-3', className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${be.match(/\d+/)![0]}px, 1fr))` }}
    >
      {children}
    </div>
  );
}
