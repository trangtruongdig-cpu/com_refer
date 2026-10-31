import { useMemo, useState } from 'react';
import { ngayVn, tien, thangVn } from '../dinh-dang';
import { useDuLieu, useSoCongNo, useToi, useTongHopThang } from '../dung-kho';
import { daiThang, quyenLoiMotKy, thangNay } from '../tinh-toan';
import { Bang, BangTin, Co, Cuon, DauMuc, Ghi, Nhan, OChon, Td, Th, The } from '../thanh-phan/ui';

export function DoanhSo() {
  const toi = useToi();
  const { tatCa, hoSo } = useDuLieu();
  const [thang, datThang] = useState(thangNay());

  const cacThang = useMemo(
    () => daiThang(tatCa, hoSo, thangNay()).slice().reverse(),
    [tatCa, hoSo],
  );
  const tongHop = useTongHopThang(toi.id, thang);
  const so = useSoCongNo(toi.id, thang);
  const dongThang = so.find((dong) => dong.thang === thang);

  return (
    <>
      <DauMuc tieuDe="Kết quả bán hàng" phu={`${toi.hoTen} · ${toi.nhom}`} />

      <Nhan ten="Tháng xem">
        <OChon
          aria-label="Tháng xem"
          value={thang}
          onChange={(e) => datThang(e.target.value)}
          className="max-w-[240px]"
        >
          {cacThang.map((t) => (
            <option key={t} value={t}>
              {thangVn(t)}
            </option>
          ))}
        </OChon>
      </Nhan>

      <The className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)] sm:items-center">
          <div>
            <p className="text-[13px] font-semibold text-phoenix-muted">
              Thực nhận theo bảng tính tháng
            </p>
            <p className="mt-1 text-[30px] font-extrabold tabular-nums leading-tight text-phoenix-purple">
              {tien(dongThang?.thucNhan ?? 0)}
            </p>
            <p className="mt-1 text-[12px] text-phoenix-muted">{thangVn(thang)}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-phoenix-line pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div>
              <dt className="text-[11px] leading-snug text-phoenix-muted">
                Quyền lợi đã tính sau đối soát
              </dt>
              <dd className="mt-0.5 text-[14px] font-bold tabular-nums text-phoenix-ink">
                {tien(tongHop.quyenLoi)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] leading-snug text-phoenix-muted">
                Quỹ chi đang chờ đối soát
              </dt>
              <dd className="mt-0.5 text-[14px] font-bold tabular-nums text-phoenix-ink">
                {tien(tongHop.choDoiSoat)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] leading-snug text-phoenix-muted">Hồ sơ mới</dt>
              <dd className="mt-0.5 text-[14px] font-bold tabular-nums text-phoenix-ink">
                {tongHop.soHoSoMoi}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] leading-snug text-phoenix-muted">Nợ ứng cuối kỳ</dt>
              <dd className="mt-0.5 text-[14px] font-bold tabular-nums text-phoenix-ink">
                {tien(dongThang?.noCuoiKy ?? 0)}
              </dd>
            </div>
          </dl>
        </div>

        <BangTin loai="tin">
          Quyền lợi chỉ được tính khi trường đã nhận tiền đối soát. “Thực nhận” là kết quả sau khi
          tính ứng trước/thu hồi; phần mềm hiện chưa có trạng thái xác nhận đã chuyển khoản cho
          Sale.
        </BangTin>
      </The>

      <The className="flex flex-col gap-3">
        <DauMuc cap={2} tieuDe="Hồ sơ và các kỳ thu" />
        {tongHop.kyThuTrongThang.length ? (
          <Cuon>
            <Bang hep>
              <thead>
                <tr>
                  <Th>Học viên</Th>
                  <Th>Chương trình</Th>
                  <Th so>Kỳ</Th>
                  <Th>Đối soát</Th>
                  <Th so>Quyền lợi NV</Th>
                </tr>
              </thead>
              <tbody>
                {tongHop.kyThuTrongThang.map((dong) => {
                  const ketQua = quyenLoiMotKy(dong, hoSo);

                  return (
                    <tr key={dong.lanThu.ma}>
                      <Td>
                        {dong.hoSo.hoTen}
                        <small className="block text-[11px] text-phoenix-muted">
                          {ngayVn(dong.lanThu.ngayThu)}
                        </small>
                      </Td>
                      <Td>{dong.ct.tenNganh}</Td>
                      <Td so>{dong.lanThu.kyThu}</Td>
                      <Td>
                        {dong.thangNhanTien ? (
                          <Co loai="ok">Đã đối soát · {thangVn(dong.thangNhanTien)}</Co>
                        ) : (
                          <Co loai="cho">Chờ đối soát</Co>
                        )}
                      </Td>
                      <Td so className="font-semibold">
                        {ketQua ? tien(ketQua.soTien) : '—'}
                        {!dong.thangNhanTien && ketQua ? (
                          <small className="block font-normal text-phoenix-muted">dự kiến</small>
                        ) : null}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Bang>
          </Cuon>
        ) : (
          <p className="py-5 text-sm text-phoenix-muted">Tháng này chưa có kỳ thu học phí.</p>
        )}
        <Ghi>
          Kỳ đang chờ đối soát chỉ hiển thị số dự kiến. Số quyền lợi cuối cùng được xác định khi
          trường nhận tiền và áp dụng chính sách hiệu lực lúc đó.
        </Ghi>
      </The>

      <The>
        <details>
          <summary className="cursor-pointer text-[13px] font-semibold text-phoenix-ink">
            Lịch sử ứng trước và thu hồi
          </summary>
          <div className="mt-3">
            {so.length ? (
              <Cuon>
                <Bang hep>
                  <thead>
                    <tr>
                      <Th>Tháng</Th>
                      <Th so>Quyền lợi</Th>
                      <Th so>Ứng thêm</Th>
                      <Th so>Thu hồi</Th>
                      <Th so>Thực nhận</Th>
                      <Th so>Nợ cuối kỳ</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...so].reverse().map((dong) => (
                      <tr key={dong.thang}>
                        <Td>{thangVn(dong.thang)}</Td>
                        <Td so>{tien(dong.quyenLoi)}</Td>
                        <Td so>{dong.ungThem ? tien(dong.ungThem) : '—'}</Td>
                        <Td so>{dong.thuHoi ? tien(dong.thuHoi) : '—'}</Td>
                        <Td so className="font-semibold">
                          {tien(dong.thucNhan)}
                        </Td>
                        <Td so>{tien(dong.noCuoiKy)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Bang>
              </Cuon>
            ) : (
              <p className="text-sm text-phoenix-muted">Chưa có dữ liệu công nợ.</p>
            )}
          </div>
        </details>
      </The>
    </>
  );
}
