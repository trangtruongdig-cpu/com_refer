import type { ParamsDictionary } from 'express-serve-static-core';
import { requireUser } from '../../middlewares/authenticate';
import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess } from '../../utils/response';
import type {
  CreateDotInput,
  CreateHoSoInput,
  GhiNhanThuInput,
  GhiNhanThuParams,
  KyLuongParams,
  ListHoSoQuery,
  ListLanThuQuery,
  NhanTienInput,
  TaoTaiKhoanInput,
  ThamSoQuery,
  TranChiQuery,
} from './tuyensinh.schema';
import { tuyenSinhService } from './tuyensinh.service';

export const tuyenSinhController = {
  toiLa: asyncHandler(async (req, res) => {
    sendSuccess(res, await tuyenSinhService.toiLa(requireUser(req)));
  }),

  nhanSu: asyncHandler(async (req, res) => {
    sendSuccess(res, await tuyenSinhService.nhanSu(requireUser(req)));
  }),

  tongQuan: asyncHandler(async (req, res) => {
    sendSuccess(res, await tuyenSinhService.tongQuan(requireUser(req)));
  }),

  danhMuc: asyncHandler(async (_req, res) => {
    sendSuccess(res, await tuyenSinhService.danhMuc());
  }),

  thamSo: asyncHandler<ParamsDictionary, unknown, ThamSoQuery>(async (req, res) => {
    sendSuccess(res, await tuyenSinhService.thamSo(req.query.ngay));
  }),

  coCau: asyncHandler<ParamsDictionary, unknown, TranChiQuery>(async (req, res) => {
    sendSuccess(
      res,
      await tuyenSinhService.coCauCuaChuongTrinh(req.query.chuongTrinhMa, req.query.ngay),
    );
  }),

  tranChi: asyncHandler<ParamsDictionary, unknown, TranChiQuery>(async (req, res) => {
    sendSuccess(res, await tuyenSinhService.tranChi(req.query));
  }),

  listHoSo: asyncHandler<ParamsDictionary, unknown, ListHoSoQuery>(async (req, res) => {
    const { items, meta } = await tuyenSinhService.listHoSo(requireUser(req), req.query);
    sendSuccess(res, items, { meta });
  }),

  taoHoSo: asyncHandler<ParamsDictionary, CreateHoSoInput>(async (req, res) => {
    const hs = await tuyenSinhService.taoHoSo(requireUser(req), req.body);
    sendSuccess(res, hs, { statusCode: 201, message: `Đã lưu hồ sơ ${hs.ma}` });
  }),

  ghiNhanThu: asyncHandler<GhiNhanThuParams, GhiNhanThuInput>(async (req, res) => {
    const lt = await tuyenSinhService.ghiNhanThu(requireUser(req), req.params.id, req.body);
    sendSuccess(res, lt, { statusCode: 201, message: `Đã ghi nhận thu kỳ ${lt.kyThu}` });
  }),

  listLanThu: asyncHandler<ParamsDictionary, unknown, ListLanThuQuery>(async (req, res) => {
    sendSuccess(res, await tuyenSinhService.listLanThu(requireUser(req), req.query));
  }),

  listDot: asyncHandler(async (_req, res) => {
    sendSuccess(res, await tuyenSinhService.listDot());
  }),

  taoDot: asyncHandler<ParamsDictionary, CreateDotInput>(async (req, res) => {
    const d = await tuyenSinhService.taoDot(requireUser(req), req.body);
    sendSuccess(res, d, { statusCode: 201, message: d.ghiChu });
  }),

  nhanTien: asyncHandler<{ id: string }, NhanTienInput>(async (req, res) => {
    const d = await tuyenSinhService.nhanTien(
      requireUser(req),
      req.params.id,
      req.body.ngayNhanTien,
    );
    sendSuccess(res, d, { message: d.ghiChu });
  }),

  taiKhoans: asyncHandler(async (_req, res) => {
    sendSuccess(res, await tuyenSinhService.taiKhoans());
  }),

  taoTaiKhoan: asyncHandler<ParamsDictionary, TaoTaiKhoanInput>(async (req, res) => {
    const t = await tuyenSinhService.taoTaiKhoan(requireUser(req), req.body);
    sendSuccess(res, t, { statusCode: 201, message: 'Đã thêm tài khoản nhận tiền' });
  }),

  listKyLuong: asyncHandler(async (_req, res) => {
    sendSuccess(res, await tuyenSinhService.listKyLuong());
  }),

  xemKyLuong: asyncHandler<KyLuongParams>(async (req, res) => {
    sendSuccess(res, await tuyenSinhService.xemKyLuong(req.params.thang));
  }),

  tinhKyLuong: asyncHandler<KyLuongParams>(async (req, res) => {
    const ky = await tuyenSinhService.tinhKyLuong(requireUser(req), req.params.thang);
    sendSuccess(res, ky, { message: `Đã tính kỳ lương ${req.params.thang}` });
  }),

  chotKyLuong: asyncHandler<KyLuongParams>(async (req, res) => {
    const ky = await tuyenSinhService.chotKyLuong(requireUser(req), req.params.thang);
    sendSuccess(res, ky, {
      message: `Đã chốt kỳ lương ${req.params.thang}. Kỳ đã chốt không sửa được.`,
    });
  }),
};
