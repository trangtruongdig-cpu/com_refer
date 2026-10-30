/**
 * MÀN HÌNH LẬP HỒ SƠ — bước 2 trong vòng đời hồ sơ.
 *
 * Tệp đính kèm ở bản demo chỉ ghi TÊN TỆP, không tải nội dung lên đâu cả: trình
 * duyệt giữ tệp trong máy người dùng. Khi backend lên, chỗ này gọi
 * `POST /ho-so/:ma/tep` và lưu khoá tham chiếu MinIO.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { tien } from '../dinh-dang';
import { hoSoCanNop, tenHe } from '../du-lieu/danh-muc';
import { hocPhiToanKhoa, quyChiMotKy } from '../engine/quy-chi';
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
  ['trinhDo', 'Trình độ và ngành đã có', 'text', false],
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

  const thieu = TRUONG_NHAP.filter(([k, , , bb]) => bb && !(nhap[k] ?? '').trim()).map(
    ([, ten]) => ten,
  );

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
        phu="Nhập thông tin, đính kèm bản chụp giấy tờ, rồi chuyển sang thu học phí kỳ 1."
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
            <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Chương trình đã chọn</h3>
            <Luoi cot={4}>
              <Mini nhan="Trường" gia={ct.truongTen} />
              <Mini nhan="Thời gian" gia={`${ct.thoiLuongThang} tháng · ${ct.soKy} kỳ`} />
              <Mini nhan="Học phí một kỳ" gia={tien(ct.hocPhiKy)} />
              <Mini nhan="Toàn khoá" gia={tien(hocPhiToanKhoa(ct))} />
            </Luoi>
            <Ghi>
              Quỹ chi một kỳ của chương trình này là {tien(quyChiMotKy(ct))} — đây là số Trường thật
              sự nhận được sau khi đối tác trích lại và trừ định mức, không phải học phí.
            </Ghi>
          </The>

          <The className="flex flex-col gap-3">
            <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Thông tin thí sinh</h3>
            <Luoi cot={2}>
              {TRUONG_NHAP.map(([khoa, ten, kieu, batBuoc]) => (
                <Nhan key={khoa} ten={ten} batBuoc={batBuoc}>
                  <ONhap
                    type={kieu}
                    value={nhap[khoa] ?? ''}
                    onChange={(e) => datNhap((cu) => ({ ...cu, [khoa as Khoa]: e.target.value }))}
                  />
                </Nhan>
              ))}
            </Luoi>
            <Nhan ten="Ghi chú tư vấn">
              <OVan value={ghiChu} onChange={(e) => datGhiChu(e.target.value)} />
            </Nhan>
          </The>

          <The className="flex flex-col gap-2">
            <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Đính kèm hồ sơ</h3>
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
              Lưu hồ sơ và chuyển sang thu học phí
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
