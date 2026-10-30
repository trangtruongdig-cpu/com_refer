import { describe, expect, it } from 'vitest';
import { CHUONG_TRINH, timChuongTrinh } from '../du-lieu/danh-muc';
import { CO_CAU_QUY_CHI, QUY_TAC } from '../du-lieu/tham-so';
import { chonQuyTac, tinhTheoQuyTac } from './quy-tac';
import { soatMoiBac, soatTranChi } from './tran-chi';

const NGAY = '2026-09-15';
const ct = (ma: string) => timChuongTrinh(ma)!;

const soat = (ma: string, soHoSoThang = 3) => {
  const c = ct(ma);
  return soatTranChi({
    cauTruc: c,
    dsQuyTac: QUY_TAC,
    coCau: CO_CAU_QUY_CHI,
    dich: { nganh: c.ma, truong: c.truongMa, he: c.he, ngay: NGAY },
    soHoSoThang,
  });
};

describe('chọn quy tắc — cụ thể thắng rộng (LOGIC.md §7)', () => {
  it('ngành thắng hệ: DHCNVT-NNA dùng quy tắc số tiền cố định', () => {
    const qt = chonQuyTac(QUY_TAC, {
      vaiTro: 'NV',
      nganh: 'DHCNVT-NNA',
      truong: 'DHCNVT',
      he: 'DH',
      ngay: NGAY,
    });
    expect(qt?.ma).toBe('NV-DHCNVT-NNA');
  });

  it('trường thắng hệ: DH-DT02 dùng 8% học phí', () => {
    const qt = chonQuyTac(QUY_TAC, {
      vaiTro: 'NV',
      nganh: 'DH-DT02-GDMN',
      truong: 'DH-DT02',
      he: 'DH',
      ngay: NGAY,
    });
    expect(qt?.ma).toBe('NV-DH-DT02');
  });

  it('hệ thắng mặc định: ngành đại học khác dùng bậc theo số lượng', () => {
    const qt = chonQuyTac(QUY_TAC, {
      vaiTro: 'NV',
      nganh: 'DHCNVT-QTKD',
      truong: 'DHCNVT',
      he: 'DH',
      ngay: NGAY,
    });
    expect(qt?.ma).toBe('NV-HE-DH');
  });

  it('trung cấp rơi về mặc định 60% quỹ chi', () => {
    const qt = chonQuyTac(QUY_TAC, {
      vaiTro: 'NV',
      nganh: 'TC-DD',
      truong: 'PHOENIX',
      he: 'TC',
      ngay: NGAY,
    });
    expect(qt?.ma).toBe('NV-MAC-DINH');
  });

  it('quy tắc chưa hiệu lực thì không được chọn', () => {
    const qt = chonQuyTac(QUY_TAC, {
      vaiTro: 'NV',
      nganh: 'DHCNVT-NNA',
      truong: 'DHCNVT',
      he: 'DH',
      ngay: '2026-06-30',
    });
    expect(qt?.ma).not.toBe('NV-DHCNVT-NNA');
  });
});

describe('bậc theo số lượng hồ sơ', () => {
  it('48% → 52% → 56% → 60% theo 0/3/6/11 hồ sơ', () => {
    const c = ct('DHCNVT-QTKD');
    const qt = chonQuyTac(QUY_TAC, {
      vaiTro: 'NV',
      nganh: c.ma,
      truong: c.truongMa,
      he: c.he,
      ngay: NGAY,
    })!;
    const muc = (so: number) =>
      tinhTheoQuyTac(qt, {
        quyChiKy: 2_800_000,
        hocPhiKy: 11_000_000,
        soHoSoThang: so,
        doanhSoQuyDoi: 15_680_000,
      }).soTien;
    expect(muc(1)).toBe(1_344_000); // 48%
    expect(muc(3)).toBe(1_456_000); // 52%
    expect(muc(6)).toBe(1_568_000); // 56%
    expect(muc(11)).toBe(1_680_000); // 60%
  });
});

describe('soát trần chi — khớp bảng LOGIC.md §3.2', () => {
  it('TC-DD: quỹ chi 1.250.000, tổng chi 1.250.000, còn lại 0, tỷ lệ 100%', () => {
    const kq = soat('TC-DD');
    expect(kq.quyChi).toBe(1_250_000);
    expect(kq.tongChi).toBe(1_250_000);
    expect(kq.conLai).toBe(0);
    expect(Math.round(kq.tyLe * 100)).toBe(100);
    expect(kq.vuotTran).toBe(false);
  });

  it('DHCNVT-NNA: tổng chi 2.620.000, còn lại 180.000, tỷ lệ 94%', () => {
    const kq = soat('DHCNVT-NNA');
    expect(kq.quyChi).toBe(2_800_000);
    expect(kq.tongChi).toBe(2_620_000);
    expect(kq.conLai).toBe(180_000);
    expect(Math.round(kq.tyLe * 100)).toBe(94);
  });

  it('DH-DT02-GDMN: tổng chi 1.620.000, còn lại 430.000, tỷ lệ 79%', () => {
    const kq = soat('DH-DT02-GDMN');
    expect(kq.quyChi).toBe(2_050_000);
    expect(kq.tongChi).toBe(1_620_000);
    expect(kq.conLai).toBe(430_000);
    expect(Math.round(kq.tyLe * 100)).toBe(79);
  });

  it('không sản phẩm nào vượt trần ở mọi bậc số lượng', () => {
    for (const c of CHUONG_TRINH) {
      const ds = soatMoiBac(
        {
          cauTruc: c,
          dsQuyTac: QUY_TAC,
          coCau: CO_CAU_QUY_CHI,
          dich: { nganh: c.ma, truong: c.truongMa, he: c.he, ngay: NGAY },
        },
        [1, 3, 6, 11],
      );
      for (const { soHoSoThang, ketQua } of ds) {
        expect(ketQua.vuotTran, `${c.ma} ở bậc ${soHoSoThang}`).toBe(false);
      }
    }
  });

  it('cơ cấu bị nới quá tay thì soát trần bắt được', () => {
    const c = ct('TC-DD');
    const noiTay = CO_CAU_QUY_CHI.map((k) => (k.ma === 'DOI_NGOAI' ? { ...k, ppm: 300_000 } : k));
    const kq = soatTranChi({
      cauTruc: c,
      dsQuyTac: QUY_TAC,
      coCau: noiTay,
      dich: { nganh: c.ma, truong: c.truongMa, he: c.he, ngay: NGAY },
      soHoSoThang: 3,
    });
    expect(kq.vuotTran).toBe(true);
    expect(kq.conLai).toBeLessThan(0);
  });

  it('trần của quy tắc chặn mức vượt và báo bị chặn', () => {
    // 8% học phí trên một ngành học phí cao: mức chính sách vượt 60% quỹ chi
    const c = { ...ct('DH-DT02-GDMN'), dinhMucKy: 1_800_000 }; // quỹ chi còn 700.000
    const kq = soatTranChi({
      cauTruc: c,
      dsQuyTac: QUY_TAC,
      coCau: CO_CAU_QUY_CHI,
      dich: { nganh: c.ma, truong: c.truongMa, he: c.he, ngay: NGAY },
      soHoSoThang: 3,
    });
    const nv = kq.chi.find((x) => x.ma === 'NV')!;
    expect(nv.mucTruocTran).toBe(800_000);
    expect(nv.soTien).toBe(420_000); // trần 60% × 700.000
    expect(kq.coBiChan).toBe(true);
  });
});
