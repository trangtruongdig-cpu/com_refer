/**
 * MÀN HÌNH CHI TIẾT CHƯƠNG TRÌNH — vừa là tờ thông tin tư vấn, vừa là bảng kinh
 * tế của sản phẩm.
 *
 * Khối "Kinh tế một kỳ thu" là chỗ trả lời câu hỏi hay bị hiểu ngược nhất:
 * Phoenix KHÔNG nộp tiền cho đối tác rồi lấy phần trăm. Học viên nộp học phí,
 * đối tác trích lại tối đa 30%, Trường trừ thuế và định mức, phần còn lại mới là
 * quỹ chi — và mọi khoản trả cho người chỉ được lấy từ đó.
 */
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { heSoChu, ngayVn, pt, ptPpm, pvChu, tien, thangVn } from '../dinh-dang';
import { dieuKienCua, hoSoCanNop, tenHe, timChuongTrinh } from '../du-lieu/danh-muc';
import { DAU_VIEC, QUY_TAC } from '../du-lieu/tham-so';
import {
  chiaCoCau,
  chiaDauViec,
  doanhSoQuyDoiMotKy,
  hocPhiToanKhoa,
  nopDoiTacMotKy,
  pv,
  quyChiMotKy,
  thueMotKy,
  tienTrichMotKy,
  heSoQuyDoi,
} from '../engine/quy-chi';
import { chonQuyTac, tinhTheoQuyTac } from '../engine/quy-tac';
import { useDuLieu } from '../dung-kho';
import { lichDoiSoat, soatChuongTrinh, thangNay } from '../tinh-toan';
import {
  Bang,
  BangTin,
  Co,
  Cuon,
  DauMuc,
  Dong,
  Ghi,
  Luoi,
  OSo,
  Td,
  Th,
  The,
} from '../thanh-phan/ui';

