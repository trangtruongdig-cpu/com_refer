import { ArrowRight, Check, ChevronDown, Landmark, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HE,
  ghepDanhMucSale,
  laChuongTrinhVanHanh,
  laChuongTrinhTuVanDoiTac,
  laSanPhamTuVanPhoenix,
  ngayHienTaiVietNam,
  nhanTrangThaiDotTuyenSinh,
  type DanhMucSale,
  type MaHe,
} from '../du-lieu/danh-muc';
import { useDanhMuc } from '../dung-kho';
import { BoChuyenDanhMuc } from '../thanh-phan/BoChuyenDanhMuc';
import { DauMuc, Rong } from '../thanh-phan/ui';

type BoLoc = 'TAT_CA' | 'CHUNG_CHI' | 'SO_CAP' | MaHe | 'LIEN_THONG' | 'VAN_BANG_2';

const CAC_BO_LOC: readonly { readonly ma: BoLoc; readonly ten: string }[] = [
  { ma: 'TAT_CA', ten: 'Tất cả' },
  { ma: 'CHUNG_CHI', ten: 'Chứng chỉ / ngắn hạn' },
  { ma: 'SO_CAP', ten: 'Sơ cấp' },
  { ma: 'TC', ten: 'Trung cấp' },
  { ma: 'CD', ten: 'Cao đẳng' },
  { ma: 'DH', ten: 'Đại học' },
  { ma: 'LIEN_THONG', ten: 'Liên thông' },
  { ma: 'VAN_BANG_2', ten: 'Văn bằng 2' },
];

const LOGO_TRUONG: Readonly<Record<string, { readonly src: string; readonly className: string }>> =
  {
    CTU: { src: '/brand/ctu.png', className: 'size-7 object-contain' },
    DHCNVT: {
      src: '/brand/dai-hoc-cong-nghiep-viet-tri.svg',
      className: 'size-7 object-cover object-left',
    },
    DNTU: { src: '/brand/dntu.svg', className: 'size-7 object-contain' },
    FTU: { src: '/brand/ftu.png', className: 'size-7 object-cover object-left' },
    HCCT: { src: '/brand/hcct-official.png', className: 'size-7 object-contain' },
    NEU: { src: '/brand/neu-emblem.webp', className: 'h-auto w-11 max-w-none object-contain' },
    PHOENIX: {
      src: '/brand/phoenix-logo-full.png',
      className: 'size-7 object-contain',
    },
    PTIT: { src: '/brand/ptit.svg', className: 'size-7 object-contain' },
    TDMU: { src: '/brand/tdmu.svg', className: 'size-7 object-contain' },
    TDTU: { src: '/brand/tdtu.png', className: 'size-7 object-contain' },
    THANHDO: { src: '/brand/thanh-do.png', className: 'size-7 object-contain' },
    VNU_UL: { src: '/brand/ul-vnu.svg', className: 'size-7 object-contain' },
  };

interface ThongTinTruong {
  readonly ma: string;
  readonly ten: string;
}

function thongTinTruong(muc: DanhMucSale): ThongTinTruong {
  return {
    ma: muc.truongMa,
    ten: muc.truongTen.replace(/\s*\[điền tên thật\]\s*/i, ''),
  };
}

function thuocBoLoc(muc: DanhMucSale, boLoc: BoLoc): boolean {
  if (boLoc === 'TAT_CA') return true;
  if (boLoc === 'VAN_BANG_2') {
    return laChuongTrinhTuVanDoiTac(muc) && muc.loaiTuyenSinh !== 'KHONG_XAC_NHAN';
  }
  if (boLoc === 'LIEN_THONG') {
    return laChuongTrinhVanHanh(muc) && muc.tuTrinhDo !== 'THPT' && muc.he !== 'TC';
  }
  if (boLoc === 'CHUNG_CHI') {
    return muc.he === 'NH' || (laSanPhamTuVanPhoenix(muc) && muc.nhom === 'CHUNG_CHI_NGAN_HAN');
  }
  if (boLoc === 'SO_CAP') {
    return laSanPhamTuVanPhoenix(muc) && muc.nhom === 'SO_CAP';
  }
  return muc.he === boLoc;
}

