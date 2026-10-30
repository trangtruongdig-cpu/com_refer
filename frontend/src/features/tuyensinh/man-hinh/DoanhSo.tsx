/**
 * MÀN HÌNH DOANH SỐ — hai phần tách rõ, vì chúng chạy trên hai đồng hồ khác nhau:
 *
 *   1. Doanh số và biểu lương mềm  → tính ngay khi học viên đóng tiền
 *   2. Sổ công nợ ứng trước        → chạy theo tiền THẬT về Trường
 *
 * Phần 2 là cơ chế trả tiền hiệu lực 01/07/2026: không có lương cứng, cán bộ
 * được ứng mức sàn khi đạt chỉ tiêu hồ sơ, rồi thu hồi dần từ quyền lợi của
 * chính những hồ sơ mình mang về. Ứng trước là khoản phải thu, không phải chi phí.
 */
import { useMemo, useState } from 'react';
import { ngayVn, pt, tien, thangVn } from '../dinh-dang';
import { bieuLuongMemTai, THUONG_NGUONG } from '../du-lieu/tham-so';
import { useDuLieu, useSoCongNo, useToi, useTongHopThang } from '../dung-kho';
import { ptPpm } from '../dinh-dang';
import { daiThang, nguongThuongKeTiep, quyenLoiMotKy, thangNay } from '../tinh-toan';
import {
  Bang,
  BangTin,
  Co,
  Cuon,
  DauMuc,
  Dong,
  Ghi,
  Luoi,
  Nhan,
  OChon,
  OSo,
  Td,
  Th,
  The,
  TienDo,
} from '../thanh-phan/ui';

