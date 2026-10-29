/** MÀN HÌNH HỒ SƠ CỦA TÔI — danh sách hồ sơ trong phạm vi phụ trách. */
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ngayVn, tien } from '../dinh-dang';
import { timChuongTrinh } from '../du-lieu/danh-muc';
import { phamViPhuTrach, timNhanSu } from '../du-lieu/nhan-su';
import { useToi } from '../dung-kho';
import { useKho } from '../kho/kho.store';
import type { TrangThaiHoSo } from '../kho/kho.types';
import { Bang, Co, Cuon, DauMuc, Ghi, Rong, Td, Th, The, type LoaiCo } from '../thanh-phan/ui';

const CO_TRANG_THAI: Record<TrangThaiHoSo, [LoaiCo, string]> = {
  CHO_THANH_TOAN: ['cho', 'Chờ thu học phí'],
  DANG_HOC: ['ok', 'Đang học'],
  DA_DU_HOC_PHI: ['ok', 'Đã đóng đủ'],
  THOI_HOC: ['loi', 'Thôi học'],
};

export function HoSoCuaToi() {
  const toi = useToi();
  const hoSo = useKho((s) => s.hoSo);
  const dieuHuong = useNavigate();
  const trongPhamVi = phamViPhuTrach(toi);
  const ds = hoSo.filter((h) => trongPhamVi.includes(h.nhanSuId));

  return (
    <>
      <DauMuc
        tieuDe={toi.vaiTro === 'NV' ? 'Hồ sơ của tôi' : 'Hồ sơ trong phạm vi phụ trách'}
        phu={
          toi.vaiTro === 'NV'
            ? 'Hồ sơ bạn đã lập và tình trạng thu học phí từng kỳ.'
            : `Hồ sơ của ${trongPhamVi.length} cán bộ bạn phụ trách.`
        }
      >
        <Co loai="he">{ds.length} hồ sơ</Co>
      </DauMuc>

      {!ds.length ? (
        <The>
          <Rong>
            Chưa có hồ sơ nào.{' '}
            <Link to="/tuyensinh" className="font-semibold text-phoenix-purple">
              Chọn chương trình để lập hồ sơ đầu tiên
            </Link>
          </Rong>
        </The>
      ) : (
        <Cuon>
          <Bang>
            <thead>
              <tr>
                <Th>Mã</Th>
                <Th>Thí sinh</Th>
                <Th>Chương trình</Th>
                <Th>Cán bộ</Th>
                <Th so>Kỳ đã thu</Th>
                <Th so>Đã thu</Th>
                <Th>Trạng thái</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {ds.map((h) => {
                const ct = timChuongTrinh(h.chuongTrinhMa);
                const [loai, ten] = CO_TRANG_THAI[h.trangThai];
                return (
                  <tr key={h.ma}>
                    <Td>
                      <span className="text-[12px] font-semibold text-phoenix-purple">{h.ma}</span>
                      <small className="block text-[11px] text-phoenix-muted">
                        {ngayVn(h.ngayLap)}
                      </small>
                    </Td>
                    <Td>
                      {h.hoTen}
                      <small className="block text-[11px] text-phoenix-muted">{h.dienThoai}</small>
                    </Td>
                    <Td>
                      {ct?.tenNganh ?? h.chuongTrinhMa}
                      <small className="block text-[11px] text-phoenix-muted">
                        {ct?.truongTen}
                      </small>
                    </Td>
                    <Td>{timNhanSu(h.nhanSuId)?.hoTen ?? h.nhanSuId}</Td>
                    <Td so>
                      {h.kyDaThu}/{ct?.soKy ?? '?'}
                    </Td>
                    <Td so>{tien(h.kyDaThu * (ct?.hocPhiKy ?? 0))}</Td>
                    <Td>
                      <Co loai={loai}>{ten}</Co>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dieuHuong(`/tuyensinh/thu-hoc-phi/${h.ma}`)}
                      >
                        Thu học phí
                      </Button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Bang>
        </Cuon>
      )}

      <Ghi>
        Cột "Đã thu" là tiền thí sinh đã đóng, không phải tiền Trường đã nhận. Phần của Trường chỉ
        về sau khi đối tác đối soát — xem màn Đối soát.
      </Ghi>
    </>
  );
}