export function ChiTietChuongTrinh() {
  const { ma = '' } = useParams();
  const dieuHuong = useNavigate();
  const { coCau } = useDuLieu();
  const ct = timChuongTrinh(ma);

  if (!ct) {
    return (
      <The>
        <p className="text-sm">
          Không có chương trình <b>{ma}</b>.{' '}
          <Link to="/tuyensinh" className="font-semibold text-phoenix-purple">
            Về mạng lưới
          </Link>
        </p>
      </The>
    );
  }

  const quyChi = quyChiMotKy(ct);
  const coCauChia = chiaCoCau(quyChi, coCau);
  const mangLuoi = coCauChia.find((x) => x.khoan.ma === 'KHOAN_MANG_LUOI')?.soTien ?? 0;
  const dauViecChia = chiaDauViec(mangLuoi, DAU_VIEC);
  const soat = soatChuongTrinh(ct, coCau, 3);
  const qtNv = chonQuyTac(QUY_TAC, {
    vaiTro: 'NV',
    nganh: ct.ma,
    truong: ct.truongMa,
    he: ct.he,
    ngay: new Date().toISOString().slice(0, 10),
  });
  const nvMotKy = soat.chi.find((x) => x.ma === 'NV')?.soTien ?? 0;
  const lich = lichDoiSoat(ct, thangNay());

  return (
    <>
      <button
        type="button"
        onClick={() => dieuHuong('/tuyensinh')}
        className="self-start text-[13px] font-semibold text-phoenix-purple"
      >
        ← Quay lại mạng lưới
      </button>

      <DauMuc tieuDe={ct.tenNganh} phu={`${ct.truongTen} · mã ${ct.ma}`}>
        <Co loai="he">{tenHe(ct.he)}</Co>
        {ct.nganhSucKhoe ? <Co loai="cho">Ngành sức khoẻ</Co> : null}
      </DauMuc>

      <Luoi cot={4}>
        <OSo
          nhan="Thời gian đào tạo"
          so={`${ct.thoiLuongThang} tháng`}
          phu={`${ct.soKy} kỳ`}
          mau="chinh"
        />
        <OSo nhan="Học phí một kỳ" so={tien(ct.hocPhiKy)} phu="đóng theo từng kỳ" mau="tien" />
        <OSo
          nhan="Học phí toàn khoá"
          so={tien(hocPhiToanKhoa(ct))}
          phu={`${ct.soKy} kỳ × ${tien(ct.hocPhiKy)}`}
          mau="tien"
        />
        <OSo
          nhan="Đầu vào"
          so={ct.tuTrinhDo === 'THPT' ? 'THPT' : tenHe(ct.tuTrinhDo)}
          phu="trình độ đã có"
        />
      </Luoi>

      <Luoi cot={2}>
        <The className="flex flex-col gap-2">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Kinh tế một kỳ thu</h3>
          <Dong mt="Học viên nộp học phí" phu="một kỳ" gt={tien(ct.hocPhiKy)} />
          <Dong
            mt="Đối tác giữ"
            phu={`${pt(1 - ct.tyLeTrichPpm / 1_000_000)} học phí`}
            gt={`− ${tien(nopDoiTacMotKy(ct))}`}
          />
          <Dong
            mt="Đối tác trích về Trường"
            phu={`van 1: tỷ lệ trích ${ptPpm(ct.tyLeTrichPpm)}`}
            gt={tien(tienTrichMotKy(ct))}
          />
          <Dong
            mt="Thuế"
            phu={ct.thuePpm === 0 ? 'van 2: đang là 0 — chờ kế toán xác nhận' : ptPpm(ct.thuePpm)}
            gt={`− ${tien(thueMotKy(ct))}`}
          />
          <Dong
            mt="Định mức Trường giữ lại"
            phu="van 3: chi phí đào tạo mỗi kỳ"
            gt={`− ${tien(ct.dinhMucKy)}`}
          />
          <Dong
            tong
            mt="QUỸ CHI MỘT KỲ"
            phu={`${pt(quyChi / ct.hocPhiKy)} học phí — toàn bộ tiền trả cho tuyển sinh lấy từ đây`}
            gt={tien(quyChi)}
          />
          <Luoi cot={3} className="mt-1">
            <div className="rounded-md bg-phoenix-panel px-2.5 py-2">
              <Dong mt="PV" gt={pvChu(pv(ct))} />
            </div>
            <div className="rounded-md bg-phoenix-panel px-2.5 py-2">
              <Dong mt="Hệ số quy đổi" gt={heSoChu(heSoQuyDoi(ct))} />
            </div>
            <div className="rounded-md bg-phoenix-panel px-2.5 py-2">
              <Dong mt="Doanh số quy đổi" gt={tien(doanhSoQuyDoiMotKy(ct))} />
            </div>
          </Luoi>
          <Ghi>
            PV = quỹ chi một kỳ / 800.000đ. Doanh số quy đổi = quỹ chi × 5,6, đưa mọi hệ về thang
            học phí trung cấp để dùng chung một biểu lương. Nhờ vậy một đồng doanh số quy đổi của
            hệ nào cũng mang về cho Trường đúng bằng nhau.
          </Ghi>
        </The>

        <The className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Cơ cấu quỹ chi</h3>
            <Co loai={coCauChia.reduce((t, x) => t + x.khoan.ppm, 0) === 1_000_000 ? 'ok' : 'loi'}>
              tổng {ptPpm(coCauChia.reduce((t, x) => t + x.khoan.ppm, 0))}
            </Co>
          </div>
          {coCauChia.map(({ khoan, soTien }) => (
            <Dong
              key={khoan.ma}
              mt={khoan.ten}
              phu={`${ptPpm(khoan.ppm)}${khoan.theoHoaDon ? ' · chi theo hoá đơn' : ''}`}
              gt={tien(soTien)}
            />
          ))}
          <Dong
            tong
            mt="Cộng"
            phu="đúng bằng quỹ chi, không thừa không thiếu một đồng"
            gt={tien(coCauChia.reduce((t, x) => t + x.soTien, 0))}
          />
          <Ghi>
            Thù lao trưởng nhóm và trưởng phòng nằm BÊN TRONG quỹ chi, không phải khoản cộng thêm
            bên ngoài. Bốn khoản 5% cuối chi theo hoá đơn và có dự toán năm riêng — gộp chúng vào
            phần trả cho người là lỗi trộn chi phí cố định vào quỹ biến đổi.
          </Ghi>
        </The>
      </Luoi>

      <The className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
            Soát trần chi — tổng chi không được vượt quỹ chi
          </h3>
          <div className="flex gap-1.5">
            {soat.coBiChan ? <Co loai="cho">có khoản bị trần chặn</Co> : null}
            <Co loai={soat.vuotTran ? 'loi' : 'ok'}>
              {soat.vuotTran ? 'VƯỢT TRẦN' : `trong trần · ${pt(soat.tyLe)}`}
            </Co>
          </div>
        </div>
        {soat.chi.map((d) => (
          <Dong
            key={d.ma}
            mt={d.ten}
            phu={
              d.biChan
                ? `chính sách ${tien(d.mucTruocTran)} — trần cắt còn ${tien(d.soTien)}`
                : undefined
            }
            gt={tien(d.soTien)}
          />
        ))}
        <Dong mt="Tổng chi" gt={tien(soat.tongChi)} />
        <Dong
          tong
          mt="Còn lại trong quỹ chi"
          phu={`${pt(soat.tyLe)} quỹ chi đã dùng`}
          gt={tien(soat.conLai)}
        />
        {qtNv ? (
          <BangTin loai="tin">
            Quy tắc áp dụng cho cán bộ tuyển sinh: <b>{qtNv.ma}</b> — cơ sở {qtNv.coSo}, cách xác
            định {qtNv.cachXacDinh}
            {qtNv.ghiChu ? <> . {qtNv.ghiChu}</> : null}
          </BangTin>
        ) : null}
        {qtNv?.cachXacDinh === 'BAC_THEO_SO_LUONG' ? (
          <Cuon>
            <Bang>
              <thead>
                <tr>
                  <Th>Bậc theo số hồ sơ trong tháng</Th>
                  <Th so>Tỷ lệ</Th>
                  <Th so>Cán bộ nhận một kỳ</Th>
                </tr>
              </thead>
              <tbody>
                {(qtNv.bacSoLuong ?? []).map(([so, ppm]) => (
                  <tr key={so}>
                    <Td>từ {so} hồ sơ</Td>
                    <Td so>{ptPpm(ppm)}</Td>
                    <Td so>
                      {tien(
                        tinhTheoQuyTac(qtNv, {
                          quyChiKy: quyChi,
                          hocPhiKy: ct.hocPhiKy,
                          soHoSoThang: so,
                          doanhSoQuyDoi: doanhSoQuyDoiMotKy(ct),
                        }).soTien,
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Bang>
          </Cuon>
        ) : null}
      </The>

      <Luoi cot={2}>
        <The className="flex flex-col gap-2">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
            Quyền lợi của cán bộ tuyển sinh
          </h3>
          <Dong mt="Một kỳ thu" phu="theo quy tắc đang hiệu lực" gt={tien(nvMotKy)} />
          <Dong
            mt={`Toàn khoá ${ct.soKy} kỳ`}
            phu="nếu học viên theo học hết khoá"
            gt={tien(nvMotKy * ct.soKy)}
          />
          <Dong
            tong
            mt="Khoản mạng lưới của kỳ"
            phu="phần 60% chia theo 11 đầu việc đã nghiệm thu"
            gt={tien(mangLuoi)}
          />
          <Ghi>
            Khoản mạng lưới không trả trọn cho một người chỉ vì họ mang hồ sơ về. Một hồ sơ thường
            do nhiều người cùng làm, nên nó chia theo đầu việc đã nghiệm thu — trả đúng người đã
            làm đúng phần việc, và trả được cho bộ phận chứ không chỉ cho cá nhân.
          </Ghi>
        </The>

        <The className="flex flex-col gap-2">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
            Lịch tiền thật về Trường
          </h3>
          <Cuon>
            <Bang hep>
              <thead>
                <tr>
                  <Th>Kỳ</Th>
                  <Th>Tiền về tháng</Th>
                  <Th so>Trễ</Th>
                  <Th so>Tỷ lệ giữ học viên</Th>
                </tr>
              </thead>
              <tbody>
                {lich.map((d) => (
                  <tr key={d.ky}>
                    <Td>Kỳ {d.ky}</Td>
                    <Td>{thangVn(d.thangVe)}</Td>
                    <Td so>T+{d.treThang}</Td>
                    <Td so>{pt(d.tyLeGiu)}</Td>
                  </tr>
                ))}
              </tbody>
            </Bang>
          </Cuon>
          <BangTin loai="canh">
            Học viên đóng tiền <b>không</b> có nghĩa Trường đã có tiền. Doanh số ghi nhận ngay lúc
            thu, còn quỹ chi chỉ được lập khi đối tác đối soát và chuyển tiền về — lệch nhau{' '}
            {ct.treThang === 0 ? 'không tháng vì đây là sản phẩm của Trường' : `${ct.treThang}–6 tháng`}.
          </BangTin>
        </The>
      </Luoi>

      <The className="flex flex-col gap-3">
        <h3 className="text-[14.5px] font-semibold text-phoenix-ink">
          Mười một đầu việc chia khoản mạng lưới
        </h3>
        <Cuon>
          <Bang>
            <thead>
              <tr>
                <Th>Mã</Th>
                <Th>Đầu việc</Th>
                <Th so>Trọng số</Th>
                <Th so>Số tiền một kỳ</Th>
              </tr>
            </thead>
            <tbody>
              {dauViecChia.map(({ dauViec, soTien }) => (
                <tr key={dauViec.ma}>
                  <Td>
                    <span className="font-semibold text-phoenix-purple">{dauViec.ma}</span>
                  </Td>
                  <Td>{dauViec.ten}</Td>
                  <Td so>{pt(dauViec.trongSo)}</Td>
                  <Td so>{tien(soTien)}</Td>
                </tr>
              ))}
              <tr>
                <Td />
                <Td className="font-semibold">Cộng</Td>
                <Td so className="font-semibold">
                  100%
                </Td>
                <Td so className="font-semibold">
                  {tien(dauViecChia.reduce((t, x) => t + x.soTien, 0))}
                </Td>
              </tr>
            </tbody>
          </Bang>
        </Cuon>
      </The>

      <Luoi cot={2}>
        <The className="flex flex-col gap-2">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Điều kiện dự tuyển</h3>
          <ul className="flex flex-col gap-1.5">
            {dieuKienCua(ct).map((d) => (
              <li key={d} className="flex gap-2 text-[13.5px] leading-snug">
                <span className="font-bold text-phoenix-purple">—</span>
                <span>{d}</span>
              </li>
            ))}
            {ct.nganhSucKhoe ? (
              <li className="flex gap-2 text-[13.5px] leading-snug">
                <span className="font-bold text-phoenix-yellow-600">★</span>
                <span>
                  Ngành sức khoẻ: một số đối tượng phải có tối thiểu 36 tháng công tác đúng chuyên
                  môn, theo quy định của trường đối tác
                </span>
              </li>
            ) : null}
          </ul>
          <Ghi>
            Căn cứ Thông tư 52/2026/TT-BGDĐT về liên thông giữa trung học nghề, trung cấp, cao
            đẳng và đại học, hiệu lực từ 15/8/2026. Người học được công nhận kết quả đã tích luỹ
            và không phải học lại phần đã được công nhận.
          </Ghi>
        </The>

        <The className="flex flex-col gap-2">
          <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Hồ sơ thí sinh cần nộp</h3>
          <ul className="flex flex-col gap-1.5">
            {hoSoCanNop(ct).map((d, i) => (
              <li key={d} className="flex gap-2 text-[13.5px] leading-snug">
                <span className="font-bold text-phoenix-purple">{i + 1}.</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <Ghi>
            Khi lập hồ sơ trên phần mềm, thí sinh nộp bản chụp hoặc bản quét. Bản sao có chứng
            thực nộp khi nhập học.
          </Ghi>
        </The>
      </Luoi>

      <The className="flex flex-col gap-2">
        <h3 className="text-[14.5px] font-semibold text-phoenix-ink">Hình thức tuyển sinh</h3>
        <ul className="flex flex-col gap-1.5">
          {[
            'Xét tuyển theo kết quả học tập toàn khoá của trình độ trước đó',
            'Một số ngành có thể tổ chức thi môn cơ sở ngành hoặc phỏng vấn',
            'Thí sinh vừa tốt nghiệp trong năm được dùng giấy chứng nhận tốt nghiệp tạm thời',
          ].map((d) => (
            <li key={d} className="flex gap-2 text-[13.5px] leading-snug">
              <span className="font-bold text-phoenix-purple">—</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <BangTin loai="canh">
          Mỗi trường đối tác có quy định riêng về <b>ngành gần</b>, môn thi và giấy tờ bổ sung. Đối
          chiếu thông báo tuyển sinh chính thức của trường trước khi cam kết với thí sinh.
        </BangTin>
      </The>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to={`/tuyensinh/lap-ho-so?ct=${ct.ma}`}>Lập hồ sơ thí sinh cho chương trình này</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/tuyensinh">Xem chương trình khác</Link>
        </Button>
      </div>
      <Ghi>Dữ liệu cập nhật đến {ngayVn(new Date().toISOString().slice(0, 10))}.</Ghi>
    </>
  );
}
