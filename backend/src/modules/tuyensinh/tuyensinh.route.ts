import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { validate } from '../../middlewares/validate';
import { tuyenSinhController } from './tuyensinh.controller';
import {
  createDotSchema,
  createHoSoSchema,
  ghiNhanThuSchema,
  kyLuongParamsSchema,
  listHoSoSchema,
  listLanThuSchema,
  nhanTienSchema,
  taoTaiKhoanSchema,
  thamSoQuerySchema,
  tranChiSchema,
} from './tuyensinh.schema';

export const tuyenSinhRouter = Router();

// Mọi route tuyển sinh đều cần đăng nhập. Quyền chi tiết theo VAI TRÒ NGHIỆP VỤ
// (NV/TN/TP/ADMIN) được soát trong service, vì nó phụ thuộc phạm vi phụ trách
// chứ không chỉ phụ thuộc role của tài khoản.
tuyenSinhRouter.use(authenticate);

tuyenSinhRouter.get('/toi-la', tuyenSinhController.toiLa);
tuyenSinhRouter.get('/nhan-su', tuyenSinhController.nhanSu);
tuyenSinhRouter.get('/tong-quan', tuyenSinhController.tongQuan);

tuyenSinhRouter.get('/danh-muc', tuyenSinhController.danhMuc);
tuyenSinhRouter.get('/tham-so', validate(thamSoQuerySchema), tuyenSinhController.thamSo);
tuyenSinhRouter.get('/co-cau', validate(tranChiSchema), tuyenSinhController.coCau);
tuyenSinhRouter.get('/tran-chi', validate(tranChiSchema), tuyenSinhController.tranChi);

tuyenSinhRouter.get('/ho-so', validate(listHoSoSchema), tuyenSinhController.listHoSo);
tuyenSinhRouter.post('/ho-so', validate(createHoSoSchema), tuyenSinhController.taoHoSo);
tuyenSinhRouter.post(
  '/ho-so/:id/lan-thu',
  validate(ghiNhanThuSchema),
  tuyenSinhController.ghiNhanThu,
);

tuyenSinhRouter.get('/lan-thu', validate(listLanThuSchema), tuyenSinhController.listLanThu);

tuyenSinhRouter.get('/dot-doi-soat', tuyenSinhController.listDot);
tuyenSinhRouter.post('/dot-doi-soat', validate(createDotSchema), tuyenSinhController.taoDot);
tuyenSinhRouter.post(
  '/dot-doi-soat/:id/nhan-tien',
  validate(nhanTienSchema),
  tuyenSinhController.nhanTien,
);

tuyenSinhRouter.get('/tai-khoan', tuyenSinhController.taiKhoans);
tuyenSinhRouter.post('/tai-khoan', validate(taoTaiKhoanSchema), tuyenSinhController.taoTaiKhoan);

tuyenSinhRouter.get('/ky-luong', tuyenSinhController.listKyLuong);
tuyenSinhRouter.get('/ky-luong/:thang', validate(kyLuongParamsSchema), tuyenSinhController.xemKyLuong);
tuyenSinhRouter.post(
  '/ky-luong/:thang/tinh',
  validate(kyLuongParamsSchema),
  tuyenSinhController.tinhKyLuong,
);
tuyenSinhRouter.post(
  '/ky-luong/:thang/chot',
  validate(kyLuongParamsSchema),
  tuyenSinhController.chotKyLuong,
);
