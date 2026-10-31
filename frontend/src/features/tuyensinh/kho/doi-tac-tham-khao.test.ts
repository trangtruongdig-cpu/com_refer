import { beforeEach, describe, expect, it } from 'vitest';
import {
  DANH_BA_DOI_TAC_MAU,
  type DoiTacThamKhao,
} from '../du-lieu/doi-tac-tham-khao';
import { useKho } from './kho.store';

vi.hoisted(() => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  return storage;
});

const doiTacMoi: DoiTacThamKhao = {
  ma: 'TEST-UNIVERSITY',
  ten: 'Trường Đại học Kiểm thử',
  tenNgan: 'ĐH Kiểm thử',
  tinhThanh: 'Hà Nội',
  vung: 'MIEN_BAC',
  website: 'https://example.edu.vn',
  hinhThuc: ['TU_XA'],
  trangThaiHopTac: 'TIEM_NANG',
  nguonUrl: 'https://example.edu.vn/tuyen-sinh',
  nguonTieuDe: 'Thông báo tuyển sinh',
  ngayRaSoat: '2026-10-31',
  ghiChu: 'Nguồn tham khảo.',
};

describe('kho danh bạ đối tác', () => {
  beforeEach(() => {
    localStorage.clear();
    useKho.setState(useKho.getInitialState(), true);
  });

  it('thêm, sửa, lưu trữ và khôi phục đầu mối mà không xóa lịch sử', () => {
    const kho = useKho.getState();
    expect(kho.luuDoiTacThamKhao(doiTacMoi)).toBe(true);

    const banGhi = useKho
      .getState()
      .doiTacThamKhao.find((doiTac) => doiTac.ma === doiTacMoi.ma)!;
    expect(banGhi.id).toBe(doiTacMoi.ma);
    expect(banGhi.hoatDong).toBe(true);

    expect(
      useKho.getState().luuDoiTacThamKhao({
        ...banGhi,
        ten: 'Trường Đại học Kiểm thử đã cập nhật',
      }),
    ).toBe(true);
    expect(
      useKho.getState().doiTacThamKhao.find((doiTac) => doiTac.ma === doiTacMoi.ma)?.ten,
    ).toBe('Trường Đại học Kiểm thử đã cập nhật');

    useKho.getState().luuTruDoiTacThamKhao(doiTacMoi.ma);
    const daLuuTru = useKho
      .getState()
      .doiTacThamKhao.find((doiTac) => doiTac.ma === doiTacMoi.ma)!;
    expect(daLuuTru.hoatDong).toBe(false);
    expect(daLuuTru.archivedAt).toEqual(expect.any(String));

    useKho.getState().khoiPhucDoiTacThamKhao(doiTacMoi.ma);
    const daKhoiPhuc = useKho
      .getState()
      .doiTacThamKhao.find((doiTac) => doiTac.ma === doiTacMoi.ma)!;
    expect(daKhoiPhuc.hoatDong).toBe(true);
    expect(daKhoiPhuc.archivedAt).toBeNull();
  });

  it('từ chối mã trùng và dữ liệu thiếu nguồn', () => {
    const coSan = useKho.getState().doiTacThamKhao[0]!;
    expect(useKho.getState().luuDoiTacThamKhao({ ...doiTacMoi, ma: coSan.ma })).toBe(false);
    expect(
      useKho.getState().luuDoiTacThamKhao({ ...doiTacMoi, ma: 'MISSING-SOURCE', nguonUrl: '' }),
    ).toBe(false);
  });

  it('cập nhật seed mặc định cũ, giữ lưu trữ, bản admin đã sửa và đầu mối tự thêm', async () => {
    const truongMacDinhLuuTru = {
      ma: 'TNU-EB',
      ten: 'Tên cũ của seed',
      tinhThanh: 'Thái Nguyên',
      vung: 'MIEN_BAC',
      website: 'https://tnu.edu.vn',
      hinhThuc: [],
      trangThaiHopTac: 'TIEM_NANG',
      nguonUrl: 'https://tnu.edu.vn/cu',
      nguonTieuDe: 'Nguồn seed cũ',
      ngayRaSoat: '2026-10-31',
      ghiChu: 'Ghi chú seed cũ',
      hoatDong: false,
      archivedAt: '2026-10-30T10:00:00.000Z',
    };
    const truongAdminDaSua = {
      ...DANH_BA_DOI_TAC_MAU.find((doiTac) => doiTac.ma === 'FTU')!,
      id: 'admin-edited-ftu',
      ten: 'Tên trường đã được admin chỉnh',
      nguonUrl: 'https://example.edu.vn/admin-source',
      nguonTieuDe: 'Nguồn admin đã thay',
      hinhThuc: ['THUONG_XUYEN'],
      hoatDong: false,
      archivedAt: '2026-10-29T10:00:00.000Z',
    };
    const truongTuyChinh = {
      ...doiTacMoi,
      id: 'custom-university',
      ma: 'CUSTOM-UNIVERSITY',
    };

    localStorage.setItem(
      'phoenix-tuyensinh-demo',
      JSON.stringify({
        state: {
          doiTacThamKhao: [truongMacDinhLuuTru, truongAdminDaSua, truongTuyChinh],
        },
        version: 1,
      }),
    );
    await useKho.persist.rehydrate();

    const danhBa = useKho.getState().doiTacThamKhao;
    expect(danhBa.find((doiTac) => doiTac.ma === 'TNU-EB')).toMatchObject({
      ...DANH_BA_DOI_TAC_MAU.find((doiTac) => doiTac.ma === 'TNU-EB'),
      hoatDong: false,
      archivedAt: '2026-10-30T10:00:00.000Z',
    });
    expect(danhBa.find((doiTac) => doiTac.ma === 'FTU')).toMatchObject(truongAdminDaSua);
    expect(danhBa.find((doiTac) => doiTac.ma === truongTuyChinh.ma)).toMatchObject(truongTuyChinh);
    expect(DANH_BA_DOI_TAC_MAU.every((mau) => danhBa.some((doiTac) => doiTac.ma === mau.ma))).toBe(
      true,
    );
  });
});
