/**
 * MÀN HÌNH LẬP HỒ SƠ — bước 2 trong vòng đời hồ sơ.
 *
 * Tệp đính kèm ở bản demo chỉ ghi TÊN TỆP, không tải nội dung lên đâu cả: trình
 * duyệt giữ tệp trong máy người dùng. Khi backend lên, chỗ này gọi
 * `POST /ho-so/:ma/tep` và lưu khoá tham chiếu MinIO.
 */
import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { tien } from '../dinh-dang';
import { hoSoCanNop, tenHe } from '../du-lieu/danh-muc';
import { useChuongTrinh, useDanhMuc, useHanhDong } from '../dung-kho';
import {
  BangTin,
  DauMuc,
  Ghi,
  Luoi,
  Mini,
  Nhan,
  OChon,
  ONhap,
  OVan,
  Rong,
  The,
} from '../thanh-phan/ui';

const TRUONG_NHAP = [
  ['hoTen', 'Họ và tên thí sinh', 'text', true],
  ['ngaySinh', 'Ngày sinh', 'date', true],
  ['soCccd', 'Số căn cước công dân', 'text', true],
  ['dienThoai', 'Điện thoại', 'tel', true],
  ['email', 'Email', 'email', false],
  ['diaChi', 'Địa chỉ thường trú', 'text', false],
  ['trinhDo', 'Trình độ và ngành đã hoàn thành', 'text', false],
  ['noiCongTac', 'Nơi công tác hiện tại', 'text', false],
] as const;

type Khoa = (typeof TRUONG_NHAP)[number][0];

