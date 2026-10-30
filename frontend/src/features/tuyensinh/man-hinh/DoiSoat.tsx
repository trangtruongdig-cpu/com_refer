/**
 * MÀN HÌNH ĐỐI SOÁT — đồng hồ thứ hai của hệ thống.
 *
 * Lập đợt chỉ là gom các lần thu để gửi đối tác. Quỹ chi CHỈ được lập khi đợt
 * được đánh dấu ĐÃ NHẬN TIỀN. Ở cơ sở dữ liệu, trigger
 * `trg_chan_lap_quy_khi_chua_nhan_tien` chặn ở tầng dữ liệu và API không được đi
 * vòng; ở bản demo, kho dữ liệu chặn tương đương.
 */
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ngayVn, tien } from '../dinh-dang';
import { useDuLieu, useHanhDong } from '../dung-kho';
import { thangNay, thangCuaNgay } from '../tinh-toan';
import {
  Bang,
  BangTin,
  Co,
  Cuon,
  DauMuc,
  Ghi,
  Luoi,
  OSo,
  Rong,
  Td,
  Th,
  The,
} from '../thanh-phan/ui';

export function DoiSoat() {
  const { tatCa, dotDoiSoat } = useDuLieu();
  const { taoDotDoiSoat, danhDauNhanTien } = useHanhDong();
  const [chon, datChon] = useState<Record<string, boolean>>({});

  const chuaCoDot = tatCa.filter((d) => d.lanThu.dotDoiSoatMa === null);
  const theoTruong = useMemo(() => {
    const m = new Map<string, typeof chuaCoDot>();
    for (const d of chuaCoDot) {
      if (!m.has(d.ct.truongMa)) m.set(d.ct.truongMa, []);
      m.get(d.ct.truongMa)!.push(d);
    }
    return [...m.entries()];
  }, [chuaCoDot]);

  const choDoiSoat = tatCa.filter((d) => d.thangNhanTien === null);
  const veThangNay = tatCa.filter((d) => d.thangNhanTien === thangNay());

  return (
    <>
      <DauMuc
        tieuDe="Đối soát với trường đối tác"
        phu="Học viên đóng tiền là một việc, đối tác chuyển tiền về Trường là việc khác, cách nhau 4–6 tháng. Quỹ chi chỉ được lập ở mốc thứ hai."
      />

      <Luoi cot={4}>
        <OSo
          nhan="Kỳ chờ đối soát"
          so={String(choDoiSoat.length)}
          phu="chưa về tài khoản Trường"
          mau="canh"
        />
        <OSo
          nhan="Quỹ chi đang chờ"
          so={tien(choDoiSoat.reduce((t, d) => t + d.quyChi, 0))}
          phu="Trường đang ứng trước phần này"
          mau="tien"
        />
        <OSo
          nhan="Về trong tháng này"
          so={tien(veThangNay.reduce((t, d) => t + d.quyChi, 0))}
          phu={`${veThangNay.length} kỳ đã đối soát xong`}
          mau="chinh"
        />
        <OSo nhan="Số đợt đã lập" so={String(dotDoiSoat.length)} phu="gồm cả đợt chưa nhận tiền" />
      </Luoi>

      <The className="flex flex-col gap-3">
        <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
          Lần thu chưa xếp vào đợt nào
        </h3>
        {!theoTruong.length ? (
          <Rong>Mọi lần thu đều đã xếp vào một đợt đối soát.</Rong>
        ) : (
          theoTruong.map(([truongMa, ds]) => {
            const daChon = ds.filter((d) => chon[d.lanThu.ma]).map((d) => d.lanThu.ma);
            return (
              <div key={truongMa} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <b className="text-[13.5px] text-phoenix-navy">{ds[0]!.ct.truongTen}</b>
                  <Button
                    size="sm"
                    disabled={!daChon.length}
                    onClick={() => {
                      void taoDotDoiSoat(truongMa, daChon);
                      datChon({});
                    }}
                  >
                    Lập đợt đối soát ({daChon.length})
                  </Button>
                </div>
                <Cuon>
                  <Bang>
                    <thead>
                      <tr>
                        <Th />
                        <Th>Lần thu</Th>
                        <Th>Thí sinh</Th>
                        <Th so>Kỳ</Th>
                        <Th so>Học phí</Th>
                        <Th so>Quỹ chi</Th>
                        <Th>Ngày thu</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {ds.map((d) => (
                        <tr key={d.lanThu.ma}>
                          <Td>
                            <input
                              type="checkbox"
                              aria-label={`Chọn ${d.lanThu.ma}`}
                              checked={!!chon[d.lanThu.ma]}
                              onChange={(e) =>
                                datChon((cu) => ({ ...cu, [d.lanThu.ma]: e.target.checked }))
                              }
                            />
                          </Td>
                          <Td>
                            <span className="text-[12px] font-semibold text-phoenix-purple">
                              {d.lanThu.ma}
                            </span>
                            <small className="block text-[11px] text-phoenix-muted">
                              {d.lanThu.soChungTu}
                            </small>
                          </Td>
                          <Td>{d.hoSo.hoTen}</Td>
                          <Td so>{d.lanThu.kyThu}</Td>
                          <Td so>{tien(d.lanThu.soTien)}</Td>
                          <Td so>{tien(d.quyChi)}</Td>
                          <Td>{ngayVn(d.lanThu.ngayThu)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Bang>
                </Cuon>
              </div>
            );
          })
        )}
      </The>

      <The className="flex flex-col gap-3">
        <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Các đợt đối soát</h3>
        {!dotDoiSoat.length ? (
          <Rong>Chưa lập đợt nào.</Rong>
        ) : (
          <Cuon>
            <Bang>
              <thead>
                <tr>
                  <Th>Đợt</Th>
                  <Th>Trường</Th>
                  <Th so>Số kỳ</Th>
                  <Th so>Học phí</Th>
                  <Th so>Quỹ chi</Th>
                  <Th>Trạng thái</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {dotDoiSoat.map((dot) => {
                  const ds = tatCa.filter((d) => dot.lanThuMa.includes(d.lanThu.ma));
                  return (
                    <tr key={dot.ma}>
                      <Td>
                        <span className="text-[12px] font-semibold text-phoenix-purple">
                          {dot.ma}
                        </span>
                        <small className="block text-[11px] text-phoenix-muted">
                          lập {ngayVn(dot.ngayLap)}
                        </small>
                      </Td>
                      <Td>{dot.truongTen}</Td>
                      <Td so>{ds.length}</Td>
                      <Td so>{tien(ds.reduce((t, d) => t + d.lanThu.soTien, 0))}</Td>
                      <Td so>{tien(ds.reduce((t, d) => t + d.quyChi, 0))}</Td>
                      <Td>
                        {dot.trangThai === 'DA_NHAN_TIEN' ? (
                          <>
                            <Co loai="ok">Đã nhận tiền</Co>
                            <small className="block text-[11px] text-phoenix-muted">
                              {ngayVn(dot.ngayNhanTien ?? '')} · quỹ chi đã lập
                            </small>
                          </>
                        ) : (
                          <>
                            <Co loai="cho">Chưa nhận tiền</Co>
                            <small className="block text-[11px] text-phoenix-muted">
                              chưa được lập quỹ chi
                            </small>
                          </>
                        )}
                      </Td>
                      <Td>
                        {dot.trangThai === 'CHUA_NHAN_TIEN' ? (
                          <Button size="sm" onClick={() => void danhDauNhanTien(dot.ma)}>
                            Đánh dấu đã nhận tiền
                          </Button>
                        ) : (
                          <span className="text-[11.5px] text-phoenix-muted">
                            {thangCuaNgay(dot.ngayNhanTien ?? '')}
                          </span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Bang>
          </Cuon>
        )}
        <BangTin loai="canh">
          Chỉ bấm <b>đã nhận tiền</b> khi tiền thật đã vào tài khoản Trường và có chứng từ của đối
          tác. Đây là mốc duy nhất sinh ra quỹ chi, và quỹ chi là nguồn duy nhất để trả cho cán bộ.
        </BangTin>
        <Ghi>
          Ở bản có cơ sở dữ liệu, thao tác này đi qua `POST /dot-doi-soat/:id/khop` và được trigger
          chặn nếu đợt chưa ở trạng thái đã nhận tiền.
        </Ghi>
      </The>
    </>
  );
}