export function DoanhSo() {
  const toi = useToi();
  const { tatCa, hoSo, thamSoCoChe } = useDuLieu();
  const [thang, datThang] = useState(thangNay());

  const cacThang = useMemo(
    () => daiThang(tatCa, hoSo, thangNay()).slice().reverse(),
    [tatCa, hoSo],
  );
  // Ở nguồn `api`, hai con số này do máy chủ tính; ở nguồn demo chúng chạy
  // `engine/` ngay trong trình duyệt.
  const th = useTongHopThang(toi.id, thang);
  const so = useSoCongNo(toi.id, thang);
  const dongNay = so[so.length - 1];
  const bieu = bieuLuongMemTai(`${thang}-01`);
  const ke = nguongThuongKeTiep(th.doanhSoQuyDoi);
  const truoc = [...THUONG_NGUONG].reverse().find(([n]) => th.doanhSoQuyDoi >= n);
  const day = truoc?.[0] ?? 0;
  const tyLeTien = ke ? Math.max(0, Math.min(1, (th.doanhSoQuyDoi - day) / (ke[0] - day))) : 1;

  return (
    <>
      <DauMuc tieuDe="Doanh số và thu nhập" phu={`${toi.hoTen} · ${toi.nhom} · ${toi.phong}`}>
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
          nhan="Hồ sơ mới"
          so={String(th.soHoSoMoi)}
          phu={`chỉ tiêu được ứng: ${thamSoCoChe.chiTieuHoSo}`}
          mau={th.soHoSoMoi >= thamSoCoChe.chiTieuHoSo ? 'chinh' : 'canh'}
        />
        <OSo nhan="Kỳ thu" so={String(th.soKyThu)} phu="kỳ học phí đã thu" />
        <OSo nhan="Học phí thực thu" so={tien(th.hocPhiThucThu)} phu="tiền thí sinh đã đóng" />
        <OSo
          nhan="Doanh số quy đổi"
          so={tien(th.doanhSoQuyDoi)}
          phu="cơ sở xét ngưỡng và biểu lương"
          mau="chinh"
        />
      </Luoi>

      <Luoi cot={2}>
        <The className="flex flex-col gap-2">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
            Phần 1 — biểu lương mềm trên doanh số
          </h3>
          <Dong
            mt="Lương mềm lũy tiến"
            phu={`bậc thang biên trên ${tien(th.doanhSoQuyDoi)}`}
            gt={tien(th.luongMem)}
          />
          <Dong
            mt="Thưởng đạt ngưỡng"
            phu={th.thuong ? 'số tiền phẳng của ngưỡng đã vượt' : 'chưa đạt ngưỡng nào'}
            gt={tien(th.thuong)}
          />
          <Dong tong mt="Cộng phần 1" gt={tien(th.luongMem + th.thuong)} />
          <Ghi>
            Biểu đang dùng: {bieu.ten}, hiệu lực từ {ngayVn(bieu.hieuLucTu)}. Tỷ lệ gắn với một
            ngưỡng chỉ áp cho phần doanh số nằm trong khoảng của ngưỡng đó, không áp cho toàn bộ.
          </Ghi>
          {ke ? (
            <div className="flex flex-col gap-1.5">
              <TienDo tyLe={tyLeTien} />
              <Dong
                mt={`Còn ${tien(ke[0] - th.doanhSoQuyDoi)} nữa`}
                phu={`đạt ${tien(ke[0])} doanh số quy đổi để được thưởng ${tien(ke[1])}`}
                gt={pt(tyLeTien)}
              />
            </div>
          ) : (
            <BangTin loai="ok">Đã đạt ngưỡng thưởng cao nhất của tháng.</BangTin>
          )}
        </The>

        <The className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
              Phần 2 — sổ công nợ ứng trước
            </h3>
            {dongNay ? (
              <Co
                loai={
                  dongNay.nhanh === 'THU_HOI' ? 'ok' : dongNay.nhanh === 'UNG_THEM' ? 'cho' : 'loi'
                }
              >
                {dongNay.nhanh === 'THU_HOI'
                  ? 'đang thu hồi ứng trước'
                  : dongNay.nhanh === 'UNG_THEM'
                    ? 'được ứng mức sàn'
                    : 'không đạt chỉ tiêu'}
              </Co>
            ) : null}
          </div>
          <Dong
            mt="Quyền lợi phát sinh"
            phu="phần của bạn trong quỹ chi ĐÃ VỀ trong tháng"
            gt={tien(dongNay?.quyenLoi ?? 0)}
          />
          <Dong
            mt="Ứng thêm"
            phu={`mức sàn ${tien(thamSoCoChe.mucSan)} khi đạt ${thamSoCoChe.chiTieuHoSo} hồ sơ`}
            gt={tien(dongNay?.ungThem ?? 0)}
          />
          <Dong
            mt="Thu hồi ứng trước"
            phu="phần quyền lợi vượt mức sàn dùng trả nợ trước"
            gt={`− ${tien(dongNay?.thuHoi ?? 0)}`}
          />
          <Dong tong mt="Thực nhận tháng này" gt={tien(dongNay?.thucNhan ?? 0)} />
          <Dong
            mt="Nợ ứng trước cuối kỳ"
            phu="khoản phải thu, tự tất toán từ quyền lợi các kỳ sau"
            gt={tien(dongNay?.noCuoiKy ?? 0)}
          />
          <BangTin loai="tin">
            Cơ chế không có lương cứng. Bạn <b>luôn nhận ít nhất mức sàn</b> khi đạt chỉ tiêu; phần
            vượt mức sàn dùng để trả nợ ứng trước, hết nợ thì nhận trọn.
          </BangTin>
        </The>
      </Luoi>

      <The className="flex flex-col gap-3">
        <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
          Sổ công nợ theo tháng — nợ cuốn từ tháng trước sang
        </h3>
        <Cuon>
          <Bang>
            <thead>
              <tr>
                <Th>Tháng</Th>
                <Th so>Hồ sơ mới</Th>
                <Th so>Quyền lợi</Th>
                <Th so>Ứng thêm</Th>
                <Th so>Thu hồi</Th>
                <Th so>Thực nhận</Th>
                <Th so>Nợ cuối kỳ</Th>
              </tr>
            </thead>
            <tbody>
              {[...so].reverse().map((d) => (
                <tr key={d.thang}>
                  <Td>{thangVn(d.thang)}</Td>
                  <Td so>{d.soHoSoMoi}</Td>
                  <Td so>{tien(d.quyenLoi)}</Td>
                  <Td so>{d.ungThem ? tien(d.ungThem) : '—'}</Td>
                  <Td so>{d.thuHoi ? tien(d.thuHoi) : '—'}</Td>
                  <Td so className="font-semibold">
                    {tien(d.thucNhan)}
                  </Td>
                  <Td so>{tien(d.noCuoiKy)}</Td>
                </tr>
              ))}
            </tbody>
          </Bang>
        </Cuon>
        <Ghi>
          Tổng đã ứng trừ tổng thu hồi là số Trường đang cho bạn ứng. Nợ đỉnh chỉ phụ thuộc độ trễ
          đối soát và mức sàn, không phụ thuộc bạn làm nhiều hay ít.
        </Ghi>
      </The>

      <Luoi cot={2}>
        <The className="flex flex-col gap-3">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
            Các kỳ thu trong tháng — ghi nhận doanh số
          </h3>
          {th.kyThuTrongThang.length ? (
            <Cuon>
              <Bang hep>
                <thead>
                  <tr>
                    <Th>Ngày</Th>
                    <Th>Thí sinh</Th>
                    <Th so>Kỳ</Th>
                    <Th so>Học phí</Th>
                    <Th so>Quy đổi</Th>
                  </tr>
                </thead>
                <tbody>
                  {th.kyThuTrongThang.map((d) => (
                    <tr key={d.lanThu.ma}>
                      <Td>{ngayVn(d.lanThu.ngayThu)}</Td>
                      <Td>
                        {d.hoSo.hoTen}
                        <small className="block text-[11px] text-phoenix-muted">
                          {d.ct.tenNganh}
                        </small>
                      </Td>
                      <Td so>{d.lanThu.kyThu}</Td>
                      <Td so>{tien(d.lanThu.soTien)}</Td>
                      <Td so>{tien(d.doanhSoQuyDoi)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Bang>
            </Cuon>
          ) : (
            <Ghi>Chưa có kỳ thu nào trong tháng này.</Ghi>
          )}
        </The>

        <The className="flex flex-col gap-3">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
            Các kỳ tiền về trong tháng — sinh quyền lợi
          </h3>
          {th.kyNhanTienTrongThang.length ? (
            <Cuon>
              <Bang hep>
                <thead>
                  <tr>
                    <Th>Thí sinh</Th>
                    <Th so>Kỳ</Th>
                    <Th so>Quỹ chi</Th>
                    <Th>Quy tắc</Th>
                    <Th so>Quyền lợi</Th>
                  </tr>
                </thead>
                <tbody>
                  {th.kyNhanTienTrongThang.map((d) => {
                    const kq = quyenLoiMotKy(d, hoSo);
                    return (
                      <tr key={d.lanThu.ma}>
                        <Td>
                          {d.hoSo.hoTen}
                          <small className="block text-[11px] text-phoenix-muted">
                            {d.ct.tenNganh}
                          </small>
                        </Td>
                        <Td so>{d.lanThu.kyThu}</Td>
                        <Td so>{tien(d.quyChi)}</Td>
                        <Td>
                          <span className="text-[11.5px] text-phoenix-muted">
                            {kq?.quyTac.ma ?? '—'}
                            {kq?.quyTac.cachXacDinh === 'CO_DINH' &&
                            kq.quyTac.loaiGiaTri === 'TY_LE'
                              ? ` · ${ptPpm(kq.quyTac.giaTriPpm ?? 0)} quỹ chi`
                              : ''}
                          </span>
                          {kq?.biChan ? <Co loai="cho">bị trần chặn</Co> : null}
                        </Td>
                        <Td so className="font-semibold">
                          {tien(kq?.soTien ?? 0)}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Bang>
            </Cuon>
          ) : (
            <Ghi>
              Tháng này chưa có kỳ nào được đối soát về. Quyền lợi chỉ phát sinh khi tiền thật về
              Trường — trước đó Trường ứng trước cho bạn.
            </Ghi>
          )}
        </The>
      </Luoi>

      <BangTin loai="canh">
        Còn <b>{tien(th.choDoiSoat)}</b> quỹ chi của các kỳ bạn đã thu đang nằm ở trường đối tác,
        chưa đối soát xong. Khoản đó sẽ sinh quyền lợi khi tiền về.
      </BangTin>
    </>
  );
}
