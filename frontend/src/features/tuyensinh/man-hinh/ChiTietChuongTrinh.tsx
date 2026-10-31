import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { tien } from '../dinh-dang';
import {
  dieuKienCua,
  hoaHongCanXacNhan,
  hoSoCanNop,
  laChuongTrinhTuVanDoiTac,
  laChuongTrinhVanHanh,
  nhanTrangThaiDotTuyenSinh,
  trangThaiDotTuyenSinh,
  tenHe,
  timDanhMucSale,
  trinhDoDauVaoHienThi,
  type ChuongTrinh,
  type ChuongTrinhTuVanDoiTac,
  type SanPhamTuVan,
} from '../du-lieu/danh-muc';
import { useDanhMuc, useSoatTran } from '../dung-kho';
import { BangTin, Co, DauMuc, Ghi, The } from '../thanh-phan/ui';

export function ChiTietChuongTrinh() {
  const { ma = '' } = useParams();
  const { chuongTrinh, dangTai } = useDanhMuc();
  const muc = timDanhMucSale(ma, chuongTrinh);
  const chuongTrinhVanHanh = muc && laChuongTrinhVanHanh(muc) ? muc : undefined;
  const soat = useSoatTran(
    chuongTrinhVanHanh?.daDoiChieu === true && !hoaHongCanXacNhan(chuongTrinhVanHanh)
      ? chuongTrinhVanHanh
      : undefined,
    3,
  );

  if (!muc && dangTai)
    return <p className="py-8 text-sm text-phoenix-muted">Đang tải chương trình…</p>;

  if (!muc) {
    return (
      <The>
        <p className="text-sm">
          Không có chương trình <b>{ma}</b>.{' '}
          <Link to="/tuyensinh" className="font-semibold text-phoenix-purple">
            Về danh mục chương trình
          </Link>
        </p>
      </The>
    );
  }

  if (laChuongTrinhTuVanDoiTac(muc)) {
    return <ChiTietTuVanDoiTac chuongTrinh={muc} />;
  }

  if (!laChuongTrinhVanHanh(muc)) return <ChiTietSanPhamTuVan sanPham={muc} />;

  return <ChiTietChuongTrinhVanHanh chuongTrinh={muc} soat={soat} />;
}

