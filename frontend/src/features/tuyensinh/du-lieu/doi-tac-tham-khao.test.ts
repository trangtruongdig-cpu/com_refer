import { describe, expect, it } from 'vitest';
import { DANH_BA_DOI_TAC_MAU } from './doi-tac-tham-khao';

describe('DANH_BA_DOI_TAC_MAU', () => {
  it('khớp bộ mã 148 đầu mối của backend và giữ mã duy nhất', () => {
    const ma = DANH_BA_DOI_TAC_MAU.map((doiTac) => doiTac.ma);

    expect(DANH_BA_DOI_TAC_MAU).toHaveLength(148);
    expect(new Set(ma).size).toBe(ma.length);
    expect(new Set(ma)).toEqual(
      new Set([
        'UDN',
        'HUE',
        'HUET',
        'UED',
        'HUFLIS',
        'VINH',
        'QNU',
        'NTU',
        'DLU',
        'PDU',
        'HTU',
        'PYU',
        'UKH',
        'QBU',
        'DTU',
        'DONGA',
        'OUM-HCM',
        'UEL',
        'HUTECH',
        'VLUTE',
        'DNU',
        'HCMUT',
        'IUH',
        'UEH',
        'HUB',
        'HCMUTE',
        'TDMU',
        'DNTU',
        'CTU',
        'DTHU',
        'AGU',
        'NCTU',
        'MKU',
        'KGU',
        'DLA',
        'TVU',
        'VHU',
        'TNU',
        'TNU-EDU',
        'TNU-UTE',
        'TNU-AF',
        'TNU-MED',
        'TNU-EB',
        'TNU-SCI',
        'TNU-ICT',
        'HVTC',
        'HONGDUC',
        'UTC',
        'HNUE',
        'UHL',
        'UTB',
        'HUCE',
        'HVU',
        'HOU',
        'HAUI',
        'HDIU',
        'DHCD',
        'HUPH',
        'PTIT',
        'NEU',
        'FTU',
        'THANHDO',
        'VNU-LAW',
        'TMU',
        'VNU-HN',
        'VNU-HUS',
        'VNU-USSH',
        'VNU-ULIS',
        'VNU-UET',
        'VNU-UEB',
        'VNU-UED',
        'VNU-VJU',
        'VNU-UMP',
        'VNU-HCM',
        'VNUHCM-HUS',
        'VNUHCM-USSH',
        'VNUHCM-IU',
        'VNUHCM-UIT',
        'VNUHCM-UHS',
        'UDN-DUT',
        'UDN-DUE',
        'UDN-UFL',
        'UDN-UTE',
        'UDN-VKU',
        'HUE-LAW',
        'HUE-HCE',
        'HUE-HUAF',
        'HUE-ARTS',
        'HUE-EDU',
        'HUE-HUSC',
        'HUE-HUMED',
        'TBU',
        'TANTRAO',
        'HPU',
        'UHD',
        'HOALU',
        'TTN',
        'TGU',
        'SP2',
        'SGU',
        'DKY',
        'YCT',
        'DBL',
        'DQU',
        'VNUA',
        'HCMUE',
        'TTU',
        'DLX',
        'HNMU',
        'THANHDONG',
        'BAFU',
        'VNUF',
        'VHB',
        'TUETECH',
        'UNETI',
        'UTT',
        'QUI',
        'DAINAM',
        'HUBT',
        'UFM',
        'TDU',
        'NDUN',
        'AJC',
        'HAU',
        'MIT',
        'BDU',
        'UPT',
        'TNU-FL',
        'VUI',
        'TLU',
        'HUNRE',
        'HANU',
        'SKDA',
        'HICT',
        'SDU',
        'HPMU',
        'NAU',
        'TBUMP',
        'LTVU',
        'UTH',
        'HSU',
        'HIU',
        'GDU',
        'HUST',
        'EPU',
        'VMU',
        'VUTED',
        'UTEHY',
      ]),
    );
    for (const doiTac of DANH_BA_DOI_TAC_MAU) {
      expect(doiTac.ten.trim()).not.toBe('');
      expect(doiTac.nguonTieuDe.trim()).not.toBe('');
      expect(new URL(doiTac.nguonUrl).protocol).toBe('https:');
    }
  });

  it('không suy diễn hình thức cho 24 đơn vị chỉ được xác nhận qua roster chính thức', () => {
    const maDonViChiXacNhanDanhTinh = new Set([
      'VNU-HN',
      'VNU-HUS',
      'VNU-UET',
      'VNU-UEB',
      'VNU-UED',
      'VNU-VJU',
      'VNU-UMP',
      'VNU-HCM',
      'VNUHCM-USSH',
      'VNUHCM-IU',
      'VNUHCM-UIT',
      'VNUHCM-UHS',
      'UDN-DUT',
      'UDN-DUE',
      'UDN-UFL',
      'UDN-UTE',
      'UDN-VKU',
      'HUE-LAW',
      'HUE-HCE',
      'HUE-HUAF',
      'HUE-ARTS',
      'HUE-EDU',
      'HUE-HUSC',
      'HUE-HUMED',
    ]);
    const donViChiXacNhanDanhTinh = DANH_BA_DOI_TAC_MAU.filter((doiTac) =>
      maDonViChiXacNhanDanhTinh.has(doiTac.ma),
    );

    expect(donViChiXacNhanDanhTinh).toHaveLength(24);
    expect(new Set(donViChiXacNhanDanhTinh.map((doiTac) => doiTac.ma))).toEqual(
      maDonViChiXacNhanDanhTinh,
    );
    expect(
      donViChiXacNhanDanhTinh.every((doiTac) => doiTac.hinhThuc.length === 0),
    ).toBe(true);
  });

  it('giữ 12 đầu mối mới ở trạng thái tiềm năng và giới hạn theo đúng nguồn', () => {
    const maMoi = new Set([
      'TTN',
      'TGU',
      'SP2',
      'SGU',
      'DKY',
      'YCT',
      'DBL',
      'DQU',
      'VNUA',
      'HCMUE',
      'TTU',
      'DLX',
    ]);
    const dauMoiMoi = DANH_BA_DOI_TAC_MAU.filter((doiTac) => maMoi.has(doiTac.ma));
    const theoMa = new Map(dauMoiMoi.map((doiTac) => [doiTac.ma, doiTac]));

    expect(dauMoiMoi).toHaveLength(12);
    expect(dauMoiMoi.every((doiTac) => doiTac.trangThaiHopTac === 'TIEM_NANG')).toBe(true);
    expect(
      dauMoiMoi.every((doiTac) => doiTac.nguonUrl.startsWith('https://')),
    ).toBe(true);
    expect(theoMa.get('TTN')?.hinhThuc).toEqual(['VUA_LAM_VUA_HOC']);
    expect(theoMa.get('TGU')?.hinhThuc).toEqual(['TU_XA', 'THUONG_XUYEN', 'LIEN_KET']);
    expect(theoMa.get('TTU')?.hinhThuc).toEqual(['TU_XA', 'VAN_BANG_2']);
    expect(theoMa.get('TTU')?.ghiChu).toContain('05/11/2026');
    expect(theoMa.get('VNUA')?.ghiChu).toContain('31/07/2026');
    expect(theoMa.get('SP2')?.ghiChu).toContain('16/10/2026');
    expect(theoMa.get('DQU')?.ghiChu).toContain('2024');
    expect(theoMa.get('YCT')?.hinhThuc).toEqual(['LIEN_THONG', 'VAN_BANG_2']);
    expect(theoMa.get('DBL')?.hinhThuc).toEqual([
      'VUA_LAM_VUA_HOC',
      'TU_XA',
      'LIEN_THONG',
    ]);
    expect(theoMa.get('DQU')?.hinhThuc).toEqual([]);
  });

  it('cập nhật bằng chứng 2026 cho các trường thành viên nhưng không suy rộng chương trình', () => {
    const theoMa = new Map(DANH_BA_DOI_TAC_MAU.map((doiTac) => [doiTac.ma, doiTac]));

    expect(theoMa.get('VNU-USSH')).toMatchObject({
      hinhThuc: ['VUA_LAM_VUA_HOC', 'THUONG_XUYEN'],
      ghiChu: expect.stringContaining('31/08/2026'),
    });
    expect(theoMa.get('VNU-ULIS')).toMatchObject({
      hinhThuc: ['VUA_LAM_VUA_HOC', 'VAN_BANG_2'],
      ghiChu: expect.stringContaining('20/08/2026'),
    });
    expect(theoMa.get('VNUHCM-HUS')).toMatchObject({
      hinhThuc: ['TU_XA'],
      nguonTieuDe: expect.stringContaining('đợt 2'),
    });
    expect(theoMa.get('HCMUTE')).toMatchObject({
      ten: 'Trường Đại học Công nghệ Kỹ thuật Thành phố Hồ Chí Minh',
      hinhThuc: ['VUA_LAM_VUA_HOC'],
      nguonTieuDe: expect.stringContaining('2026'),
    });
    expect(theoMa.get('TDMU')?.ghiChu).toContain('tệp đính kèm');
    expect(theoMa.get('TDMU')?.ghiChu).not.toContain('30/11/2026');
    expect(theoMa.get('TDMU')?.hinhThuc).toEqual(['TU_XA', 'VAN_BANG_2']);
    expect(theoMa.get('HCMUE')?.hinhThuc).toEqual(['VUA_LAM_VUA_HOC', 'THUONG_XUYEN']);
  });

  it('chỉ gán hình thức cho thành viên Đại học Thái Nguyên có nguồn riêng', () => {
    const truongThanhVien = DANH_BA_DOI_TAC_MAU.filter((doiTac) =>
      doiTac.ma.startsWith('TNU-'),
    );

    expect(truongThanhVien).toHaveLength(8);
    for (const ma of ['TNU-EDU', 'TNU-UTE', 'TNU-MED', 'TNU-ICT']) {
      expect(truongThanhVien.find((doiTac) => doiTac.ma === ma)?.hinhThuc).toEqual([]);
    }
    expect(truongThanhVien.find((doiTac) => doiTac.ma === 'TNU-AF')?.hinhThuc).toEqual([
      'TU_XA',
    ]);
    expect(truongThanhVien.find((doiTac) => doiTac.ma === 'TNU-EB')?.hinhThuc).toEqual([
      'TU_XA',
      'LIEN_THONG',
      'VAN_BANG_2',
    ]);
    expect(truongThanhVien.find((doiTac) => doiTac.ma === 'TNU-SCI')?.hinhThuc).toEqual([
      'VUA_LAM_VUA_HOC',
      'LIEN_THONG',
      'VAN_BANG_2',
    ]);
    expect(truongThanhVien.find((doiTac) => doiTac.ma === 'TNU-FL')?.hinhThuc).toEqual([
      'TU_XA',
      'VAN_BANG_2',
    ]);
  });

  it('adds 20 source-backed leads as potential only and records expired or unclear intake windows', () => {
    const maMoi = new Set([
      'HNMU',
      'THANHDONG',
      'BAFU',
      'VNUF',
      'VHB',
      'TUETECH',
      'UNETI',
      'UTT',
      'QUI',
      'DAINAM',
      'HUBT',
      'UFM',
      'TDU',
      'NDUN',
      'AJC',
      'HAU',
      'MIT',
      'BDU',
      'UPT',
      'TNU-FL',
    ]);
    const dauMoiMoi = DANH_BA_DOI_TAC_MAU.filter((doiTac) => maMoi.has(doiTac.ma));
    const theoMa = new Map(dauMoiMoi.map((doiTac) => [doiTac.ma, doiTac]));

    expect(dauMoiMoi).toHaveLength(20);
    expect(dauMoiMoi.every((doiTac) => doiTac.trangThaiHopTac === 'TIEM_NANG')).toBe(true);
    expect(dauMoiMoi.every((doiTac) => doiTac.ghiChu?.includes('Phoenix'))).toBe(true);
    expect(theoMa.get('HNMU')?.ghiChu).toContain('06/11/2026');
    expect(theoMa.get('BAFU')?.ghiChu).toContain('20/02/2026');
    expect(theoMa.get('TUETECH')?.hinhThuc).toEqual(['TU_XA']);
    expect(theoMa.get('UTT')?.hinhThuc).toEqual(['TU_XA', 'VAN_BANG_2']);
    expect(theoMa.get('UTT')?.ghiChu).toContain('10/12/2026');
    expect(theoMa.get('NDUN')?.ghiChu).toContain('cohort đã qua');
    expect(theoMa.get('UPT')?.ghiChu).toContain('không nêu cohort/hạn 2026');
    expect(theoMa.get('TNU-FL')?.hinhThuc).toEqual(['TU_XA', 'VAN_BANG_2']);
  });

  it('adds 20 more source-backed leads while preserving evidence scope and cohort status', () => {
    const maMoi = new Set([
      'VUI',
      'TLU',
      'HUNRE',
      'HANU',
      'SKDA',
      'HICT',
      'SDU',
      'HPMU',
      'NAU',
      'TBUMP',
      'LTVU',
      'UTH',
      'HSU',
      'HIU',
      'GDU',
      'HUST',
      'EPU',
      'VMU',
      'VUTED',
      'UTEHY',
    ]);
    const dauMoi = DANH_BA_DOI_TAC_MAU.filter((doiTac) => maMoi.has(doiTac.ma));
    const theoMa = new Map(dauMoi.map((doiTac) => [doiTac.ma, doiTac]));

    expect(dauMoi).toHaveLength(20);
    expect(dauMoi.every((doiTac) => doiTac.trangThaiHopTac === 'TIEM_NANG')).toBe(true);
    expect(dauMoi.every((doiTac) => doiTac.ghiChu?.includes('Phoenix'))).toBe(true);
    expect(theoMa.get('HSU')?.ghiChu).toContain('28/12/2026');
    expect(theoMa.get('TLU')?.ghiChu).toContain('30/07/2026');
    expect(theoMa.get('TBUMP')?.ghiChu).toContain('ngành sức khỏe');
    expect(theoMa.get('GDU')?.hinhThuc).toEqual(['VUA_LAM_VUA_HOC']);
    expect(theoMa.get('UTEHY')?.hinhThuc).toEqual(['THUONG_XUYEN']);
    expect(theoMa.get('UTEHY')?.ghiChu).toContain('thuộc năm 2025');
  });

  it('giữ tên hiện hành của TVU và dữ liệu có nguồn riêng của HaUI', () => {
    expect(DANH_BA_DOI_TAC_MAU.find((doiTac) => doiTac.ma === 'TVU')).toMatchObject({
      ten: 'Đại học Trà Vinh',
      nguonTieuDe: 'Trường Đại học Trà Vinh trở thành Đại học Trà Vinh',
      ghiChu: expect.stringContaining('Quyết định 73/QĐ-TTg ngày 12/01/2026'),
    });
    expect(DANH_BA_DOI_TAC_MAU.find((doiTac) => doiTac.ma === 'HAUI')).toMatchObject({
      ten: 'Trường Đại học Công nghiệp Hà Nội',
      hinhThuc: ['TU_XA'],
      nguonTieuDe: 'Tuyển sinh đại học từ xa đợt 7 năm 2026: Quản trị kinh doanh và Marketing',
      ghiChu: expect.stringContaining('06/10 đến 12/11/2026'),
    });
  });
});
