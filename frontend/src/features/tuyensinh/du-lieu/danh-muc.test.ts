import { describe, expect, it } from 'vitest';
import {
  CHUONG_TRINH,
  DANH_MUC_TU_VAN_DOI_TAC,
  DANH_MUC_TU_VAN_PHOENIX,
  dieuKienCua,
  ghepDanhMucSale,
  hoaHongCanXacNhan,
  hoSoCanNop,
  laChuongTrinhTuVanDoiTac,
  laChuongTrinhVanHanh,
  trangThaiDotTuyenSinh,
  timDanhMucSale,
} from './danh-muc';

describe('danh mục Sale', () => {
  it('giữ sản phẩm tư vấn ngoài cấu hình vận hành và loại đối tác placeholder', () => {
    const danhMuc = ghepDanhMucSale(CHUONG_TRINH);
    const chuongTrinhPhunTheu = danhMuc.filter((muc) => muc.ma === 'NH-CSSD-PTTM');

    expect(chuongTrinhPhunTheu).toHaveLength(1);
    expect(laChuongTrinhVanHanh(chuongTrinhPhunTheu[0]!)).toBe(true);
    expect(danhMuc.some((muc) => /\[điền tên thật\]/i.test(muc.truongTen))).toBe(false);
    expect(new Set(danhMuc.map((muc) => muc.ma)).size).toBe(danhMuc.length);
    expect(timDanhMucSale('PHX-CC-CHAM_SOC_DA')).toMatchObject({
      ma: 'PHX-CC-CHAM_SOC_DA',
      hocPhiThamKhaoDong: 2_500_000,
      trangThaiThongTin: 'CAN_XAC_NHAN',
    });
  });

  it('có danh mục Phoenix 2026, gắn nhãn dữ liệu cũ và không lưu hoa hồng dạng số', () => {
    expect(DANH_MUC_TU_VAN_PHOENIX).toContainEqual(
      expect.objectContaining({
        ma: 'PHX-SC-CHAM_SOC_DA',
        he: 'SC',
        trangThaiThongTin: 'CAN_XAC_NHAN',
      }),
    );
    expect(DANH_MUC_TU_VAN_PHOENIX).toContainEqual(
      expect.objectContaining({
        ma: 'PHX-SC-Y_HOC_CO_TRUYEN',
        trangThaiThongTin: 'CAN_XAC_NHAN',
      }),
    );
    expect(DANH_MUC_TU_VAN_PHOENIX).toContainEqual(
      expect.objectContaining({
        ma: 'PHX-CC-NOI_MI_NGHE_THUAT',
        hocPhiThamKhaoDong: 2_500_000,
        trangThaiThongTin: 'CAN_XAC_NHAN',
      }),
    );
    expect(
      DANH_MUC_TU_VAN_PHOENIX.filter((sanPham) => sanPham.ma === 'PHX-SC-NOI_MI'),
    ).toHaveLength(1);
    expect(DANH_MUC_TU_VAN_PHOENIX).toContainEqual(
      expect.objectContaining({
        ma: 'PHX-SC-2025-QUAN_TRI_KHACH_SAN',
        trangThaiThongTin: 'THAM_KHAO_2025',
      }),
    );
    expect(
      DANH_MUC_TU_VAN_PHOENIX.every(
        (sanPham) => sanPham.hoaHongHienThi.includes('70%') && !('tyLeHoaHongToiDaPpm' in sanPham),
      ),
    ).toBe(true);
    expect(
      DANH_MUC_TU_VAN_PHOENIX.find((sanPham) => sanPham.he === 'NH')?.saleCanThu.join(' '),
    ).not.toMatch(/bằng cấp|trình độ/i);
    const soCap = DANH_MUC_TU_VAN_PHOENIX.find(
      (sanPham) => sanPham.ma === 'PHX-SC-Y_HOC_CO_TRUYEN',
    )!;
    expect(soCap.dieuKien.join(' ')).toContain('15 tuổi');
    expect(soCap.dieuKien.join(' ')).not.toMatch(/đã tốt nghiệp|bắt buộc.*(bằng cấp|học bạ)/i);
    expect(soCap.hoSo.join(' ')).toContain('học bạ');
  });

  it('bổ sung chương trình đối tác có nguồn riêng nhưng không biến thành dữ liệu vận hành', () => {
    const danhMuc = ghepDanhMucSale(CHUONG_TRINH);
    const ma = DANH_MUC_TU_VAN_DOI_TAC.map((muc) => muc.ma);

    expect(DANH_MUC_TU_VAN_DOI_TAC).toHaveLength(63);
    expect(new Set(ma).size).toBe(ma.length);
    expect(new Set(DANH_MUC_TU_VAN_DOI_TAC.map((muc) => muc.truongMa)).size).toBe(10);
    expect(
      DANH_MUC_TU_VAN_DOI_TAC.filter((muc) => muc.truongMa === 'HCCT' && muc.he === 'CD'),
    ).toHaveLength(15);
    expect(
      DANH_MUC_TU_VAN_DOI_TAC.filter((muc) => muc.truongMa === 'HCCT' && muc.he === 'TC'),
    ).toHaveLength(9);
    expect(
      DANH_MUC_TU_VAN_DOI_TAC.filter((muc) => muc.loaiTuyenSinh === 'VAN_BANG_2_CHINH_THUC'),
    ).toHaveLength(3);
    expect(danhMuc.filter(laChuongTrinhTuVanDoiTac)).toHaveLength(63);
    expect(
      DANH_MUC_TU_VAN_DOI_TAC.every(
        (muc) =>
          muc.nguon.length > 0 &&
          muc.nguon.every((nguon) => nguon.url.startsWith('https://')) &&
          !('tyLeTrichPpm' in muc) &&
          !('dinhMucKy' in muc) &&
          muc.ghiChuHoaHong.includes('Chưa có thỏa thuận'),
      ),
    ).toBe(true);
    expect(DANH_MUC_TU_VAN_DOI_TAC.find((muc) => muc.ma === 'TDMU-NGON_NGU_ANH')).toMatchObject({
      loaiTuyenSinh: 'VAN_BANG_2_CHINH_THUC',
      hocPhi: { dong: 477_500, donVi: 'TIN_CHI' },
    });
    expect(DANH_MUC_TU_VAN_DOI_TAC.find((muc) => muc.ma === 'NEU-KE_TOAN')?.loaiTuyenSinh).toBe(
      'NHAN_NGUOI_CO_BANG_DAI_HOC',
    );
  });

  it('tính trạng thái đợt theo ngày Việt Nam và giữ đúng ranh giới hạn hồ sơ', () => {
    const dntu = DANH_MUC_TU_VAN_DOI_TAC.find((muc) => muc.ma === 'DNTU-NGON_NGU_ANH')!;
    const tdmu = DANH_MUC_TU_VAN_DOI_TAC.find((muc) => muc.ma === 'TDMU-NGON_NGU_ANH')!;
    const neu = DANH_MUC_TU_VAN_DOI_TAC.find((muc) => muc.ma === 'NEU-KE_TOAN')!;
    const hcct = DANH_MUC_TU_VAN_DOI_TAC.find(
      (muc) => muc.ma === 'HCCT-TC_TRUYEN_THONG_DA_PHUONG_TIEN',
    )!;

    expect(trangThaiDotTuyenSinh(dntu, '2026-10-31')).toBe('SAP_MO');
    expect(trangThaiDotTuyenSinh(dntu, '2026-11-01')).toBe('DANG_NHAN');
    expect(trangThaiDotTuyenSinh(dntu, '2026-12-02')).toBe('DA_DONG');
    expect(trangThaiDotTuyenSinh(tdmu, '2026-11-30')).toBe('DANG_NHAN');
    expect(trangThaiDotTuyenSinh(tdmu, '2026-12-01')).toBe('DA_DONG');
    expect(trangThaiDotTuyenSinh(neu, '2026-10-31')).toBe('DA_DONG');
    expect(trangThaiDotTuyenSinh(hcct, '2026-12-31')).toBe('DANG_NHAN');
    expect(trangThaiDotTuyenSinh(hcct, '2027-01-01')).toBe('DA_DONG');
  });

  it('không bắt khai bằng cấp hoặc bảng điểm cho khóa ngắn hạn Phoenix', () => {
    const phunTheu = CHUONG_TRINH.find((ct) => ct.ma === 'NH-CSSD-PTTM')!;
    const dieuKien = dieuKienCua(phunTheu).join(' ');
    const hoSo = hoSoCanNop(phunTheu).join(' ');

    expect(dieuKien).toContain('15 tuổi');
    expect(hoSo).not.toMatch(/bảng điểm|bản sao học bạ|bằng tốt nghiệp/i);
    expect(hoSo).toMatch(/căn cước/i);
    expect(hoaHongCanXacNhan(phunTheu)).toBe(true);
  });

  it('cho phép tư vấn trung cấp Phoenix không thuộc sức khỏe với đầu vào THCS/THPT', () => {
    const cssd = CHUONG_TRINH.find((ct) => ct.ma === 'TC-CSSD')!;

    expect(dieuKienCua(cssd).join(' ')).toContain('THCS, THPT');
    expect(hoSoCanNop(cssd).join(' ')).toContain('học bạ THCS/THPT');
  });
});
