/**
 * MÀN HÌNH QUẢN TRỊ — bàn van điều hành.
 *
 * Người điều hành siết van hoặc mở van, không sửa code: cơ cấu quỹ chi, mức sàn
 * ứng trước, chỉ tiêu hồ sơ. Hai chốt an toàn phải thấy được ở đây:
 *
 *   • Cơ cấu quỹ chi bắt buộc cộng đúng 100% mới lưu được.
 *   • Soát trần CHẶN chốt kỳ lương, không phải chỉ cảnh báo.
 */
import { Fragment, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { heSoChu, ngayVn, pt, ptPpm, pvChu, tien, thangVn } from '../dinh-dang';
import { CHUONG_TRINH } from '../du-lieu/danh-muc';
import { GIA_DINH, QUY_TAC } from '../du-lieu/tham-so';
import { heSoQuyDoi, pv, quyChiMotKy } from '../engine/quy-chi';
import { useBangLuong, useDuLieu, useHanhDong, useToi, useTongHopThang } from '../dung-kho';
import type { DongBangLuong } from '../kho/kho.types';
import { daiThang, soatChuongTrinh, thangNay } from '../tinh-toan';
import {
  Bang,
  BangTin,
  Co,
  Cuon,
  DauMuc,
  Dong,
  Ghi,
  HangNhom,
  Luoi,
  Nhan,
  OChon,
  ONhap,
  OSo,
  Rong,
  Td,
  Th,
  The,
} from '../thanh-phan/ui';

export function QuanTri() {
  const toi = useToi();
  const { tatCa, hoSo, taiKhoan, coCau, thamSoCoChe, kyLuong } = useDuLieu();
  const { capNhatCoCau, capNhatCoChe, themTaiKhoan, luuKyLuong, chotKyLuong, napLaiMau } =
    useHanhDong();

  const [thang, datThang] = useState(thangNay());
  const [vanNhap, datVanNhap] = useState<Record<string, string>>({});
  const [coCheNhap, datCoCheNhap] = useState({
    mucSan: String(thamSoCoChe.mucSan),
    chiTieuHoSo: String(thamSoCoChe.chiTieuHoSo),
  });
  const [tkNhap, datTkNhap] = useState({
    tenChu: '',
    tenNganHang: '',
    bin: '',
    soTaiKhoan: '',
  });

  const laQuanLy = toi.vaiTro === 'TP' || toi.vaiTro === 'ADMIN';
  const cacThang = useMemo(
    () => daiThang(tatCa, hoSo, thangNay()).slice().reverse(),
    [tatCa, hoSo],
  );
  const bl = useBangLuong(toi, thang);
  const toanBo = useTongHopThang(null, thang);
  const ky = kyLuong.find((k) => k.thang === thang);

  // Bảng soi chính sách của cả danh mục, soát ở bậc 3 hồ sơ. Ở nguồn `api`,
  // chỗ này nên đổi sang một lượt gọi `/tran-chi` cho toàn danh mục.
  const soatDanhMuc = useMemo(
    () => CHUONG_TRINH.map((ct) => ({ ct, kq: soatChuongTrinh(ct, coCau, 3) })),
    [coCau],
  );
  const tongPpm = coCau.reduce((t, k) => t + Number(vanNhap[k.ma] ?? k.ppm), 0);

  const theoNhom = useMemo(() => {
    const m = new Map<string, DongBangLuong[]>();
    for (const d of bl.bang) {
      const khoa = `${d.phong} ‣ ${d.nhom}`;
      if (!m.has(khoa)) m.set(khoa, []);
      m.get(khoa)!.push(d);
    }
    return [...m.entries()].sort();
  }, [bl.bang]);

  return (
    <>
      <DauMuc
        tieuDe="Quản trị"
        phu={
          laQuanLy
            ? 'Bảng lương, soát trần, bàn van cơ cấu quỹ chi và tài khoản nhận tiền.'
            : 'Bảng lương trong phạm vi nhóm bạn phụ trách.'
        }
      >
        <Co loai="he">{thangVn(thang)}</Co>
      </DauMuc>

      <The>
        <Nhan ten="Kỳ xem">
          <OChon value={thang} onChange={(e) => datThang(e.target.value)}>
            {cacThang.map((t) => (
              <option key={t} value={t}>
                {thangVn(t)}
              </option>
            ))}
          </OChon>
        </Nhan>
      </The>

      <Luoi cot={4}>
        <OSo
          nhan="Kỳ thu trong tháng"
          so={String(toanBo.soKyThu)}
          phu="toàn phòng"
          mau="chinh"
        />
        <OSo nhan="Học phí thực thu" so={tien(toanBo.hocPhiThucThu)} phu="thí sinh đã đóng" />
        <OSo
          nhan="Quỹ chi phát sinh"
          so={tien(toanBo.quyChiPhatSinh)}
          phu="của các kỳ thu trong tháng"
          mau="tien"
        />
        <OSo
          nhan="Quỹ chi đã về"
          so={tien(toanBo.quyChiDaVe)}
          phu="tiền thật, cơ sở chia tháng này"
          mau="tien"
        />
      </Luoi>

      <The className="flex flex-col gap-3">
        <DauMuc
          cap={2}
          tieuDe="Phải trả từng người"
          phu="Thực nhận = quyền lợi từ quỹ chi đã về, cộng ứng trước khi đạt chỉ tiêu, trừ thu hồi."
        />
        {!bl.bang.length ? (
          <Rong>Chưa có cán bộ nào trong phạm vi phụ trách.</Rong>
        ) : (
          <Cuon>
            <Bang>
              <thead>
                <tr>
                  <Th>Cán bộ</Th>
                  <Th so>Hồ sơ mới</Th>
                  <Th so>Kỳ thu</Th>
                  <Th so>Doanh số quy đổi</Th>
                  <Th so>Lương mềm</Th>
                  <Th so>Thưởng</Th>
                  <Th so>Quyền lợi</Th>
                  <Th so>Ứng thêm</Th>
                  <Th so>Thu hồi</Th>
                  <Th so>Thực nhận</Th>
                  <Th so>Nợ cuối kỳ</Th>
                </tr>
              </thead>
              <tbody>
                {theoNhom.map(([khoa, ds]) => (
                  <Fragment key={khoa}>
                    <HangNhom colSpan={11}>{khoa}</HangNhom>
                    {ds.map((d) => (
                      <tr key={d.nhanSuId}>
                        <Td>{d.hoTen}</Td>
                        <Td so>
                          {d.soHoSoMoi >= thamSoCoChe.chiTieuHoSo ? (
                            <Co loai="ok">{d.soHoSoMoi}</Co>
                          ) : (
                            <Co loai="cho">{d.soHoSoMoi}</Co>
                          )}
                        </Td>
                        <Td so>{d.soKyThu}</Td>
                        <Td so>{tien(d.doanhSoQuyDoi)}</Td>
                        <Td so>{tien(d.luongMem)}</Td>
                        <Td so>{tien(d.thuongNguong)}</Td>
                        <Td so>{tien(d.quyenLoi)}</Td>
                        <Td so>{d.ungThem ? tien(d.ungThem) : '—'}</Td>
                        <Td so>{d.thuHoi ? tien(d.thuHoi) : '—'}</Td>
                        <Td so className="font-bold">
                          {tien(d.thucNhan)}
                        </Td>
                        <Td so>{tien(d.noCuoiKy)}</Td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </Bang>
          </Cuon>
        )}

        <Luoi cot={2}>
          <div className="flex flex-col">
            <Dong
              mt="Cán bộ tuyển sinh"
              phu={`${bl.bang.length} người trong phạm vi`}
              gt={tien(bl.tongThucNhan)}
            />
            <Dong
              mt="Thù lao trưởng nhóm"
              phu={`${ptPpm(coCau.find((k) => k.ma === 'THU_LAO_TN')?.ppm ?? 0)} quỹ chi đã về`}
              gt={tien(bl.thuLaoTn)}
            />
            <Dong
              mt="Thù lao trưởng phòng"
              phu={`${ptPpm(coCau.find((k) => k.ma === 'THU_LAO_TP')?.ppm ?? 0)} quỹ chi đã về`}
              gt={tien(bl.thuLaoTp)}
            />
            <Dong
              tong
              mt="Cộng phải trả tháng này"
              gt={tien(bl.tongThucNhan + bl.thuLaoTn + bl.thuLaoTp)}
            />
          </div>
          <div className="flex flex-col gap-2">
            {bl.choDoiSoat > 0 ? (
              <BangTin loai="canh">
                <b>{tien(bl.choDoiSoat)}</b> quỹ chi còn nằm ở trường đối tác, chưa đối soát xong.
                Phần ứng trước ở trên là vốn lưu động của Trường, không phải chi phí — nó được thu
                hồi khi tiền về.
              </BangTin>
            ) : null}
            <BangTin loai={bl.vuotTran ? 'loi' : 'ok'}>
              {bl.vuotTran
                ? `Có ${bl.soatVuot.length} chương trình vượt trần chi — không chốt được kỳ lương.`
                : 'Soát trần: mọi chương trình phát sinh trong tháng đều nằm trong quỹ chi.'}
            </BangTin>
          </div>
        </Luoi>
      </The>

      {laQuanLy ? (
        <>
          <The className="flex flex-col gap-3">
            <DauMuc
              cap={2}
              tieuDe="Kỳ lương"
              phu="Mở kỳ → chụp ảnh tham số → tính bảng lương → soát trần → chốt. Kỳ đã chốt là bất biến; sai sót đi qua bút toán điều chỉnh ở kỳ sau."
            />
            <Luoi cot={3}>
              <OSo
                nhan="Trạng thái"
                so={ky ? (ky.trangThai === 'DA_CHOT' ? 'Đã chốt' : 'Đang mở') : 'Chưa mở'}
                phu={ky?.ngayChot ? `chốt ${ngayVn(ky.ngayChot)}` : ky ? `mở ${ngayVn(ky.ngayMo)}` : undefined}
                mau={ky?.trangThai === 'DA_CHOT' ? 'chinh' : 'thuong'}
              />
              <OSo
                nhan="Tổng phải trả đã tính"
                so={ky ? tien(ky.tongThucNhan + ky.thuLaoTn + ky.thuLaoTp) : '—'}
                phu={ky ? `${ky.bang.length} cán bộ` : 'chưa tính'}
                mau="tien"
              />
              <OSo
                nhan="Soát trần"
                so={ky ? (ky.vuotTran ? 'VƯỢT' : 'Trong trần') : '—'}
                phu={ky?.vuotTran ? 'chặn chốt kỳ' : 'đủ điều kiện chốt'}
                mau={ky?.vuotTran ? 'canh' : 'thuong'}
              />
            </Luoi>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={ky?.trangThai === 'DA_CHOT'}
                onClick={() =>
                  luuKyLuong({
                    thang,
                    trangThai: 'MO',
                    ngayMo: new Date().toISOString().slice(0, 10),
                    ngayChot: null,
                    // Chụp ảnh tham số: đóng băng chính sách tại thời điểm tính
                    snapshot: JSON.stringify({ coCau, thamSoCoChe, quyTac: QUY_TAC }),
                    bang: bl.bang,
                    tongThucNhan: bl.tongThucNhan,
                    thuLaoTn: bl.thuLaoTn,
                    thuLaoTp: bl.thuLaoTp,
                    quyChiPhatSinh: bl.quyChiPhatSinh,
                    vuotTran: bl.vuotTran,
                  })
                }
              >
                Mở kỳ, chụp ảnh tham số và tính bảng lương
              </Button>
              <Button
                variant="outline"
                disabled={!ky || ky.trangThai === 'DA_CHOT'}
                onClick={() => chotKyLuong(thang)}
              >
                Chốt kỳ {thangVn(thang)}
              </Button>
            </div>
            {ky ? (
              <Ghi>
                Ảnh tham số đã chụp dài {ky.snapshot.length} ký tự, gồm cơ cấu quỹ chi, tham số cơ
                chế và toàn bộ quy tắc tính tiền đang hiệu lực. Nhờ nó, kỳ này tính lại được y
                nguyên sau khi chính sách đổi.
              </Ghi>
            ) : null}
          </The>

          <The className="flex flex-col gap-3">
            <DauMuc
              cap={2}
              tieuDe="Bàn van cơ cấu quỹ chi"
              phu="Bảy khoản phải cộng đúng 100%. Không lưu được nếu lệch — đây là chốt an toàn, không phải cảnh báo."
            />
            <Luoi cot={3}>
              {coCau.map((k) => (
                <Nhan key={k.ma} ten={`${k.ten} (%)`}>
                  <ONhap
                    type="number"
                    step="0.1"
                    value={
                      vanNhap[k.ma] !== undefined
                        ? String(Number(vanNhap[k.ma]) / 10_000)
                        : String(k.ppm / 10_000)
                    }
                    onChange={(e) =>
                      datVanNhap((cu) => ({
                        ...cu,
                        [k.ma]: String(Math.round(Number(e.target.value) * 10_000)),
                      }))
                    }
                  />
                </Nhan>
              ))}
            </Luoi>
            <div className="flex flex-wrap items-center gap-2">
              <Co loai={tongPpm === 1_000_000 ? 'ok' : 'loi'}>tổng {ptPpm(tongPpm)}</Co>
              <Button
                onClick={() => {
                  const ppm = Object.fromEntries(
                    coCau.map((k) => [k.ma, Number(vanNhap[k.ma] ?? k.ppm)]),
                  );
                  if (capNhatCoCau(ppm)) datVanNhap({});
                }}
              >
                Lưu cơ cấu
              </Button>
              <Button variant="outline" onClick={() => datVanNhap({})}>
                Hoàn lại
              </Button>
            </div>

            <DauMuc cap={2} tieuDe="Tham số cơ chế lương" />
            <Luoi cot={3}>
              <Nhan ten="Mức sàn ứng trước mỗi tháng">
                <ONhap
                  type="number"
                  step="100000"
                  value={coCheNhap.mucSan}
                  onChange={(e) => datCoCheNhap((cu) => ({ ...cu, mucSan: e.target.value }))}
                />
              </Nhan>
              <Nhan ten="Chỉ tiêu hồ sơ mới để được ứng">
                <ONhap
                  type="number"
                  value={coCheNhap.chiTieuHoSo}
                  onChange={(e) => datCoCheNhap((cu) => ({ ...cu, chiTieuHoSo: e.target.value }))}
                />
              </Nhan>
              <div className="flex items-end">
                <Button
                  onClick={() =>
                    capNhatCoChe({
                      mucSan: Math.max(0, Math.round(Number(coCheNhap.mucSan))),
                      chiTieuHoSo: Math.max(1, Math.round(Number(coCheNhap.chiTieuHoSo))),
                    })
                  }
                >
                  Lưu tham số
                </Button>
              </div>
            </Luoi>
            <Ghi>
              Hạ chỉ tiêu từ 3 xuống 2 hồ sơ cho người thử việc làm nợ đỉnh tăng từ 25 lên khoảng
              33,2 triệu mỗi cán bộ và tất toán muộn hơn 6 tháng. Đây là đánh đổi giữa khả năng
              giữ người và vốn lưu động — cần Hiệu trưởng quyết.
            </Ghi>
          </The>

          <The className="flex flex-col gap-3">
            <DauMuc
              cap={2}
              tieuDe="Soát trần toàn danh mục"
              phu="Soát ở bậc 3 hồ sơ mỗi tháng. Cột còn lại không được âm ở bất kỳ sản phẩm nào."
            />
            <Cuon>
              <Bang>
                <thead>
                  <tr>
                    <Th>Sản phẩm</Th>
                    <Th so>Quỹ chi một kỳ</Th>
                    <Th so>PV</Th>
                    <Th so>Hệ số</Th>
                    <Th so>Tổng chi</Th>
                    <Th so>Còn lại</Th>
                    <Th so>Tỷ lệ</Th>
                    <Th>Cờ</Th>
                  </tr>
                </thead>
                <tbody>
                  {soatDanhMuc.map(({ ct, kq }) => (
                    <tr key={ct.ma}>
                      <Td>
                        <span className="font-semibold">{ct.ma}</span>
                        <small className="block text-[11px] text-phoenix-muted">
                          {ct.tenNganh} · {ct.truongTen}
                        </small>
                      </Td>
                      <Td so>{tien(quyChiMotKy(ct))}</Td>
                      <Td so>{pvChu(pv(ct))}</Td>
                      <Td so>{heSoChu(heSoQuyDoi(ct))}</Td>
                      <Td so>{tien(kq.tongChi)}</Td>
                      <Td so>{tien(kq.conLai)}</Td>
                      <Td so>{pt(kq.tyLe)}</Td>
                      <Td>
                        {kq.vuotTran ? <Co loai="loi">VƯỢT TRẦN</Co> : null}
                        {kq.coBiChan ? <Co loai="cho">BỊ CHẶN</Co> : null}
                        {!kq.vuotTran && !kq.coBiChan ? <Co loai="ok">đạt</Co> : null}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Bang>
            </Cuon>
            <Ghi>
              Cờ BỊ CHẶN nghĩa là trần của quy tắc đã cắt bớt mức ghi trong chính sách: mức thực
              nhận khác mức chính sách, phải sửa chính sách thay vì để lệch âm thầm.
            </Ghi>
          </The>

          <The className="flex flex-col gap-3">
            <DauMuc
              cap={2}
              tieuDe="Tài khoản nhận tiền"
              phu="Dùng để sinh mã QR ở màn thu học phí. Số tài khoản là tham số Trường tự khai, không nằm trong mã nguồn."
            />
            {taiKhoan.map((t) => (
              <Dong
                key={t.id}
                mt={t.tenChu}
                phu={`${t.tenNganHang} · mã BIN ${t.bin || '(chưa khai)'}`}
                gt={<span className="font-mono">{t.soTaiKhoan || '(chưa khai)'}</span>}
              />
            ))}
            <Luoi cot={2}>
              <Nhan ten="Chủ tài khoản">
                <ONhap
                  value={tkNhap.tenChu}
                  onChange={(e) => datTkNhap((cu) => ({ ...cu, tenChu: e.target.value }))}
                />
              </Nhan>
              <Nhan ten="Tên ngân hàng">
                <ONhap
                  value={tkNhap.tenNganHang}
                  onChange={(e) => datTkNhap((cu) => ({ ...cu, tenNganHang: e.target.value }))}
                />
              </Nhan>
              <Nhan ten="Mã ngân hàng (BIN, 6 số)">
                <ONhap
                  value={tkNhap.bin}
                  onChange={(e) => datTkNhap((cu) => ({ ...cu, bin: e.target.value }))}
                />
              </Nhan>
              <Nhan ten="Số tài khoản">
                <ONhap
                  value={tkNhap.soTaiKhoan}
                  onChange={(e) => datTkNhap((cu) => ({ ...cu, soTaiKhoan: e.target.value }))}
                />
              </Nhan>
            </Luoi>
            <Button
              onClick={() => {
                void themTaiKhoan(tkNhap);
                datTkNhap({ tenChu: '', tenNganHang: '', bin: '', soTaiKhoan: '' });
              }}
            >
              Thêm tài khoản
            </Button>
          </The>

          <The className="flex flex-col gap-3">
            <DauMuc
              cap={2}
              tieuDe="Giả định chưa chốt"
              phu="Đọc trước khi tin con số nào. Mục 1 và 3 ảnh hưởng trực tiếp đến mọi con số tiền."
            />
            <Cuon>
              <Bang>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Tham số</Th>
                    <Th>Đang dùng</Th>
                    <Th>Trạng thái</Th>
                  </tr>
                </thead>
                <tbody>
                  {GIA_DINH.map((g) => (
                    <tr key={g.so}>
                      <Td>{g.so}</Td>
                      <Td>{g.thamSo}</Td>
                      <Td>{g.dangDung}</Td>
                      <Td>{g.trangThai}</Td>
                    </tr>
                  ))}
                </tbody>
              </Bang>
            </Cuon>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => napLaiMau()}>
                Nạp lại dữ liệu mẫu
              </Button>
            </div>
            <Ghi>
              Nạp lại dữ liệu mẫu xoá toàn bộ hồ sơ, lần thu, đợt đối soát và kỳ lương đang có
              trong trình duyệt, rồi sinh lại bộ mẫu theo ngày hôm nay.
            </Ghi>
          </The>
        </>
      ) : (
        <BangTin loai="tin">
          Bàn van cơ cấu quỹ chi, kỳ lương và tài khoản nhận tiền chỉ mở cho trưởng phòng và quản
          trị. Bạn đang xem với vai trò {toi.vaiTro}.
        </BangTin>
      )}
    </>
  );
}
