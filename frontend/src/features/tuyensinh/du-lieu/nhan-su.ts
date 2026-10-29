/**
 * Cây tổ chức ĐÚNG BA CẤP, không có tầng thứ tư (LOGIC.md §4).
 *
 *            PHÒNG KINH DOANH  (TP)
 *                    │
 *        ┌───────────┴───────────┐
 *      NHÓM A (TN)           NHÓM B (TN)
 *        │                       │
 *   ┌────┴────┐             ┌────┴────┐
 *  NV01     NV02           NV03     NV04
 *
 * Ở cơ sở dữ liệu, ba cấp được chặn bằng `CHECK` trên `don_vi` cộng trigger
 * `trg_don_vi_chan_tang_4`. Thù lao TN/TP gắn với PHẠM VI PHỤ TRÁCH, không gắn
 * với số người — đây là khác biệt bản chất với đa cấp.
 */

export type VaiTro = 'NV' | 'TN' | 'TP' | 'ADMIN';

export const TEN_VAI_TRO: Record<VaiTro, string> = {
  NV: 'Cán bộ tuyển sinh',
  TN: 'Trưởng nhóm',
  TP: 'Trưởng phòng',
  ADMIN: 'Quản trị hệ thống',
};

export interface NhanSu {
  readonly id: string;
  readonly hoTen: string;
  readonly vaiTro: VaiTro;
  readonly nhom: string;
  readonly phong: string;
}

export const NHAN_SU: readonly NhanSu[] = [
  { id: 'NV01', hoTen: 'Nguyễn Thị Hương', vaiTro: 'NV', nhom: 'Nhóm A', phong: 'Phòng Kinh doanh' },
  { id: 'NV02', hoTen: 'Trần Văn Khánh', vaiTro: 'NV', nhom: 'Nhóm A', phong: 'Phòng Kinh doanh' },
  { id: 'NV03', hoTen: 'Lê Minh Anh', vaiTro: 'NV', nhom: 'Nhóm B', phong: 'Phòng Kinh doanh' },
  { id: 'TN01', hoTen: 'Phạm Quốc Dũng', vaiTro: 'TN', nhom: 'Nhóm A', phong: 'Phòng Kinh doanh' },
  { id: 'TP01', hoTen: 'Vũ Hải Yến', vaiTro: 'TP', nhom: 'Toàn phòng', phong: 'Phòng Kinh doanh' },
  { id: 'AD01', hoTen: 'Quản trị Trường', vaiTro: 'ADMIN', nhom: 'Toàn Trường', phong: 'Ban Giám hiệu' },
];

export const timNhanSu = (id: string): NhanSu | undefined => NHAN_SU.find((n) => n.id === id);

/** Nhân sự thuộc phạm vi phụ trách của một người — quyết định quyền xem. */
export function phamViPhuTrach(nguoi: NhanSu): readonly string[] {
  if (nguoi.vaiTro === 'NV') return [nguoi.id];
  if (nguoi.vaiTro === 'TN') {
    return NHAN_SU.filter((n) => n.vaiTro === 'NV' && n.nhom === nguoi.nhom).map((n) => n.id);
  }
  return NHAN_SU.filter((n) => n.vaiTro === 'NV').map((n) => n.id);
}
