/**
 * MÀN HÌNH THU HỌC PHÍ — mã QR cộng SỐ TÀI KHOẢN DẠNG CHỮ để người nộp đối
 * chiếu. Mã QR chỉ là tiện ích nhập nhanh, không phải nguồn sự thật.
 *
 * Bấm xác nhận là mốc GHI NHẬN DOANH SỐ cho cán bộ, trưởng nhóm và trưởng
 * phòng. Tiền về Trường thì muộn hơn vài tháng — hai việc khác nhau.
 */
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import qrcode from 'qrcode-generator';
import { Button } from '@/components/ui/button';
import { tien, thangVn } from '../dinh-dang';
import { timChuongTrinh } from '../du-lieu/danh-muc';
import { doanhSoQuyDoiMotKy, quyChiMotKy } from '../engine/quy-chi';
import { boDau, chuoiVietQR } from '../engine/vietqr';
import { useDuLieu } from '../dung-kho';
import { useKho } from '../kho/kho.store';
import { lichDoiSoat, thangCuaNgay } from '../tinh-toan';
import {
  BangTin,
  Co,
  DauMuc,
  Dong,
  Ghi,
  Luoi,
  Nhan,
  OChon,
  ONhap,
  OSo,
  Rong,
  The,
} from '../thanh-phan/ui';

