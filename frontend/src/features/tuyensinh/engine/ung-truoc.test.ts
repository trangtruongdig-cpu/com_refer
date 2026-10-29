import { describe, expect, it } from 'vitest';
import { THAM_SO_CO_CHE, TY_LE_GIU_HOC_VIEN } from '../du-lieu/tham-so';
import { moPhongSoCongNo, soCongNo, type DongThang } from './ung-truoc';

/**
 * Dựng lại đúng giả thiết của LOGIC.md §8.3: một cán bộ tuyển đều 3 hồ sơ mỗi
 * tháng ngành DHCNVT-NNA, giữ 90% học viên mỗi kỳ, mốc tiền về T+5 / T+10 /
 * T+14 / T+19.
 *
 * LƯU Ý nghiệp vụ: §8 tính quyền lợi 60% quỹ chi = 1.680.000đ một kỳ, trong khi
 * §7 khai quy tắc riêng cho ngành này là SỐ TIỀN CỐ ĐỊNH 1.500.000đ. Hai mục của
 * tài liệu lệch nhau; kiểm thử này giữ theo §8 vì nó là nguồn của bảng số, còn
 * phần mềm dùng quy tắc §7. Chỗ lệch đã ghi vào danh sách giả định.
 */
const QUYEN_LOI_MOT_KY = 1_680_000;
const HO_SO_MOI_MOT_THANG = 3;
const MOC = [5, 10, 14, 19];

function quyenLoiThang(t: number): number {
  let tong = 0;
  for (let ky = 0; ky < MOC.length; ky++) {
    if (t >= MOC[ky]!) {
      tong +=
        HO_SO_MOI_MOT_THANG * QUYEN_LOI_MOT_KY * Math.pow(TY_LE_GIU_HOC_VIEN, ky);
    }
  }
  return Math.round(tong);
}

const cacThang = (soHoSoMoi: number): DongThang[] =>
  Array.from({ length: 21 }, (_, t) => ({
    thang: `T+${t}`,
    quyenLoi: quyenLoiThang(t),
    soHoSoMoi,
  }));

describe('sổ công nợ — ba nhánh (LOGIC.md §8.2)', () => {
  it('nhánh thu hồi: quyền lợi trên mức sàn thì trả nợ trước', () => {
    const d = soCongNo({ quyenLoi: 9_576_000, soHoSoMoi: 3, noDauKy: 24_800_000 }, THAM_SO_CO_CHE);
    expect(d.nhanh).toBe('THU_HOI');
    expect(d.thuHoi).toBe(4_576_000);
    expect(d.thucNhan).toBe(5_000_000);
    expect(d.noCuoiKy).toBe(20_224_000);
  });

  it('nhánh ứng thêm: chưa có tiền về nhưng đạt chỉ tiêu', () => {
    const d = soCongNo({ quyenLoi: 0, soHoSoMoi: 3, noDauKy: 0 }, THAM_SO_CO_CHE);
    expect(d.nhanh).toBe('UNG_THEM');
    expect(d.ungThem).toBe(5_000_000);
    expect(d.thucNhan).toBe(5_000_000);
    expect(d.noCuoiKy).toBe(5_000_000);
  });

  it('nhánh chỉ duy trì: không đạt chỉ tiêu thì chỉ nhận tiền học viên còn học', () => {
    const d = soCongNo({ quyenLoi: 3_360_000, soHoSoMoi: 2, noDauKy: 0 }, THAM_SO_CO_CHE);
    expect(d.nhanh).toBe('CHI_DUY_TRI');
    expect(d.thucNhan).toBe(3_360_000);
    expect(d.ungThem).toBe(0);
    expect(d.noCuoiKy).toBe(0);
  });

  it('cán bộ luôn nhận ít nhất mức sàn khi đạt chỉ tiêu', () => {
    for (const quyenLoi of [0, 1_000_000, 4_999_999, 5_040_000, 13_658_400]) {
      const d = soCongNo({ quyenLoi, soHoSoMoi: 3, noDauKy: 10_000_000 }, THAM_SO_CO_CHE);
      expect(d.thucNhan).toBeGreaterThanOrEqual(THAM_SO_CO_CHE.mucSan);
    }
  });
});

describe('bảng số đã kiểm của LOGIC.md §8.3', () => {
  const ds = moPhongSoCongNo(cacThang(HO_SO_MOI_MOT_THANG), THAM_SO_CO_CHE);
  const tai = (t: number) => ds[t]!;

  it('quyền lợi từng chặng khớp tài liệu', () => {
    expect(tai(0).quyenLoi).toBe(0);
    expect(tai(5).quyenLoi).toBe(5_040_000);
    expect(tai(10).quyenLoi).toBe(9_576_000);
    expect(tai(14).quyenLoi).toBe(13_658_400);
    expect(tai(19).quyenLoi).toBe(17_332_560);
  });

  it('nợ đỉnh đúng 25.000.000đ = 5 tháng × mức sàn', () => {
    const dinh = Math.max(...ds.map((d) => d.noCuoiKy));
    expect(dinh).toBe(25_000_000);
    expect(tai(4).noCuoiKy).toBe(25_000_000);
  });

  it('tất toán hết ở T+14: thu hồi 6.496.000, thực nhận 7.162.400, nợ 0', () => {
    expect(tai(14).thuHoi).toBe(6_496_000);
    expect(tai(14).thucNhan).toBe(7_162_400);
    expect(tai(14).noCuoiKy).toBe(0);
  });

  it('thu nhập ổn định 17.332.560đ từ T+19', () => {
    expect(tai(19).thucNhan).toBe(17_332_560);
    expect(tai(20).thucNhan).toBe(17_332_560);
  });

  it('tổng đã ứng đúng bằng tổng thu hồi — cơ chế tự tất toán', () => {
    const ung = ds.reduce((t, d) => t + d.ungThem, 0);
    const thu = ds.reduce((t, d) => t + d.thuHoi, 0);
    expect(ung).toBe(25_000_000);
    expect(thu).toBe(25_000_000);
  });

  it('tổng chi không vượt tổng quyền lợi tạo ra — không thể bội chi', () => {
    const chi = ds.reduce((t, d) => t + d.thucNhan, 0);
    const quyenLoi = ds.reduce((t, d) => t + d.quyenLoi, 0);
    expect(chi).toBeLessThanOrEqual(quyenLoi);
  });
});

describe('hụt chỉ tiêu — LOGIC.md §8.4', () => {
  const ds = moPhongSoCongNo(cacThang(2), THAM_SO_CO_CHE);

  it('không có đồng thu nhập nào trong 5 tháng đầu', () => {
    for (let t = 0; t <= 4; t++) expect(ds[t]!.thucNhan).toBe(0);
  });

  it('từ T+5 chỉ còn tiền duy trì học viên', () => {
    // 2 hồ sơ mỗi tháng ⇒ 2 × 1.680.000 = 3.360.000
    expect(ds[5]!.quyenLoi).toBe(5_040_000);
    expect(ds[5]!.nhanh).toBe('THU_HOI');
    expect(ds[5]!.noCuoiKy).toBe(0);
  });
});
