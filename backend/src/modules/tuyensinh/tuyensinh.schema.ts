import { z } from 'zod';

const NGAY = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải dạng YYYY-MM-DD');

const THANG = z.string().regex(/^\d{4}-\d{2}$/, 'Kỳ lương phải dạng YYYY-MM');

/** Ngày hiệu lực để nạp tham số. Thiếu thì lấy hôm nay. */
export const thamSoQuerySchema = z.object({
  query: z.object({ ngay: NGAY.optional() }),
});
export type ThamSoQuery = z.infer<typeof thamSoQuerySchema>['query'];

export const listHoSoSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    trangThai: z.enum(['CHO_THANH_TOAN', 'DANG_HOC', 'DA_DU_HOC_PHI', 'THOI_HOC']).optional(),
    chuongTrinhMa: z.string().trim().optional(),
    /** Chỉ ADMIN/TP/TN dùng được — soi một cán bộ trong phạm vi của mình */
    nhanSuMa: z.string().trim().optional(),
  }),
});
export type ListHoSoQuery = z.infer<typeof listHoSoSchema>['query'];

export const createHoSoSchema = z.object({
  body: z.object({
    chuongTrinhMa: z.string().trim().min(1, 'Phải chọn chương trình'),
    hoTen: z.string().trim().min(2, 'Họ tên quá ngắn'),
    ngaySinh: NGAY.optional(),
    soCccd: z
      .string()
      .trim()
      .regex(/^\d{9}$|^\d{12}$/, 'Căn cước phải 9 hoặc 12 số'),
    dienThoai: z
      .string()
      .trim()
      .regex(/^0\d{9}$/, 'Điện thoại phải 10 số, bắt đầu bằng 0'),
    email: z.string().trim().email('Email không hợp lệ').or(z.literal('')).default(''),
    diaChi: z.string().trim().default(''),
    trinhDo: z.string().trim().default(''),
    noiCongTac: z.string().trim().default(''),
    ghiChu: z.string().trim().default(''),
    tep: z.array(z.object({ muc: z.string().trim(), ten: z.string().trim() })).default([]),
  }),
});
export type CreateHoSoInput = z.infer<typeof createHoSoSchema>['body'];

/**
 * Ghi nhận thu MỘT kỳ. Không nhận `soTien` từ client: số tiền lấy từ học phí
 * của chương trình trong cơ sở dữ liệu, nếu không client sửa được số tiền.
 * Cũng không nhận `kyThu`: kỳ kế tiếp do máy chủ suy ra.
 */
export const ghiNhanThuSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    soChungTu: z.string().trim().min(1, 'Phải có số chứng từ mới ghi nhận được'),
    taiKhoanId: z.string().uuid('Phải chọn tài khoản nhận tiền'),
    bienLaiTen: z.string().trim().nullable().default(null),
    ngayThu: NGAY.optional(),
  }),
});
export type GhiNhanThuInput = z.infer<typeof ghiNhanThuSchema>['body'];
export type GhiNhanThuParams = z.infer<typeof ghiNhanThuSchema>['params'];

export const listLanThuSchema = z.object({
  query: z.object({
    trangThai: z.enum(['CHO_DOI_SOAT', 'DA_NHAN_TIEN']).optional(),
    truongMa: z.string().trim().optional(),
    chuaCoDot: z.coerce.boolean().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(200),
  }),
});
export type ListLanThuQuery = z.infer<typeof listLanThuSchema>['query'];

export const createDotSchema = z.object({
  body: z.object({
    truongMa: z.string().trim().min(1),
    lanThuIds: z.array(z.string().uuid()).min(1, 'Chọn ít nhất một lần thu để lập đợt'),
    ghiChu: z.string().trim().default(''),
  }),
});
export type CreateDotInput = z.infer<typeof createDotSchema>['body'];

export const nhanTienSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ ngayNhanTien: NGAY.optional() }),
});
export type NhanTienInput = z.infer<typeof nhanTienSchema>['body'];

export const tranChiSchema = z.object({
  query: z.object({
    chuongTrinhMa: z.string().trim().min(1),
    /** Soát ở nhiều bậc số lượng hồ sơ — bậc nào cũng phải nằm trong quỹ chi */
    bac: z.string().trim().default('0,3,6,11'),
    ngay: NGAY.optional(),
  }),
});
export type TranChiQuery = z.infer<typeof tranChiSchema>['query'];

export const kyLuongParamsSchema = z.object({
  params: z.object({ thang: THANG }),
});
export type KyLuongParams = z.infer<typeof kyLuongParamsSchema>['params'];

export const taoTaiKhoanSchema = z.object({
  body: z.object({
    tenChu: z.string().trim().min(2),
    tenNganHang: z.string().trim().min(2),
    bin: z.string().trim().regex(/^\d{6}$/, 'Mã BIN phải đúng 6 số'),
    soTaiKhoan: z.string().trim().min(6).max(30),
  }),
});
export type TaoTaiKhoanInput = z.infer<typeof taoTaiKhoanSchema>['body'];