function tenNhom(muc: DanhMucSale): string {
  if (muc.he === 'NH') return 'Chứng chỉ / ngắn hạn';
  if (muc.he === 'SC') return 'Sơ cấp';
  return HE.find((he) => he.ma === muc.he)?.ten ?? muc.he;
}

function chuThichMuc(muc: DanhMucSale, homNay: string): string {
  if (laChuongTrinhVanHanh(muc)) {
    const loTrinh =
      muc.tuTrinhDo === 'THPT'
        ? `${tenNhom(muc)} · ${muc.soKy} kỳ`
        : `Liên thông ${HE.find((he) => he.ma === muc.tuTrinhDo)?.ten ?? muc.tuTrinhDo} → ${tenNhom(muc)}`;
    if (!muc.daDoiChieu) return `${loTrinh} · Số liệu chưa đối chiếu`;
    if (muc.ma === 'NH-CSSD-PTTM') return 'Khóa vận hành · chính sách Sale cần xác nhận';
    return loTrinh;
  }

  if (laChuongTrinhTuVanDoiTac(muc)) {
    const loaiBangHai =
      muc.loaiTuyenSinh === 'VAN_BANG_2_CHINH_THUC'
        ? 'Văn bằng 2'
        : muc.loaiTuyenSinh === 'NHAN_NGUOI_CO_BANG_DAI_HOC'
          ? 'Nhận người có bằng ĐH'
          : '';
    return `${nhanTrangThaiDotTuyenSinh(muc, homNay)}${loaiBangHai ? ` · ${loaiBangHai}` : ''}`;
  }

  return muc.trangThaiThongTin === 'THAM_KHAO_2025'
    ? 'Tham khảo danh mục 2025 · xác nhận khóa hiện tại'
    : `${tenNhom(muc)} · học phí/hoa hồng cần xác nhận`;
}