function ChiTietSanPhamTuVan({ sanPham }: { sanPham: SanPhamTuVan }) {
  const laSoCap = sanPham.nhom === 'SO_CAP';
  const trangThaiNguon =
    sanPham.trangThaiThongTin === 'THAM_KHAO_2025'
      ? 'Chỉ có thông báo năm 2025'
      : 'Có thông tin công khai năm 2026 · cần xác nhận';

  return (
    <>
      <Link
        to="/tuyensinh"
        className="inline-flex min-h-9 items-center gap-2 self-start text-[13px] font-semibold text-phoenix-purple hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Danh mục chương trình
      </Link>

      <DauMuc tieuDe={sanPham.tenNganh} phu={sanPham.truongTen}>
        <Co loai="he">{laSoCap ? 'Sơ cấp' : 'Chứng chỉ / ngắn hạn'}</Co>
        <Co loai={sanPham.trangThaiThongTin === 'CAN_XAC_NHAN' ? 'cho' : 'xam'}>
          {trangThaiNguon}
        </Co>
      </DauMuc>

      <BangTin loai="canh">
        Đây là thông tin tham khảo, không xác nhận khóa đang nhận học viên. Mức hoa hồng tối đa đến
        70% chưa có cơ sở tính được duyệt, vì vậy trang này không tính số tiền Sale nhận.
      </BangTin>

      <The className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <ThongTinTuVan
            nhan="Học phí tham khảo"
            gia={`${tien(sanPham.hocPhiThamKhaoDong)} / ${laSoCap ? 'khóa' : 'module'}`}
          />
          <ThongTinTuVan nhan="Hoa hồng" gia={sanPham.hoaHongHienThi} />
          <ThongTinTuVan nhan="Thời lượng tham khảo" gia={sanPham.thoiLuongThamKhao} />
          <ThongTinTuVan nhan="Lịch khai giảng tham khảo" gia={sanPham.lichKhaiGiangThamKhao} />
          <ThongTinTuVan nhan="Văn bằng tham khảo" gia={sanPham.vanBangThamKhao} />
        </div>
        <p className="text-[12px] leading-relaxed text-phoenix-muted">{sanPham.ghiChuHocPhi}</p>
        <p className="text-[12px] leading-relaxed text-phoenix-muted">{sanPham.ghiChuHoaHong}</p>
        {sanPham.nguon.map((nguon) => (
          <a
            key={nguon.url}
            href={nguon.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 w-fit items-center gap-2 text-[12px] font-semibold text-phoenix-purple hover:underline"
          >
            Nguồn: {nguon.ten}
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        ))}
      </The>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Điều kiện đầu vào" />
          <ul className="flex flex-col gap-2">
            {sanPham.dieuKien.map((dieuKien) => (
              <li
                key={dieuKien}
                className="border-l-2 border-phoenix-line py-0.5 pl-3 text-[13px] leading-relaxed text-phoenix-ink"
              >
                {dieuKien}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Sale cần hỏi" />
          <ol className="flex flex-col gap-2">
            {sanPham.saleCanThu.map((thongTin, i) => (
              <li
                key={thongTin}
                className="flex gap-3 border-b border-phoenix-line pb-2 text-[13px] leading-relaxed text-phoenix-ink last:border-b-0"
              >
                <span className="w-5 flex-none font-semibold text-phoenix-purple">{i + 1}.</span>
                <span>{thongTin}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Giấy tờ tham khảo" />
          <ul className="flex flex-col gap-2">
            {sanPham.hoSo.map((giayTo) => (
              <li
                key={giayTo}
                className="border-l-2 border-phoenix-line py-0.5 pl-3 text-[13px] leading-relaxed text-phoenix-ink"
              >
                {giayTo}
              </li>
            ))}
          </ul>
          <Ghi>Đối chiếu danh mục giấy tờ và yêu cầu bản gốc với Phoenix trước khi nhận hồ sơ.</Ghi>
        </section>
      </div>

      <Link
        to="/tuyensinh"
        className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-phoenix-line px-4 py-2 text-[13px] font-semibold text-phoenix-ink hover:bg-phoenix-panel"
      >
        Chọn chương trình khác
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </>
  );
}

function ThongTinTuVan({ nhan, gia }: { nhan: string; gia: string }) {
  return (
    <div className="min-w-0 border-l-2 border-phoenix-line pl-3">
      <p className="text-[11px] font-semibold text-phoenix-muted">{nhan}</p>
      <p className="mt-1 text-[13px] font-semibold leading-snug text-phoenix-ink">{gia}</p>
    </div>
  );
}

function ChiTietTuVanDoiTac({ chuongTrinh: ct }: { chuongTrinh: ChuongTrinhTuVanDoiTac }) {
  const trangThai = trangThaiDotTuyenSinh(ct);
  const laTuyen = trangThai === 'DANG_NHAN';
  const badgeTuyen =
    trangThai === 'DANG_NHAN'
      ? 'ok'
      : trangThai === 'SAP_MO'
        ? 'cho'
        : trangThai === 'DA_DONG'
          ? 'loi'
          : 'xam';
  const loaiBangHai =
    ct.loaiTuyenSinh === 'VAN_BANG_2_CHINH_THUC'
      ? 'Văn bằng 2 được trường gọi tên chính thức'
      : ct.loaiTuyenSinh === 'NHAN_NGUOI_CO_BANG_DAI_HOC'
        ? 'Nhận hồ sơ người đã có bằng đại học'
        : 'Chưa xác minh tuyến người đã có bằng đại học';

  return (
    <>
      <Link
        to="/tuyensinh"
        className="inline-flex min-h-9 items-center gap-2 self-start text-[13px] font-semibold text-phoenix-purple hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Danh mục chương trình
      </Link>

      <DauMuc tieuDe={ct.tenNganh} phu={`${ct.truongTen} · ${ct.hinhThuc}`}>
        <Co loai="he">{tenHe(ct.he)}</Co>
        <Co loai="xam">{loaiBangHai}</Co>
        <Co loai={badgeTuyen}>{nhanTrangThaiDotTuyenSinh(ct)}</Co>
      </DauMuc>

      <BangTin loai="canh">
        Thông báo tuyển sinh của trường không xác nhận hợp đồng liên kết với Phoenix. Chưa có hoa
        hồng hoặc tiền Sale được xác minh, nên không thu tiền, lập hồ sơ vận hành hay hứa khoản
        nhận.
      </BangTin>

      <The className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <ThongTinTuVan nhan="Đợt tuyển sinh" gia={ct.dotTuyenSinh.ten} />
          <ThongTinTuVan
            nhan="Hạn nhận hồ sơ"
            gia={
              ct.dotTuyenSinh.hanHoSo ? dinhDangNgay(ct.dotTuyenSinh.hanHoSo) : 'Chưa có thông tin'
            }
          />
          <ThongTinTuVan nhan="Hình thức đào tạo" gia={ct.hinhThuc} />
          <ThongTinTuVan
            nhan="Học phí tham khảo"
            gia={
              ct.hocPhi
                ? `${tien(ct.hocPhi.dong)} / ${ct.hocPhi.donVi === 'TIN_CHI' ? 'tín chỉ' : 'năm'}`
                : 'Chưa thấy mức phí trong thông báo'
            }
          />
          <ThongTinTuVan
            nhan="Thời lượng tham khảo"
            gia={ct.thoiLuongThamKhao ?? 'Theo lộ trình do trường xét'}
          />
          <ThongTinTuVan nhan="Tuyến dành cho người có bằng" gia={loaiBangHai} />
        </div>
        {ct.dotTuyenSinh.ngayKhaiGiang ? (
          <p className="text-[12px] leading-relaxed text-phoenix-muted">
            Khai giảng dự kiến: {dinhDangNgay(ct.dotTuyenSinh.ngayKhaiGiang)}.
          </p>
        ) : null}
        {ct.hocPhi?.ghiChu ? (
          <p className="text-[12px] leading-relaxed text-phoenix-muted">{ct.hocPhi.ghiChu}</p>
        ) : null}
        {ct.dotTuyenSinh.ghiChu ? (
          <p className="text-[12px] leading-relaxed text-phoenix-muted">{ct.dotTuyenSinh.ghiChu}</p>
        ) : null}
      </The>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Điều kiện dự tuyển" />
          <ul className="flex flex-col gap-2">
            {ct.dieuKien.map((dieuKien) => (
              <li
                key={dieuKien}
                className="border-l-2 border-phoenix-line py-0.5 pl-3 text-[13px] leading-relaxed text-phoenix-ink"
              >
                {dieuKien}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Sale cần hỏi" />
          <ol className="flex flex-col gap-2">
            {ct.saleCanHoi.map((thongTin, i) => (
              <li
                key={thongTin}
                className="flex gap-3 border-b border-phoenix-line pb-2 text-[13px] leading-relaxed text-phoenix-ink last:border-b-0"
              >
                <span className="w-5 flex-none font-semibold text-phoenix-purple">{i + 1}.</span>
                <span>{thongTin}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Giấy tờ rà soát ban đầu" />
          <ul className="flex flex-col gap-2">
            {ct.hoSoThamKhao.map((giayTo) => (
              <li
                key={giayTo}
                className="border-l-2 border-phoenix-line py-0.5 pl-3 text-[13px] leading-relaxed text-phoenix-ink"
              >
                {giayTo}
              </li>
            ))}
          </ul>
          <Ghi>Đối chiếu danh mục hồ sơ gốc với trường trước khi nhận hoặc chuyển hồ sơ.</Ghi>
        </section>
      </div>

      <section className="flex flex-col gap-1">
        {ct.nguon.map((nguon) => (
          <a
            key={nguon.url}
            href={nguon.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 w-fit items-center gap-2 text-[12px] font-semibold text-phoenix-purple hover:underline"
          >
            Nguồn: {nguon.ten}
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        ))}
      </section>

      <Link
        to="/tuyensinh"
        className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-phoenix-line px-4 py-2 text-[13px] font-semibold text-phoenix-ink hover:bg-phoenix-panel"
      >
        Chọn chương trình khác
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
      {!laTuyen ? (
        <p role="status" className="text-[12px] font-medium text-phoenix-danger-fg">
          {trangThai === 'SAP_MO' && ct.dotTuyenSinh.ngayMoHoSo
            ? `Đợt này chưa mở; dự kiến nhận hồ sơ từ ${dinhDangNgay(ct.dotTuyenSinh.ngayMoHoSo)}.`
            : trangThai === 'DA_DONG'
              ? 'Đợt này đã hết hạn. Chờ trường công bố đợt mới trước khi tư vấn khách nộp.'
              : 'Chưa có đợt nhận hồ sơ mới được xác minh.'}
        </p>
      ) : null}
    </>
  );
}

function dinhDangNgay(ngay: string): string {
  const [nam, thang, ngayTrongThang] = ngay.split('-');
  return `${ngayTrongThang}/${thang}/${nam}`;
}

function ChiTietChuongTrinhVanHanh({
  chuongTrinh: ct,
  soat,
}: {
  chuongTrinh: ChuongTrinh;
  soat: ReturnType<typeof useSoatTran>;
}) {
  const tenDauVao = trinhDoDauVaoHienThi(ct);
  const loTrinh = `${tenDauVao} → ${tenHe(ct.he)}`;
  const nvMotKy = soat?.chi.find((x) => x.ma === 'NV')?.soTien;
  const canXacNhanHoaHong = hoaHongCanXacNhan(ct);
  const soLieuDaDoiChieu = ct.daDoiChieu === true;

  return (
    <>
      <Link
        to="/tuyensinh"
        className="inline-flex min-h-9 items-center gap-2 self-start text-[13px] font-semibold text-phoenix-purple hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Danh mục chương trình
      </Link>

      <DauMuc tieuDe={ct.tenNganh} phu={`${ct.truongTen} · mã ${ct.ma}`}>
        <Co loai="he">{tenHe(ct.he)}</Co>
        {ct.nganhSucKhoe ? <Co loai="cho">Ngành sức khỏe</Co> : null}
        {!soLieuDaDoiChieu ? <Co loai="cho">Số liệu chưa đối chiếu</Co> : null}
      </DauMuc>

      {!soLieuDaDoiChieu ? (
        <BangTin loai="canh">
          Đây là số liệu mẫu chưa được đối chiếu; không dùng để cam kết học phí hoặc khoản Sale
          nhận. Xác nhận chương trình với trường trước khi tư vấn.
        </BangTin>
      ) : canXacNhanHoaHong ? (
        <The className="flex flex-col gap-1">
          <h2 className="text-[14px] font-semibold text-phoenix-ink">
            Hoa hồng theo định hướng: tối đa đến 70%
          </h2>
          <p className="text-[12px] leading-relaxed text-phoenix-muted">
            Chưa chốt cơ sở tính, đối tượng nhận và thời điểm đối soát. Số theo cấu hình cũ không
            được dùng làm cam kết cho sản phẩm này.
          </p>
        </The>
      ) : (
        <The className="grid gap-x-5 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <h2 className="text-[15px] font-semibold text-phoenix-ink">
              Khoản Sale dự kiến sau đối soát
            </h2>
            <p className="mt-0.5 text-[12px] text-phoenix-muted">
              Tạm tính theo dữ liệu hiện có · quyết toán theo từng kỳ đã đối soát
            </p>
          </div>
          <p className="text-[24px] font-extrabold tabular-nums leading-tight text-phoenix-purple sm:text-right">
            {nvMotKy === undefined ? 'Chưa có dữ liệu' : tien(nvMotKy)}
            {nvMotKy !== undefined ? (
              <span className="ml-1 text-[12px] font-semibold text-phoenix-muted">tạm tính</span>
            ) : null}
          </p>
          <Ghi>
            Đây là mức dự kiến, chưa xác nhận chuyển khoản; số cuối còn phụ thuộc đối soát, chính
            sách và phần việc được ghi nhận.
          </Ghi>
        </The>
      )}

      <The className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
          <section>
            <h2 className="text-[13px] font-semibold text-phoenix-muted">Lộ trình chương trình</h2>
            <p className="mt-1 text-[18px] font-bold leading-snug text-phoenix-ink">
              {ct.tuTrinhDo === 'THPT' ? `Tuyển từ ${tenDauVao}` : `Liên thông: ${loTrinh}`}
            </p>
            <p className="mt-1 text-[13px] text-phoenix-muted">
              {ct.thoiLuongThang} tháng · {ct.soKy} kỳ
            </p>
          </section>

          <section className="border-t border-phoenix-line pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <h2 className="text-[13px] font-semibold text-phoenix-muted">Học phí theo kỳ</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-phoenix-ink">
              Theo thông báo học phí của trường cho từng kỳ
            </p>
          </section>
        </div>

        <ol
          aria-label={`${ct.soKy} kỳ đào tạo`}
          className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:grid-cols-6"
        >
          {Array.from({ length: ct.soKy }, (_, i) => (
            <li
              key={i + 1}
              className="border-phoenix-purple/30 flex min-h-[68px] flex-col justify-between gap-2 border-l-2 py-1 pl-3"
            >
              <span className="block text-[12px] font-semibold text-phoenix-ink">Kỳ {i + 1}</span>
              <span className="block text-[11px] leading-snug text-phoenix-muted">
                Chưa có thông báo học phí
              </span>
            </li>
          ))}
        </ol>

        <BangTin loai="canh">
          Học phí mỗi kỳ có thể khác nhau. Chưa có biểu phí theo thông báo của trường nên chưa thể
          xác nhận số thu cho từng kỳ.
        </BangTin>
      </The>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Điều kiện dự tuyển" />
          <ul className="flex flex-col gap-2">
            {dieuKienCua(ct).map((dieuKien) => (
              <li
                key={dieuKien}
                className="border-l-2 border-phoenix-line py-0.5 pl-3 text-[13px] leading-relaxed text-phoenix-ink"
              >
                {dieuKien}
              </li>
            ))}
            {ct.nganhSucKhoe ? (
              <li className="border-l-2 border-phoenix-warning-fg py-0.5 pl-3 text-[13px] leading-relaxed text-phoenix-ink">
                Ngành sức khỏe có thể yêu cầu tối thiểu 36 tháng công tác đúng chuyên môn.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe="Hồ sơ cần thu" />
          <ol className="flex flex-col gap-2">
            {hoSoCanNop(ct).map((giayTo, i) => (
              <li
                key={giayTo}
                className="flex gap-3 border-b border-phoenix-line pb-2 text-[13px] leading-relaxed text-phoenix-ink last:border-b-0"
              >
                <span className="w-5 flex-none font-semibold text-phoenix-purple">{i + 1}.</span>
                <span>{giayTo}</span>
              </li>
            ))}
          </ol>
          <Ghi>Bản chụp dùng để lập hồ sơ; bản sao chứng thực nộp theo hướng dẫn nhập học.</Ghi>
        </section>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/tuyensinh/lap-ho-so?ct=${ct.ma}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-phoenix-purple px-4 py-2 text-[13px] font-semibold text-white hover:bg-phoenix-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Lập hồ sơ ngành này
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <Link
          to="/tuyensinh"
          className="inline-flex min-h-10 items-center rounded-md border border-phoenix-line px-4 py-2 text-[13px] font-semibold text-phoenix-ink hover:bg-phoenix-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Chọn ngành khác
        </Link>
      </div>
    </>
  );
}