export function LapHoSo() {
  const [thamSo, datThamSo] = useSearchParams();
  const dieuHuong = useNavigate();
  const { lapHoSo } = useHanhDong();
  const { chuongTrinh } = useDanhMuc();

  const [nhap, datNhap] = useState<Record<string, string>>({});
  const [ghiChu, datGhiChu] = useState('');
  const [tep, datTep] = useState<Record<number, File>>({});

  const ctMa = thamSo.get('ct') ?? '';
  const ct = useChuongTrinh(ctMa);
  const dsTep = useMemo(() => (ct ? hoSoCanNop(ct) : []), [ct]);
  const truongNhap =
    ct?.he === 'NH' ? TRUONG_NHAP.filter(([khoa]) => khoa !== 'trinhDo') : TRUONG_NHAP;
  const truongBatBuoc = truongNhap.map(
    ([khoa, ten, kieu, batBuoc]) =>
      [khoa, ten, kieu, khoa === 'trinhDo' && ct ? true : batBuoc] as const,
  );

  const thieu = truongBatBuoc
    .filter(([k, , , bb]) => bb && !(nhap[k] ?? '').trim())
    .map(([, ten]) => ten);

  async function luu() {
    if (!ct || thieu.length) return;
    // Giữ nguyên thứ tự giữa mô tả mục và tệp thật — nguồn api tải lên theo chỉ số
    const daChon = Object.entries(tep).map(([i, f]) => ({ muc: dsTep[Number(i)] ?? '', tep: f }));
    const ma = await lapHoSo(
      {
        chuongTrinhMa: ct.ma,
        hoTen: nhap.hoTen ?? '',
        ngaySinh: nhap.ngaySinh ?? '',
        soCccd: nhap.soCccd ?? '',
        dienThoai: nhap.dienThoai ?? '',
        email: nhap.email ?? '',
        diaChi: nhap.diaChi ?? '',
        trinhDo: nhap.trinhDo ?? '',
        noiCongTac: nhap.noiCongTac ?? '',
        ghiChu,
        tep: daChon.map((x) => ({ muc: x.muc, ten: x.tep.name })),
      },
      daChon.map((x) => x.tep),
    );
    if (ma) dieuHuong(`/tuyensinh/thu-hoc-phi/${ma}`);
  }

  return (
    <>
      <DauMuc
        tieuDe="Lập hồ sơ thí sinh"
        phu="Thông tin cần có: họ tên, ngày sinh, căn cước công dân và điện thoại."
      />

      <The>
        <Nhan ten="Chương trình đăng ký" batBuoc>
          <OChon
            value={ctMa}
            onChange={(e) => datThamSo(e.target.value ? { ct: e.target.value } : {})}
          >
            <option value="">— Chọn chương trình —</option>
            {chuongTrinh.map((c) => (
              <option key={c.ma} value={c.ma}>
                {c.tenNganh} — {tenHe(c.he)} — {c.truongTen}
              </option>
            ))}
          </OChon>
        </Nhan>
      </The>

      {!ct ? (
        <The>
          <Rong>Chọn chương trình ở trên để bắt đầu nhập hồ sơ.</Rong>
        </The>
      ) : (
        <>
          <The className="flex flex-col gap-3">
            <h2 className="text-[14.5px] font-semibold text-phoenix-ink">Chương trình đã chọn</h2>
            <Luoi cot={3}>
              <Mini nhan="Trường" gia={ct.truongTen} />
              <Mini
                nhan="Lộ trình"
                gia={`${ct.tuTrinhDo === 'THPT' ? 'THPT' : tenHe(ct.tuTrinhDo)} → ${tenHe(ct.he)}`}
              />
              <Mini nhan="Thời gian" gia={`${ct.thoiLuongThang} tháng · ${ct.soKy} kỳ`} />
              <Mini nhan="Mức phí đang lưu" gia={`${tien(ct.hocPhiKy)} / kỳ`} />
            </Luoi>
            <BangTin loai="canh">
              Mức phí trong danh mục chưa phải biểu phí riêng từng kỳ. Đối chiếu thông báo của
              trường trước khi xác nhận số tiền thu.
            </BangTin>
          </The>

          <The className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[14.5px] font-semibold text-phoenix-ink">Thông tin thí sinh</h2>
              <span className="text-[11px] text-phoenix-muted">
                {thieu.length ? `Còn thiếu ${thieu.length} mục bắt buộc` : 'Đã đủ mục bắt buộc'}
              </span>
            </div>
            <Luoi cot={2}>
              {truongBatBuoc.map(([khoa, ten, kieu, batBuoc]) => (
                <Nhan key={khoa} ten={ten} batBuoc={batBuoc}>
                  <ONhap
                    type={kieu}
                    value={nhap[khoa] ?? ''}
                    required={batBuoc}
                    onChange={(e) => datNhap((cu) => ({ ...cu, [khoa as Khoa]: e.target.value }))}
                  />
                </Nhan>
              ))}
            </Luoi>
            {ct.he === 'NH' ? (
              <Ghi>Khóa ngắn hạn không yêu cầu khai bằng cấp trước đó ở bước lập hồ sơ này.</Ghi>
            ) : null}
            <Nhan ten="Ghi chú tư vấn">
              <OVan value={ghiChu} onChange={(e) => datGhiChu(e.target.value)} />
            </Nhan>
          </The>

          <The className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[14.5px] font-semibold text-phoenix-ink">Hồ sơ cần thu</h2>
              <span className="text-[11px] text-phoenix-muted">
                Đã nhận {Object.keys(tep).length}/{dsTep.length}
              </span>
            </div>
            <Ghi>
              Chụp ảnh hoặc quét bản chính. Bản sao có chứng thực nộp khi nhập học. Bản demo chỉ ghi
              tên tệp, không tải nội dung lên máy chủ.
            </Ghi>
            {dsTep.map((ten, i) => {
              const daCo = tep[i];
              return (
                <div
                  key={ten}
                  className={
                    daCo
                      ? 'flex items-center justify-between gap-2.5 rounded-md border border-phoenix-success-fg bg-phoenix-success-bg px-3 py-2 text-[13px]'
                      : 'flex items-center justify-between gap-2.5 rounded-md border border-phoenix-line px-3 py-2 text-[13px]'
                  }
                >
                  <span className="min-w-0 truncate">
                    {daCo ? '✓ ' : ''}
                    {ten}
                    {daCo ? ` — ${daCo.name}` : ''}
                  </span>
                  <label className="flex-none cursor-pointer rounded-md border border-phoenix-line bg-card px-2.5 py-1 text-[12.5px] font-semibold">
                    {daCo ? 'Đổi tệp' : 'Chọn tệp'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      aria-label={`${daCo ? 'Đổi' : 'Chọn'} tệp: ${ten}`}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) datTep((cu) => ({ ...cu, [i]: f }));
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </The>

          {thieu.length ? <BangTin loai="canh">Còn thiếu: {thieu.join(', ')}</BangTin> : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void luu()} disabled={thieu.length > 0}>
              Lưu hồ sơ, sang thu học phí
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                datNhap({});
                datGhiChu('');
                datTep({});
              }}
            >
              Xoá nhập liệu
            </Button>
          </div>
        </>
      )}
    </>
  );
}