function chuanHoaTimKiem(giaTri: string): string {
  return giaTri
    .trim()
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function khopTimKiem(muc: DanhMucSale, tuKhoa: string): boolean {
  if (!tuKhoa) return true;
  return chuanHoaTimKiem(`${muc.tenNganh} ${muc.truongTen}`).includes(tuKhoa);
}

function TuyChonLoc({
  ten,
  soLuong,
  dangChon,
  biKhoa,
  onClick,
}: {
  ten: string;
  soLuong: number;
  dangChon: boolean;
  biKhoa?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={dangChon}
      disabled={biKhoa}
      onClick={onClick}
      className={`flex min-h-9 w-full min-w-0 items-center gap-2 border-l-2 px-2 text-left text-[12px] transition-colors ${
        dangChon
          ? 'border-phoenix-purple bg-phoenix-lavender-50 font-semibold text-phoenix-purple-700'
          : 'border-transparent text-phoenix-slate hover:bg-phoenix-panel hover:text-phoenix-ink'
      } ${biKhoa ? 'cursor-not-allowed text-phoenix-muted opacity-60 hover:bg-transparent' : ''}`}
    >
      <span className="min-w-0 flex-1 leading-4">{ten}</span>
      <span className="flex-none text-[11px] tabular-nums text-phoenix-muted">{soLuong}</span>
      {dangChon ? <Check aria-hidden="true" className="size-3.5 flex-none" /> : null}
    </button>
  );
}

function NhomBoLoc({
  id,
  ten,
  soLuongDaChon,
  dangMo,
  onToggle,
  children,
}: {
  id: string;
  ten: string;
  soLuongDaChon: number;
  dangMo: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-phoenix-line py-1">
      <button
        type="button"
        aria-label={ten}
        aria-expanded={dangMo}
        aria-controls={`bo-loc-${id}`}
        onClick={onToggle}
        className="flex min-h-10 w-full items-center gap-2 text-left text-[12.5px] font-semibold text-phoenix-ink"
      >
        <span className="min-w-0 flex-1">{ten}</span>
        {soLuongDaChon ? (
          <span className="text-[10.5px] font-medium text-phoenix-purple-700">
            {soLuongDaChon} đã chọn
          </span>
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 flex-none text-phoenix-muted transition-transform ${
            dangMo ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div id={`bo-loc-${id}`} hidden={!dangMo} className="pb-2">
        {children}
      </div>
    </section>
  );
}

export function MangLuoi() {
  const { chuongTrinh, dangTai } = useDanhMuc();
  const [boLoc, datBoLoc] = useState<BoLoc>('TAT_CA');
  const [tuKhoa, datTuKhoa] = useState('');
  const [truongDangLoc, datTruongDangLoc] = useState<ReadonlySet<string>>(() => new Set());
  const [nganhDangLoc, datNganhDangLoc] = useState<ReadonlySet<string>>(() => new Set());
  const [tuKhoaNganh, datTuKhoaNganh] = useState('');
  const [boLocMo, datBoLocMo] = useState(false);
  const [cacNhomLocMo, datCacNhomLocMo] = useState({
    loai: true,
    truong: false,
    nganh: false,
  });
  const danhMucSale = useMemo(() => ghepDanhMucSale(chuongTrinh), [chuongTrinh]);
  const homNay = ngayHienTaiVietNam();
  const tuKhoaChuan = chuanHoaTimKiem(tuKhoa);
  const tuKhoaNganhChuan = chuanHoaTimKiem(tuKhoaNganh);
  const danhSachTruong = useMemo(() => {
    const truongTheoMa = new Map<string, ThongTinTruong>();
    for (const muc of danhMucSale) {
      const truong = thongTinTruong(muc);
      truongTheoMa.set(truong.ma, truong);
    }
    return [...truongTheoMa.values()].sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
  }, [danhMucSale]);
  const danhSachNganh = useMemo(
    () =>
      [...new Set(danhMucSale.map((muc) => muc.tenNganh))].sort((a, b) => a.localeCompare(b, 'vi')),
    [danhMucSale],
  );
  const soLuongTheoLoc = useMemo(
    () =>
      new Map(
        CAC_BO_LOC.map((loc) => [
          loc.ma,
          danhMucSale.filter(
            (muc) =>
              thuocBoLoc(muc, loc.ma) &&
              khopTimKiem(muc, tuKhoaChuan) &&
              (!truongDangLoc.size || truongDangLoc.has(muc.truongMa)) &&
              (!nganhDangLoc.size || nganhDangLoc.has(muc.tenNganh)),
          ).length,
        ]),
      ),
    [danhMucSale, nganhDangLoc, truongDangLoc, tuKhoaChuan],
  );
  const soLuongTheoTruong = useMemo(() => {
    const soLuong = new Map<string, number>();
    for (const muc of danhMucSale) {
      if (
        thuocBoLoc(muc, boLoc) &&
        khopTimKiem(muc, tuKhoaChuan) &&
        (!nganhDangLoc.size || nganhDangLoc.has(muc.tenNganh))
      ) {
        soLuong.set(muc.truongMa, (soLuong.get(muc.truongMa) ?? 0) + 1);
      }
    }
    return soLuong;
  }, [boLoc, danhMucSale, nganhDangLoc, tuKhoaChuan]);
  const soLuongTheoNganh = useMemo(() => {
    const soLuong = new Map<string, number>();
    for (const muc of danhMucSale) {
      if (
        thuocBoLoc(muc, boLoc) &&
        khopTimKiem(muc, tuKhoaChuan) &&
        (!truongDangLoc.size || truongDangLoc.has(muc.truongMa))
      ) {
        soLuong.set(muc.tenNganh, (soLuong.get(muc.tenNganh) ?? 0) + 1);
      }
    }
    return soLuong;
  }, [boLoc, danhMucSale, truongDangLoc, tuKhoaChuan]);
  const truongHienThi = danhSachTruong.filter(
    (truong) => (soLuongTheoTruong.get(truong.ma) ?? 0) > 0 || truongDangLoc.has(truong.ma),
  );
  const nganhHienThi = danhSachNganh.filter(
    (nganh) =>
      ((soLuongTheoNganh.get(nganh) ?? 0) > 0 || nganhDangLoc.has(nganh)) &&
      (!tuKhoaNganhChuan || chuanHoaTimKiem(nganh).includes(tuKhoaNganhChuan)),
  );
  const cacChuongTrinh = useMemo(
    () =>
      danhMucSale
        .filter(
          (muc) =>
            thuocBoLoc(muc, boLoc) &&
            khopTimKiem(muc, tuKhoaChuan) &&
            (!truongDangLoc.size || truongDangLoc.has(muc.truongMa)) &&
            (!nganhDangLoc.size || nganhDangLoc.has(muc.tenNganh)),
        )
        .sort(
          (a, b) =>
            a.tenNganh.localeCompare(b.tenNganh, 'vi') ||
            thongTinTruong(a).ten.localeCompare(thongTinTruong(b).ten, 'vi'),
        ),
    [boLoc, danhMucSale, nganhDangLoc, truongDangLoc, tuKhoaChuan],
  );
  const soLuongHienThi = cacChuongTrinh.length;
  const soBoLocDangDung =
    Number(boLoc !== 'TAT_CA') + truongDangLoc.size + nganhDangLoc.size + Number(Boolean(tuKhoa));

  const doiLuaChon = (
    ma: string,
    datLuaChon: React.Dispatch<React.SetStateAction<ReadonlySet<string>>>,
  ) => {
    datLuaChon((hienTai) => {
      const tiepTheo = new Set(hienTai);
      if (tiepTheo.has(ma)) tiepTheo.delete(ma);
      else tiepTheo.add(ma);
      return tiepTheo;
    });
  };

  const xoaTatCaBoLoc = () => {
    datBoLoc('TAT_CA');
    datTruongDangLoc(new Set());
    datNganhDangLoc(new Set());
    datTuKhoa('');
    datTuKhoaNganh('');
  };

  return (
    <>
      <DauMuc
        tieuDe="Chương trình đào tạo"
        phu="Chọn nhóm sản phẩm trước. Mở một chương trình để xem điều kiện, thông tin cần hỏi và học phí."
      />
      <BoChuyenDanhMuc dangChon="chuong-trinh" />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-6">
        <aside
          aria-label="Bộ lọc chương trình"
          className="min-w-0 border-b border-phoenix-line pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5"
        >
          <div className="flex min-h-9 items-center justify-between gap-2">
            <h2 className="hidden text-sm font-semibold text-phoenix-ink lg:block">Bộ lọc</h2>
            <button
              type="button"
              aria-label="Mở bộ lọc"
              aria-expanded={boLocMo}
              aria-controls="danh-sach-bo-loc"
              onClick={() => datBoLocMo((mo) => !mo)}
              className="flex min-h-9 min-w-0 flex-1 items-center justify-between gap-2 text-left text-sm font-semibold text-phoenix-ink lg:hidden"
            >
              <span>Bộ lọc</span>
              <span className="ml-auto text-xs font-medium text-phoenix-muted">
                {soBoLocDangDung ? `${soBoLocDangDung} đang dùng` : 'Loại · trường · ngành'}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 flex-none text-phoenix-muted transition-transform ${
                  boLocMo ? 'rotate-180' : ''
                }`}
              />
            </button>
            {soBoLocDangDung ? (
              <div className="flex flex-none items-center gap-2">
                <button
                  type="button"
                  aria-label="Xóa tất cả bộ lọc"
                  onClick={xoaTatCaBoLoc}
                  className="inline-flex min-h-8 items-center gap-1 rounded px-1.5 text-xs font-medium text-phoenix-purple-700 hover:bg-phoenix-lavender-50"
                >
                  <X aria-hidden="true" className="size-3.5" />
                  Xóa lọc
                </button>
              </div>
            ) : null}
          </div>

          <div
            id="danh-sach-bo-loc"
            className={boLocMo ? 'mt-2 block lg:block' : 'mt-2 hidden lg:block'}
          >
            <NhomBoLoc
              id="loai"
              ten="Loại chương trình"
              soLuongDaChon={boLoc === 'TAT_CA' ? 0 : 1}
              dangMo={cacNhomLocMo.loai}
              onToggle={() => datCacNhomLocMo((hienTai) => ({ ...hienTai, loai: !hienTai.loai }))}
            >
              <div role="group" aria-label="Loại chương trình">
                {CAC_BO_LOC.map((loc) => {
                  const dangChon = boLoc === loc.ma;
                  const soLuong = soLuongTheoLoc.get(loc.ma) ?? 0;
                  return (
                    <TuyChonLoc
                      key={loc.ma}
                      ten={loc.ten}
                      soLuong={soLuong}
                      dangChon={dangChon}
                      biKhoa={soLuong === 0 && !dangChon}
                      onClick={() => datBoLoc(loc.ma)}
                    />
                  );
                })}
              </div>
            </NhomBoLoc>

            <NhomBoLoc
              id="truong"
              ten="Trường"
              soLuongDaChon={truongDangLoc.size}
              dangMo={cacNhomLocMo.truong}
              onToggle={() =>
                datCacNhomLocMo((hienTai) => ({ ...hienTai, truong: !hienTai.truong }))
              }
            >
              <div role="group" aria-label="Trường">
                {truongHienThi.length ? (
                  truongHienThi.map((truong) => {
                    const dangChon = truongDangLoc.has(truong.ma);
                    const soLuong = soLuongTheoTruong.get(truong.ma) ?? 0;
                    return (
                      <TuyChonLoc
                        key={truong.ma}
                        ten={truong.ten}
                        soLuong={soLuong}
                        dangChon={dangChon}
                        biKhoa={soLuong === 0 && !dangChon}
                        onClick={() => doiLuaChon(truong.ma, datTruongDangLoc)}
                      />
                    );
                  })
                ) : (
                  <p className="px-2 py-2 text-[11px] text-phoenix-muted">
                    Không còn trường phù hợp với các bộ lọc khác.
                  </p>
                )}
              </div>
            </NhomBoLoc>

            <NhomBoLoc
              id="nganh"
              ten="Ngành học"
              soLuongDaChon={nganhDangLoc.size}
              dangMo={cacNhomLocMo.nganh}
              onToggle={() => datCacNhomLocMo((hienTai) => ({ ...hienTai, nganh: !hienTai.nganh }))}
            >
              <label className="relative mb-2 block">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-phoenix-muted"
                />
                <input
                  type="search"
                  value={tuKhoaNganh}
                  onChange={(event) => datTuKhoaNganh(event.target.value)}
                  placeholder="Tìm trong ngành"
                  aria-label="Tìm ngành học"
                  className="min-h-8 w-full rounded border border-phoenix-line bg-card py-1 pl-8 pr-2 text-[11px] text-phoenix-ink outline-none placeholder:text-phoenix-muted focus:border-phoenix-purple focus:ring-2 focus:ring-ring"
                />
              </label>
              <div role="group" aria-label="Ngành học" className="max-h-64 overflow-y-auto">
                {nganhHienThi.length ? (
                  nganhHienThi.map((nganh) => {
                    const dangChon = nganhDangLoc.has(nganh);
                    const soLuong = soLuongTheoNganh.get(nganh) ?? 0;
                    return (
                      <TuyChonLoc
                        key={nganh}
                        ten={nganh}
                        soLuong={soLuong}
                        dangChon={dangChon}
                        biKhoa={soLuong === 0 && !dangChon}
                        onClick={() => doiLuaChon(nganh, datNganhDangLoc)}
                      />
                    );
                  })
                ) : (
                  <p className="px-2 py-2 text-[11px] text-phoenix-muted">
                    Không có ngành khớp với điều kiện hiện tại.
                  </p>
                )}
              </div>
            </NhomBoLoc>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-3">
          <label className="relative block max-w-xl">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-phoenix-muted"
            />
            <input
              type="search"
              value={tuKhoa}
              onChange={(event) => datTuKhoa(event.target.value)}
              placeholder="Tìm trường hoặc ngành"
              aria-label="Tìm trường hoặc ngành"
              className="min-h-10 w-full rounded-md border border-phoenix-line bg-card py-2 pl-9 pr-10 text-[13px] text-phoenix-ink outline-none placeholder:text-phoenix-muted focus:border-phoenix-purple focus:ring-2 focus:ring-ring"
            />
            {tuKhoa ? (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => datTuKhoa('')}
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-phoenix-muted hover:bg-phoenix-panel hover:text-phoenix-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </label>

          <p aria-live="polite" className="text-[12px] text-phoenix-muted">
            {boLoc === 'VAN_BANG_2'
              ? `${soLuongHienThi} chương trình có tuyến VB2 hoặc nhận hồ sơ người đã có bằng đại học. Việc miễn/chuyển tín chỉ do từng trường xét.`
              : `${soLuongHienThi} chương trình trong danh mục`}
          </p>

          {dangTai && !chuongTrinh.length ? <Rong>Đang tải chương trình…</Rong> : null}

          {!dangTai && !cacChuongTrinh.length ? (
            <Rong>
              {boLoc === 'VAN_BANG_2'
                ? 'Chưa có chương trình VB2 hoặc chương trình nhận người đã có bằng đại học trong các bộ lọc này.'
                : 'Không có chương trình phù hợp với các bộ lọc hiện tại.'}
            </Rong>
          ) : null}

          <ul
            aria-label="Danh sách chương trình"
            className="grid min-w-0 grid-cols-1 content-start gap-2 sm:grid-cols-2 xl:grid-cols-3"
          >
            {cacChuongTrinh.map((muc) => (
              <li key={muc.ma} className="min-w-0">
                <ChipChuongTrinh muc={muc} homNay={homNay} />
              </li>
            ))}
          </ul>

          <p className="border-t border-phoenix-line pt-3 text-xs leading-relaxed text-phoenix-muted">
            Nguồn Phoenix 2026 chưa thống nhất: trang tổng hợp nêu 19 khóa ngắn hạn và 26 mô-đun sơ
            cấp, trong khi danh mục khóa/từng bài có số lượng khác nhau. Mục “tham khảo 2025” không
            xác nhận khóa còn mở; cần Phoenix chốt danh sách, học phí và quyền lợi theo từng khóa.
          </p>
          <p className="border-t border-phoenix-line pt-3 text-xs leading-relaxed text-phoenix-muted">
            Trường đối tác hiển thị theo thông báo tuyển sinh đã công bố. Hạn tuyển có thể thay đổi;
            Sale cần xác nhận chỗ học còn nhận hồ sơ. Chưa có thỏa thuận hoa hồng Phoenix được xác
            minh cho các chương trình này.
          </p>
        </div>
      </div>
    </>
  );
}

function LogoTruong({ muc }: { muc: DanhMucSale }) {
  const truong = thongTinTruong(muc);
  const logo = LOGO_TRUONG[truong.ma];

  return (
    <div
      className="grid size-8 flex-none place-items-center overflow-hidden rounded border border-phoenix-line bg-white"
      title={truong.ten}
    >
      {logo ? (
        <img
          src={logo.src}
          alt={`Logo ${truong.ten}`}
          className={logo.className}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          role="img"
          aria-label={`Nhận diện tạm thời ${truong.ten}`}
          className="flex flex-col items-center gap-0.5 text-phoenix-purple-700"
        >
          <Landmark aria-hidden="true" className="size-3.5" />
        </div>
      )}
    </div>
  );
}

function ChipChuongTrinh({ muc, homNay }: { muc: DanhMucSale; homNay: string }) {
  return (
    <Link
      to={`/tuyensinh/chuong-trinh/${muc.ma}`}
      aria-label={`${muc.tenNganh} — ${chuThichMuc(muc, homNay)} — ${thongTinTruong(muc).ten}`}
      className="group flex min-h-[116px] w-full min-w-0 flex-col gap-2 rounded-md border border-phoenix-line bg-card px-3 py-2.5 transition-colors hover:border-phoenix-purple hover:bg-phoenix-lavender-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex min-w-0 items-center gap-2">
        <LogoTruong muc={muc} />
        <span className="truncate text-left text-[10.5px] font-medium leading-4 text-phoenix-muted">
          {thongTinTruong(muc).ten}
        </span>
      </span>
      <span className="line-clamp-2 min-h-8 min-w-0 text-left text-[12.5px] font-semibold leading-4 text-phoenix-ink">
        {muc.tenNganh}
      </span>
      <span className="mt-auto flex items-center justify-between gap-2">
        <span className="line-clamp-2 min-w-0 text-left text-[10.5px] leading-4 text-phoenix-muted">
          {chuThichMuc(muc, homNay)}
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 flex-none text-phoenix-muted transition-colors group-hover:text-phoenix-purple"
        />
      </span>
    </Link>
  );
}
