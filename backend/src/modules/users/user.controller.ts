import type { ParamsDictionary } from 'express-serve-static-core';
import { requireUser } from '../../middlewares/authenticate';
import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess } from '../../utils/response';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput, UserIdParams } from './user.schema';
import { userService } from './user.service';

export const userController = {
  list: asyncHandler<ParamsDictionary, unknown, ListUsersQuery>(async (req, res) => {
    const { items, meta } = await userService.list(req.query);
    sendSuccess(res, items, { meta });
  }),

  getById: asyncHandler<UserIdParams>(async (req, res) => {
    const user = await userService.getById(req.params.id, requireUser(req));
    sendSuccess(res, user);
  }),

  create: asyncHandler<ParamsDictionary, CreateUserInput>(async (req, res) => {
    const user = await userService.create(req.body);
    sendSuccess(res, user, { statusCode: 201, message: 'Tạo người dùng thành công' });
  }),

  update: asyncHandler<UserIdParams, UpdateUserInput>(async (req, res) => {
    const user = await userService.update(req.params.id, req.body);
    sendSuccess(res, user, { message: 'Cập nhật thành công' });
  }),

  remove: asyncHandler<UserIdParams>(async (req, res) => {
    await userService.remove(req.params.id, requireUser(req));
    sendSuccess(res, null, { message: 'Xóa người dùng thành công' });
  }),
};
