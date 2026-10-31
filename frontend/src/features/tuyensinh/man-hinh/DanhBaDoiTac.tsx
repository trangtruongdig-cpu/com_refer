import { Archive, ExternalLink, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import {
  CAC_HINH_THUC_DOI_TAC,
  TEN_VUNG_DOI_TAC,
  TRANG_THAI_DOI_TAC,
  tenHinhThucDoiTac,
  type DoiTacThamKhao,
  type TrangThaiDoiTacThamKhao,
  type VungDoiTac,
} from '../du-lieu/doi-tac-tham-khao';
import { useToi } from '../dung-kho';
import { useAuthStore } from '@/stores/auth.store';
import { laApi } from '../nguon/nguon';
import { useDanhBaDoiTac, useHanhDongDanhBaDoiTac } from '../nguon/doi-tac-tham-khao';
import { BoChuyenDanhMuc } from '../thanh-phan/BoChuyenDanhMuc';
import { BangTin, Co, DauMuc, Nhan, ONhap, OChon, OVan, Rong } from '../thanh-phan/ui';

const LOGO_DOI_TAC: Readonly<Record<string, { src: string; className?: string }>> = {
  CTU: { src: '/brand/ctu.png' },
  FTU: { src: '/brand/ftu.png', className: 'object-cover object-left' },
  NEU: { src: '/brand/neu-emblem.webp', className: 'h-auto w-11 max-w-none object-contain' },
  PTIT: { src: '/brand/ptit.svg' },
  TDMU: { src: '/brand/tdmu.svg' },
  'VNU-LAW': { src: '/brand/ul-vnu.svg' },
  DNTU: { src: '/brand/dntu.svg' },
  TMU: { src: '/brand/tmu.svg' },
  TDTU: { src: '/brand/tdtu.png' },
};

const chuanHoa = (giaTri: string) =>
  giaTri
    .trim()
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

function LogoDoiTac({ doiTac }: { doiTac: DoiTacThamKhao }) {
  const logo = LOGO_DOI_TAC[doiTac.ma];
  return (
    <div
      className="grid size-11 flex-none place-items-center overflow-hidden rounded border border-phoenix-line bg-white"
      title={doiTac.ten}
    >
      {logo ? (
        <img
          src={logo.src}
          alt={`Logo ${doiTac.ten}`}
          className={cn('size-8 object-contain', logo.className)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          role="img"
          aria-label={`Nhận diện tạm thời ${doiTac.ten}`}
          className="grid size-full place-items-center bg-phoenix-sunken text-[11px] font-bold text-phoenix-slate"
        >
          {doiTac.tenNgan?.slice(0, 4) || doiTac.ma.slice(0, 3)}
        </span>
      )}
    </div>
  );
}

function TruongDoiTac({ doiTac }: { doiTac: DoiTacThamKhao }) {
  return (
    <article className="flex min-h-[208px] min-w-0 flex-col gap-3 border-b border-phoenix-line py-4">
      <div className="flex min-w-0 items-start gap-3">
        <LogoDoiTac doiTac={doiTac} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold leading-snug text-phoenix-ink">{doiTac.ten}</h3>
          <p className="mt-1 text-[12px] text-phoenix-muted">
            {doiTac.tinhThanh} · {TEN_VUNG_DOI_TAC[doiTac.vung]}
          </p>
          <Co loai="cho" className="mt-2 whitespace-normal text-left">
            {TRANG_THAI_DOI_TAC[doiTac.trangThaiHopTac]}
          </Co>
        </div>
      </div>

      <div className="min-w-0 flex-1 border-l-2 border-phoenix-line pl-3">
        <p className="text-[10.5px] font-semibold text-phoenix-muted">Hình thức có nguồn</p>
        <p className="mt-1 text-[12px] leading-relaxed text-phoenix-ink">
          {doiTac.hinhThuc.length
            ? doiTac.hinhThuc.map(tenHinhThucDoiTac).join(' · ')
            : 'Chưa xác minh hình thức đào tạo cụ thể'}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-phoenix-line pt-2">
        <a
          href={doiTac.nguonUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-8 min-w-0 items-center gap-1.5 text-[11px] font-semibold text-phoenix-purple hover:underline"
        >
          <span className="line-clamp-2">{doiTac.nguonTieuDe}</span>
          <ExternalLink aria-hidden="true" className="size-3.5 flex-none" />
        </a>
        <span className="flex-none text-[10.5px] text-phoenix-muted">
          Rà soát {doiTac.ngayRaSoat}
        </span>
      </div>
    </article>
  );
}

export function DanhBaDoiTac() {
  const [tuKhoa, datTuKhoa] = useState('');
  const [vung, datVung] = useState<VungDoiTac | 'TAT_CA'>('TAT_CA');
  const [tinhThanh, datTinhThanh] = useState('TAT_CA');
  const [hinhThuc, datHinhThuc] = useState<string>('TAT_CA');
  const [trangThai, datTrangThai] = useState<TrangThaiDoiTacThamKhao | 'TAT_CA'>('TAT_CA');
  const { doiTac, dangTai, loi } = useDanhBaDoiTac();

  const tinhThanhOptions = useMemo(
    () =>
      [...new Set(doiTac.filter((muc) => vung === 'TAT_CA' || muc.vung === vung).map((muc) => muc.tinhThanh))].sort(
        (a, b) => a.localeCompare(b, 'vi'),
      ),
    [doiTac, vung],
  );
  const danhSach = useMemo(() => {
    const key = chuanHoa(tuKhoa);
    return doiTac
      .filter(
        (muc) =>
          (!key || chuanHoa(`${muc.ten} ${muc.ma} ${muc.tinhThanh}`).includes(key)) &&
          (vung === 'TAT_CA' || muc.vung === vung) &&
          (tinhThanh === 'TAT_CA' || muc.tinhThanh === tinhThanh) &&
          (hinhThuc === 'TAT_CA' ||
            (hinhThuc === 'CHUA_XAC_MINH'
              ? muc.hinhThuc.length === 0
              : muc.hinhThuc.includes(hinhThuc))) &&
          (trangThai === 'TAT_CA' || muc.trangThaiHopTac === trangThai),
      )
      .sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
  }, [doiTac, hinhThuc, tinhThanh, trangThai, tuKhoa, vung]);

  const xoaBoLoc = () => {
    datTuKhoa('');
    datVung('TAT_CA');
    datTinhThanh('TAT_CA');
    datHinhThuc('TAT_CA');
    datTrangThai('TAT_CA');
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DauMuc
        tieuDe="Mạng lưới trường tiềm năng"
        phu={`${doiTac.length} đầu mối tham khảo trên toàn quốc. Thông tin đào tạo không chứng minh trường đang tìm đối tác hoặc đã ký với Phoenix.`}
      />
      <BoChuyenDanhMuc dangChon="doi-tac" />
      <BangTin loai="canh">
        Danh bạ này tách riêng khỏi chương trình vận hành. Không có ngành, học phí hay hoa hồng đã xác nhận;
        không dùng các đầu mối này để lập hồ sơ, thu tiền hoặc hứa khoản Sale nhận.
      </BangTin>

      <div className="grid min-w-0 gap-3 border-b border-phoenix-line pb-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="relative block min-w-0 sm:col-span-2 xl:col-span-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-phoenix-muted"
          />
          <Input
            type="search"
            value={tuKhoa}
            onChange={(event) => datTuKhoa(event.target.value)}
            placeholder="Tìm trường hoặc tỉnh"
            aria-label="Tìm trường hoặc tỉnh"
            className="pl-9 text-[13px]"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-semibold text-phoenix-muted">Khu vực</span>
          <OChon value={vung} onChange={(event) => {
            datVung(event.target.value as VungDoiTac | 'TAT_CA');
            datTinhThanh('TAT_CA');
          }}>
            <option value="TAT_CA">Toàn quốc</option>
            {Object.entries(TEN_VUNG_DOI_TAC).map(([ma, ten]) => (
              <option key={ma} value={ma}>{ten}</option>
            ))}
          </OChon>
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-semibold text-phoenix-muted">Tỉnh / thành</span>
          <OChon value={tinhThanh} onChange={(event) => datTinhThanh(event.target.value)}>
            <option value="TAT_CA">Tất cả</option>
            {tinhThanhOptions.map((tinh) => <option key={tinh}>{tinh}</option>)}
          </OChon>
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-semibold text-phoenix-muted">Hình thức</span>
          <OChon value={hinhThuc} onChange={(event) => datHinhThuc(event.target.value)}>
            <option value="TAT_CA">Tất cả</option>
            <option value="CHUA_XAC_MINH">Chưa xác minh hình thức</option>
            {CAC_HINH_THUC_DOI_TAC.map((hinhThucOption) => (
              <option key={hinhThucOption.ma} value={hinhThucOption.ma}>{hinhThucOption.ten}</option>
            ))}
          </OChon>
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-semibold text-phoenix-muted">Trạng thái hợp tác</span>
          <OChon
            value={trangThai}
            onChange={(event) => datTrangThai(event.target.value as TrangThaiDoiTacThamKhao | 'TAT_CA')}
          >
            <option value="TAT_CA">Tất cả</option>
            {Object.entries(TRANG_THAI_DOI_TAC).map(([ma, ten]) => (
              <option key={ma} value={ma}>{ten}</option>
            ))}
          </OChon>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-[12px] text-phoenix-muted">
          {dangTai ? 'Đang tải danh bạ…' : `${danhSach.length} / ${doiTac.length} đầu mối`}
        </p>
        {danhSach.length !== doiTac.length ? (
          <Button type="button" variant="ghost" size="sm" onClick={xoaBoLoc} data-testid="clear-directory-filters">
            <X data-icon="inline-start" />
            Xóa bộ lọc
          </Button>
        ) : null}
      </div>

      {loi ? (
        <BangTin loai="loi">Danh bạ chưa tải được từ máy chủ. Kiểm tra kết nối rồi thử lại.</BangTin>
      ) : null}
      {!dangTai && !loi && danhSach.length === 0 ? (
        <Rong>Không có đầu mối phù hợp với các bộ lọc này.</Rong>
      ) : null}
      <ul aria-label="Danh sách trường tiềm năng" className="grid min-w-0 grid-cols-1 gap-x-5 sm:grid-cols-2 xl:grid-cols-3">
        {danhSach.map((muc) => (
          <li key={muc.id ?? muc.ma} className="min-w-0">
            <TruongDoiTac doiTac={muc} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FormDoiTac {
  ma: string;
  ten: string;
  tenNgan: string;
  tinhThanh: string;
  vung: VungDoiTac;
  website: string;
  hinhThuc: string[];
  trangThaiHopTac: TrangThaiDoiTacThamKhao;
  hienThiCongKhai: boolean;
  nguonUrl: string;
  nguonTieuDe: string;
  ngayRaSoat: string;
  ghiChu: string;
}

const taoFormRong = (): FormDoiTac => ({
  ma: '',
  ten: '',
  tenNgan: '',
  tinhThanh: '',
  vung: 'MIEN_BAC',
  website: '',
  hinhThuc: [],
  trangThaiHopTac: 'TIEM_NANG',
  hienThiCongKhai: true,
  nguonUrl: '',
  nguonTieuDe: '',
  ngayRaSoat: new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10),
  ghiChu: '',
});

function taoMa(ten: string) {
  return ten
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/giu, 'd')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
}

function formTuDoiTac(doiTac: DoiTacThamKhao): FormDoiTac {
  return {
    ma: doiTac.ma,
    ten: doiTac.ten,
    tenNgan: doiTac.tenNgan ?? '',
    tinhThanh: doiTac.tinhThanh,
    vung: doiTac.vung,
    website: doiTac.website ?? '',
    hinhThuc: [...doiTac.hinhThuc],
    trangThaiHopTac: doiTac.trangThaiHopTac,
    hienThiCongKhai: doiTac.hienThiCongKhai !== false,
    nguonUrl: doiTac.nguonUrl,
    nguonTieuDe: doiTac.nguonTieuDe,
    ngayRaSoat: doiTac.ngayRaSoat,
    ghiChu: doiTac.ghiChu ?? '',
  };
}

function isArchived(doiTac: DoiTacThamKhao) {
  return doiTac.hoatDong === false || Boolean(doiTac.archivedAt);
}

export function QuanLyDanhBaDoiTac() {
  const toi = useToi();
  const user = useAuthStore((state) => state.user);
  const laQuanTriHeThong = laApi ? user?.role === 'ADMIN' : toi.vaiTro === 'ADMIN';
  const { doiTac, dangTai, loi } = useDanhBaDoiTac(laQuanTriHeThong);
  const { luu, luuTru, khoiPhuc } = useHanhDongDanhBaDoiTac();
  const [hienForm, datHienForm] = useState(false);
  const [hienLuuTru, datHienLuuTru] = useState(false);
  const [doiTacDangSua, datDoiTacDangSua] = useState<DoiTacThamKhao | null>(null);
  const [form, datForm] = useState<FormDoiTac>(taoFormRong);
  const danhSach = doiTac
    .filter((muc) => (hienLuuTru ? isArchived(muc) : !isArchived(muc)))
    .sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));

  if (!laQuanTriHeThong) return null;

  const moFormMoi = () => {
    datDoiTacDangSua(null);
    datForm(taoFormRong());
    datHienForm(true);
  };
  const moFormSua = (doiTacSua: DoiTacThamKhao) => {
    datDoiTacDangSua(doiTacSua);
    datForm(formTuDoiTac(doiTacSua));
    datHienForm(true);
  };
  const dongForm = () => {
    datDoiTacDangSua(null);
    datForm(taoFormRong());
    datHienForm(false);
  };
  const hoiLuuTru = (doiTacCanLuuTru: DoiTacThamKhao) => {
    if (window.confirm(`Lưu trữ ${doiTacCanLuuTru.ten}? Lịch sử đầu mối sẽ được giữ lại.`)) {
      void luuTru(doiTacCanLuuTru);
    }
  };
  const doiHinhThuc = (hinhThuc: string) => {
    datForm((hienTai) => ({
      ...hienTai,
      hinhThuc: hienTai.hinhThuc.includes(hinhThuc)
        ? hienTai.hinhThuc.filter((muc) => muc !== hinhThuc)
        : [...hienTai.hinhThuc, hinhThuc],
    }));
  };
  const guiForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hopLe = await luu({
      ...(doiTacDangSua ? { id: doiTacDangSua.id ?? doiTacDangSua.ma } : {}),
      ma: form.ma || taoMa(form.ten),
      ten: form.ten,
      tenNgan: form.tenNgan || null,
      tinhThanh: form.tinhThanh,
      vung: form.vung,
      website: form.website || null,
      hinhThuc: form.hinhThuc,
      trangThaiHopTac: form.trangThaiHopTac,
      hienThiCongKhai: form.hienThiCongKhai,
      nguonUrl: form.nguonUrl,
      nguonTieuDe: form.nguonTieuDe,
      ngayRaSoat: form.ngayRaSoat,
      ghiChu: form.ghiChu,
      hoatDong: doiTacDangSua?.hoatDong ?? true,
      archivedAt: doiTacDangSua?.archivedAt ?? null,
    });
    if (hopLe) dongForm();
  };

  return (
    <section
      id="quan-ly-danh-ba-doi-tac"
      aria-labelledby="quan-ly-danh-ba-doi-tac-tieu-de"
      className="flex min-w-0 scroll-mt-6 flex-col gap-4 border-t border-phoenix-line pt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="quan-ly-danh-ba-doi-tac-tieu-de" className="text-[19px] font-semibold text-phoenix-navy">
            Quản lý danh bạ trường
          </h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-phoenix-muted">
            Thêm, sửa và lưu trữ đầu mối. Không xóa cứng; trạng thái hợp tác và hình thức đào tạo phải có nguồn rà soát.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant={hienLuuTru ? 'secondary' : 'outline'} onClick={() => datHienLuuTru((value) => !value)}>
            {hienLuuTru ? 'Đang xem đã lưu trữ' : 'Xem đã lưu trữ'}
          </Button>
          <Button type="button" onClick={moFormMoi}>
            <Plus data-icon="inline-start" />
            Thêm trường
          </Button>
        </div>
      </div>

      {hienForm ? (
        <form onSubmit={guiForm} className="flex min-w-0 flex-col gap-4 border-y border-phoenix-line py-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold text-phoenix-ink">
              {doiTacDangSua ? `Sửa ${doiTacDangSua.ten}` : 'Thêm đầu mối trường'}
            </h3>
            <Button type="button" variant="ghost" size="icon" aria-label="Đóng biểu mẫu" onClick={dongForm}>
              <X />
            </Button>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Nhan ten="Mã đầu mối" batBuoc>
              <ONhap
                required
                value={form.ma || (form.ten ? taoMa(form.ten) : '')}
                readOnly={Boolean(doiTacDangSua)}
                onChange={(event) => datForm((old) => ({ ...old, ma: event.target.value.toUpperCase() }))}
              />
            </Nhan>
            <Nhan ten="Tên trường" batBuoc>
              <Input
                required
                value={form.ten}
                onChange={(event) =>
                  datForm((old) => ({
                    ...old,
                    ten: event.target.value,
                    ma: doiTacDangSua ? old.ma : taoMa(event.target.value),
                  }))
                }
              />
            </Nhan>
            <Nhan ten="Tên ngắn">
              <ONhap value={form.tenNgan} onChange={(event) => datForm((old) => ({ ...old, tenNgan: event.target.value }))} />
            </Nhan>
            <Nhan ten="Tỉnh / thành" batBuoc>
              <ONhap required value={form.tinhThanh} onChange={(event) => datForm((old) => ({ ...old, tinhThanh: event.target.value }))} />
            </Nhan>
            <Nhan ten="Khu vực" batBuoc>
              <OChon value={form.vung} onChange={(event) => datForm((old) => ({ ...old, vung: event.target.value as VungDoiTac }))}>
                {Object.entries(TEN_VUNG_DOI_TAC).map(([ma, ten]) => <option key={ma} value={ma}>{ten}</option>)}
              </OChon>
            </Nhan>
            <Nhan ten="Website chính thức">
              <ONhap type="url" value={form.website} onChange={(event) => datForm((old) => ({ ...old, website: event.target.value }))} />
            </Nhan>
            <Nhan ten="Trạng thái hợp tác" batBuoc>
              <OChon value={form.trangThaiHopTac} onChange={(event) => datForm((old) => ({ ...old, trangThaiHopTac: event.target.value as TrangThaiDoiTacThamKhao }))}>
                {Object.entries(TRANG_THAI_DOI_TAC).map(([ma, ten]) => <option key={ma} value={ma}>{ten}</option>)}
              </OChon>
            </Nhan>
            <Nhan ten="Ngày rà soát nguồn" batBuoc>
              <ONhap type="date" required value={form.ngayRaSoat} onChange={(event) => datForm((old) => ({ ...old, ngayRaSoat: event.target.value }))} />
            </Nhan>
            <label className="flex min-h-10 items-center gap-2 text-[12px] text-phoenix-ink">
              <input
                type="checkbox"
                checked={form.hienThiCongKhai}
                onChange={(event) =>
                  datForm((old) => ({ ...old, hienThiCongKhai: event.target.checked }))
                }
              />
              Hiển thị trên danh bạ công khai
            </label>
            <Nhan ten="Tên nguồn" batBuoc>
              <ONhap required value={form.nguonTieuDe} onChange={(event) => datForm((old) => ({ ...old, nguonTieuDe: event.target.value }))} />
            </Nhan>
            <Nhan ten="URL nguồn" batBuoc>
              <ONhap required type="url" value={form.nguonUrl} onChange={(event) => datForm((old) => ({ ...old, nguonUrl: event.target.value }))} />
            </Nhan>
            <div className="sm:col-span-2 xl:col-span-3">
              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs font-semibold text-phoenix-ink">Hình thức được nguồn xác nhận</legend>
                <p className="text-[11px] text-phoenix-muted">Để trống nếu nguồn chưa xác nhận hình thức cụ thể.</p>
                <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                  {CAC_HINH_THUC_DOI_TAC.map((muc) => (
                    <label key={muc.ma} className="flex min-h-9 items-center gap-2 text-[12px] text-phoenix-ink">
                      <input type="checkbox" checked={form.hinhThuc.includes(muc.ma)} onChange={() => doiHinhThuc(muc.ma)} />
                      {muc.ten}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="sm:col-span-2 xl:col-span-3">
              <Nhan ten="Ghi chú xác minh">
                <OVan value={form.ghiChu} onChange={(event) => datForm((old) => ({ ...old, ghiChu: event.target.value }))} />
              </Nhan>
            </div>
          </div>
          {form.trangThaiHopTac === 'DA_XAC_NHAN' ? (
            <BangTin loai="canh">Chỉ chọn “Đã xác nhận hợp tác” khi có bằng chứng thỏa thuận với Phoenix; nguồn tuyển sinh công khai không đủ căn cứ.</BangTin>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit">{doiTacDangSua ? 'Lưu thay đổi' : 'Thêm đầu mối'}</Button>
            <Button type="button" variant="outline" onClick={dongForm}>Hủy</Button>
          </div>
        </form>
      ) : null}

      {dangTai ? <p className="py-2 text-sm text-phoenix-muted">Đang tải danh bạ…</p> : null}
      {loi ? <BangTin loai="loi">Không tải được danh bạ quản trị. Thử lại sau.</BangTin> : null}
      {!dangTai && !loi && !danhSach.length ? <Rong>{hienLuuTru ? 'Chưa có đầu mối đã lưu trữ.' : 'Danh bạ hiện chưa có đầu mối đang hoạt động.'}</Rong> : null}
      <ul aria-label={hienLuuTru ? 'Trường đã lưu trữ' : 'Trường đang hoạt động'} className="divide-y divide-phoenix-line">
        {danhSach.map((muc) => (
          <li key={muc.id ?? muc.ma} className="flex min-w-0 flex-wrap items-center gap-3 py-3">
            <LogoDoiTac doiTac={muc} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-phoenix-ink">{muc.ten}</p>
              <p className="text-[11px] text-phoenix-muted">{muc.tinhThanh} · {TEN_VUNG_DOI_TAC[muc.vung]} · {TRANG_THAI_DOI_TAC[muc.trangThaiHopTac]}</p>
              {isArchived(muc) ? <p className="text-[11px] text-phoenix-danger-fg">Đã lưu trữ</p> : null}
              {!isArchived(muc) ? (
                <p className="text-[11px] text-phoenix-muted">
                  {muc.hienThiCongKhai === false ? 'Đã ẩn khỏi danh bạ công khai' : 'Đang hiển thị công khai'}
                </p>
              ) : null}
            </div>
            <div className="flex flex-none items-center gap-1">
              {isArchived(muc) ? (
                <Button type="button" variant="outline" size="sm" onClick={() => void khoiPhuc(muc)}>
                  <RotateCcw data-icon="inline-start" />
                  Khôi phục
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => moFormSua(muc)}>Sửa</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={`Lưu trữ ${muc.ten}`}
                    aria-label={`Lưu trữ ${muc.ten}`}
                    onClick={() => hoiLuuTru(muc)}
                  >
                    <Archive />
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
