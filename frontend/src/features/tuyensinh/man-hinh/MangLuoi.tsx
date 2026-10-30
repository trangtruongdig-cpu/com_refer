/**
 * MÀN HÌNH MẠNG LƯỚI — danh mục trường đối tác và chương trình được phép tư vấn.
 *
 * Mỗi thẻ hiện cả HAI con số: học phí (thứ thí sinh đóng) và quỹ chi (thứ Trường
 * thật sự nhận). Để cạnh nhau là có chủ ý: học phí đại học 44 triệu cả khoá
 * nghe rất lớn, nhưng Trường chỉ thực nhận 11,2 triệu.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { heSoChu, pvChu, tien, tienGon } from '../dinh-dang';
import { HE, tenHe, type ChuongTrinh, type MaHe } from '../du-lieu/danh-muc';
import { doanhSoQuyDoiMotKy, heSoQuyDoi, hocPhiToanKhoa, pv, quyChiMotKy } from '../engine/quy-chi';
import { useDanhMuc } from '../dung-kho';
import { Co, DauMuc, Ghi, Luoi, Mini, OSo, Rong, The, TheBam } from '../thanh-phan/ui';

type Loc = 'TAT_CA' | MaHe;

export function MangLuoi() {
  const [loc, datLoc] = useState<Loc>('TAT_CA');
  const dieuHuong = useNavigate();
  const { chuongTrinh, dangTai } = useDanhMuc();

  const soTruong = useMemo(() => new Set(chuongTrinh.map((c) => c.truongMa)).size, [chuongTrinh]);
  const soHe = useMemo(() => new Set(chuongTrinh.map((c) => c.he)).size, [chuongTrinh]);

  const hien = loc === 'TAT_CA' ? chuongTrinh : chuongTrinh.filter((c) => c.he === loc);
  const nhom = useMemo(() => {
    const m = new Map<string, ChuongTrinh[]>();
    for (const c of hien) {
      if (!m.has(c.truongMa)) m.set(c.truongMa, []);
      m.get(c.truongMa)!.push(c);
    }
    return [...m.entries()].sort(
      (a, b) =>
        (HE.find((h) => h.ma === b[1][0]!.he)?.thuTu ?? 0) -
        (HE.find((h) => h.ma === a[1][0]!.he)?.thuTu ?? 0),
    );
  }, [hien]);

  const cacLoc: { ma: Loc; ten: string }[] = [
    { ma: 'TAT_CA', ten: 'Tất cả' },
    ...HE.filter((h) => chuongTrinh.some((c) => c.he === h.ma)).map((h) => ({
      ma: h.ma as Loc,
      ten: h.ten,
    })),
  ];

  return (
    <>
      <DauMuc
        tieuDe="Mạng lưới liên kết đào tạo"
        phu="Các trường Phoenix đang liên kết và toàn bộ chương trình bạn được phép tư vấn. Bấm vào một chương trình để xem điều kiện dự tuyển, kinh tế một kỳ thu và quyền lợi của cán bộ."
      />

      <Luoi cot={3}>
        <OSo nhan="Trường đối tác" so={String(soTruong)} phu="đang có hiệu lực" mau="chinh" />
        <OSo
          nhan="Chương trình đào tạo"
          so={String(chuongTrinh.length)}
          phu="trên toàn mạng lưới"
        />
        <OSo nhan="Hệ đào tạo" so={String(soHe)} phu="ngắn hạn, trung cấp, cao đẳng, đại học" />
      </Luoi>

      <div className="flex flex-wrap gap-1.5">
        {cacLoc.map((l) => {
          const so =
            l.ma === 'TAT_CA'
              ? chuongTrinh.length
              : chuongTrinh.filter((c) => c.he === l.ma).length;
          const dang = loc === l.ma;
          return (
            <button
              key={l.ma}
              type="button"
              aria-pressed={dang}
              onClick={() => datLoc(l.ma)}
              className={
                dang
                  ? 'rounded-full border border-phoenix-purple bg-phoenix-purple px-3.5 py-1.5 text-[13px] font-semibold text-white'
                  : 'rounded-full border border-phoenix-line bg-card px-3.5 py-1.5 text-[13px] text-phoenix-slate hover:border-phoenix-purple'
              }
            >
              {l.ten} ({so})
            </button>
          );
        })}
      </div>

      {dangTai && !chuongTrinh.length ? (
        <The>
          <Rong>Đang tải danh mục…</Rong>
        </The>
      ) : null}

      {nhom.map(([truongMa, ds]) => (
        <div key={truongMa} className="flex flex-col gap-3">
          <DauMuc cap={2} tieuDe={ds[0]!.truongTen}>
            <Co loai="he">{ds.length} chương trình</Co>
            {ds[0]!.truongPhoenix ? (
              <Co loai="ok">Trường tự đào tạo · trích 100%</Co>
            ) : (
              <Co loai="xam">Liên kết đào tạo</Co>
            )}
          </DauMuc>
          <Luoi cot={2}>
            {ds.map((ct) => (
              <TheChuongTrinh
                key={ct.ma}
                ct={ct}
                onClick={() => dieuHuong(`/tuyensinh/chuong-trinh/${ct.ma}`)}
              />
            ))}
          </Luoi>
        </div>
      ))}

      <Ghi>
        Tên trường đối tác còn ghi [điền tên thật] là dữ liệu mẫu. Chỉ Đại học Công nghiệp Việt Trì
        là trường thật; học phí và tỷ lệ trích của các ngành khác phải nhập lại theo hợp đồng liên
        kết trước khi tư vấn cho thí sinh.
      </Ghi>
    </>
  );
}

function TheChuongTrinh({ ct, onClick }: { ct: ChuongTrinh; onClick: () => void }) {
  const quyChi = quyChiMotKy(ct);
  return (
    <TheBam onClick={onClick}>
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          <Co loai="he">{tenHe(ct.he)}</Co>
          {ct.tuTrinhDo !== 'THPT' ? <Co loai="xam">Liên thông từ {tenHe(ct.tuTrinhDo)}</Co> : null}
          {ct.nganhSucKhoe ? <Co loai="cho">Ngành sức khoẻ</Co> : null}
          {ct.daDoiChieu ? <Co loai="vang">Số đã đối chiếu</Co> : null}
        </div>

        <h3 className="text-[15px] font-semibold text-phoenix-ink">{ct.tenNganh}</h3>

        <Luoi cot={4} className="gap-2">
          <Mini nhan="Thời gian" gia={`${ct.thoiLuongThang} tháng`} />
          <Mini nhan="Số kỳ" gia={String(ct.soKy)} />
          <Mini nhan="Học phí một kỳ" gia={tienGon(ct.hocPhiKy)} />
          <Mini nhan="Toàn khoá" gia={tienGon(hocPhiToanKhoa(ct))} />
        </Luoi>

        <div className="rounded-md bg-phoenix-panel px-2.5 py-2">
          <Luoi cot={4} className="gap-2">
            <Mini nhan="Quỹ chi một kỳ" gia={tien(quyChi)} />
            <Mini nhan="PV" gia={pvChu(pv(ct))} />
            <Mini nhan="Hệ số quy đổi" gia={heSoChu(heSoQuyDoi(ct))} />
            <Mini nhan="Doanh số quy đổi" gia={tienGon(doanhSoQuyDoiMotKy(ct))} />
          </Luoi>
        </div>
      </div>
    </TheBam>
  );
}