export function ThuHocPhi() {
  const { ma = '' } = useParams();
  const dieuHuong = useNavigate();
  const { hoSo, taiKhoan } = useDuLieu();
  const ghiNhanThu = useKho((s) => s.ghiNhanThu);

  const hs = hoSo.find((h) => h.ma === ma);
  const ct = hs ? timChuongTrinh(hs.chuongTrinhMa) : undefined;

  const [tkChon, datTkChon] = useState(taiKhoan[0]?.id ?? '');
  const [soChungTu, datSoChungTu] = useState('');
  const [bienLai, datBienLai] = useState<string | null>(null);
  const [daSaoChep, datDaSaoChep] = useState('');

  const tk = taiKhoan.find((t) => t.id === tkChon) ?? taiKhoan[0];
  const kyTiep = (hs?.kyDaThu ?? 0) + 1;
  const xong = !!ct && kyTiep > ct.soKy;
  const noiDung = hs ? `${hs.ma} ${hs.hoTen} KY${kyTiep}` : '';

  const svgQr = useMemo(() => {
    if (!tk || !ct || xong) return '';
    const chuoi = chuoiVietQR({
      bin: tk.bin,
      soTaiKhoan: tk.soTaiKhoan,
      soTien: ct.hocPhiKy,
      noiDung,
    });
    if (!chuoi) return '';
    try {
      const q = qrcode(0, 'M');
      q.addData(chuoi);
      q.make();
      return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch {
      return '';
    }
  }, [tk, ct, xong, noiDung]);

  if (!hs || !ct) {
    return (
      <>
        <DauMuc tieuDe="Thu học phí" />
        <The>
          <Rong>
            Chọn một hồ sơ ở{' '}
            <Link to="/tuyensinh/ho-so" className="font-semibold text-phoenix-purple">
              màn Hồ sơ
            </Link>{' '}
            để thu học phí.
          </Rong>
        </The>
      </>
    );
  }

  async function saoChep(chu: string, nhan: string) {
    try {
      await navigator.clipboard.writeText(chu);
      datDaSaoChep(nhan);
      setTimeout(() => datDaSaoChep(''), 1800);
    } catch {
      datDaSaoChep('');
    }
  }

  function xacNhan() {
    const lt = ghiNhanThu({
      hoSoMa: hs!.ma,
      soChungTu,
      bienLaiTen: bienLai,
      taiKhoanId: tk?.id ?? '',
    });
    if (lt) {
      datSoChungTu('');
      datBienLai(null);
      dieuHuong('/tuyensinh/doanh-so');
    }
  }

  const lich = lichDoiSoat(ct, thangCuaNgay(new Date().toISOString().slice(0, 10)));
  const mocKy = lich.find((l) => l.ky === kyTiep);

  return (
    <>
      <button
        type="button"
        onClick={() => dieuHuong('/tuyensinh/ho-so')}
        className="self-start text-[13px] font-semibold text-phoenix-purple"
      >
        ← Danh sách hồ sơ
      </button>

      <DauMuc
        tieuDe="Thu học phí"
        phu={`${hs.hoTen} · ${ct.tenNganh} · ${ct.truongTen}`}
      >
        <Co loai="he">{hs.ma}</Co>
      </DauMuc>

      <Luoi cot={4}>
        <OSo
          nhan="Kỳ sắp thu"
          so={xong ? 'Đã đủ' : `Kỳ ${kyTiep}/${ct.soKy}`}
          phu={`đã thu ${hs.kyDaThu} kỳ`}
          mau="chinh"
        />
        <OSo
          nhan="Số tiền kỳ này"
          so={xong ? '—' : tien(ct.hocPhiKy)}
          phu="theo bảng học phí"
          mau="tien"
        />
        <OSo nhan="Đã thu" so={tien(hs.kyDaThu * ct.hocPhiKy)} phu="cộng dồn" />
        <OSo
          nhan="Còn lại"
          so={tien(Math.max(0, (ct.soKy - hs.kyDaThu) * ct.hocPhiKy))}
          phu="tới hết khoá"
        />
      </Luoi>

      {xong ? (
        <BangTin loai="ok">Thí sinh đã đóng đủ học phí toàn khoá.</BangTin>
      ) : (
        <>
          {!taiKhoan.length ? (
            <BangTin loai="canh">
              Chưa khai tài khoản nhận tiền. Vào <b>Quản trị</b> để thêm tài khoản của Trường và
              của từng trường đối tác.
            </BangTin>
          ) : (
            <>
              <The>
                <Nhan ten="Tài khoản nhận tiền">
                  <OChon value={tkChon} onChange={(e) => datTkChon(e.target.value)}>
                    {taiKhoan.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tenChu} — {t.tenNganHang}
                      </option>
                    ))}
                  </OChon>
                </Nhan>
              </The>

              <The className="flex flex-col items-center gap-3">
                {svgQr ? (
                  <div
                    className="rounded-lg border border-phoenix-line bg-white p-3 [&>svg]:block [&>svg]:h-[210px] [&>svg]:w-[210px]"
                    // Chuỗi SVG do thư viện qrcode-generator sinh từ dữ liệu của
                    // chính trang này, không phải từ nội dung người dùng nhập tự do.
                    dangerouslySetInnerHTML={{ __html: svgQr }}
                  />
                ) : (
                  <BangTin loai="canh">
                    Thiếu số tài khoản hoặc mã ngân hàng. Bổ sung ở màn Quản trị.
                  </BangTin>
                )}

                <div className="flex w-full flex-col">
                  <Dong mt="Chủ tài khoản" gt={tk?.tenChu ?? '—'} />
                  <Dong mt="Ngân hàng" gt={tk?.tenNganHang ?? '—'} />
                  <Dong
                    mt="Số tài khoản"
                    gt={
                      <span className="font-mono tracking-wide">
                        {tk?.soTaiKhoan || '(chưa khai)'}
                      </span>
                    }
                  />
                  <Dong
                    mt="Nội dung chuyển khoản"
                    gt={<span className="font-mono tracking-wide">{boDau(noiDung)}</span>}
                  />
                  <Dong tong mt="Số tiền" gt={tien(ct.hocPhiKy)} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saoChep(tk?.soTaiKhoan ?? '', 'stk')}
                  >
                    {daSaoChep === 'stk' ? 'Đã sao chép' : 'Sao chép số tài khoản'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saoChep(boDau(noiDung), 'nd')}
                  >
                    {daSaoChep === 'nd' ? 'Đã sao chép' : 'Sao chép nội dung'}
                  </Button>
                </div>

                <Ghi>
                  Đối chiếu số tài khoản hiển thị với thông tin chính thức của Trường trước khi
                  chuyển. Mã QR chỉ là tiện ích nhập nhanh.
                </Ghi>
              </The>

              <The className="flex flex-col gap-3">
                <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
                  Xác nhận đã nhận tiền
                </h3>
                <Ghi>
                  Chỉ bấm xác nhận khi tiền đã vào tài khoản và có chứng từ. Doanh số ghi nhận
                  ngay tại thời điểm này cho bạn, trưởng nhóm và trưởng phòng.
                </Ghi>
                <Nhan ten="Số chứng từ (biên lai, uỷ nhiệm chi)" batBuoc>
                  <ONhap value={soChungTu} onChange={(e) => datSoChungTu(e.target.value)} />
                </Nhan>
                <div
                  className={
                    bienLai
                      ? 'flex items-center justify-between gap-2.5 rounded-md border border-phoenix-success-fg bg-phoenix-success-bg px-3 py-2 text-[13px]'
                      : 'flex items-center justify-between gap-2.5 rounded-md border border-phoenix-line px-3 py-2 text-[13px]'
                  }
                >
                  <span className="min-w-0 truncate">
                    {bienLai ? `✓ Ảnh chứng từ — ${bienLai}` : 'Ảnh chứng từ chuyển khoản'}
                  </span>
                  <label className="flex-none cursor-pointer rounded-md border border-phoenix-line bg-card px-2.5 py-1 text-[12.5px] font-semibold">
                    {bienLai ? 'Đổi tệp' : 'Chọn tệp'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) datBienLai(f.name);
                      }}
                    />
                  </label>
                </div>
                <Button onClick={xacNhan} disabled={!soChungTu.trim()}>
                  Xác nhận đã thu kỳ {kyTiep} và ghi nhận doanh số
                </Button>
              </The>

              <BangTin loai="tin">
                Kỳ này ghi nhận <b>{tien(doanhSoQuyDoiMotKy(ct))}</b> doanh số quy đổi. Quỹ chi{' '}
                <b>{tien(quyChiMotKy(ct))}</b> chỉ được lập khi{' '}
                {ct.treThang === 0
                  ? 'kế toán Trường ghi nhận — đây là sản phẩm của Trường nên tiền về ngay'
                  : `đối tác đối soát và chuyển tiền về, dự kiến ${thangVn(mocKy?.thangVe ?? '')} (T+${mocKy?.treThang ?? ct.treThang})`}
                .
              </BangTin>
            </>
          )}
        </>
      )}
    </>
  );
}
