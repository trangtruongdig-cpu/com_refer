import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { userController } from './user.controller';
import {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  listUsersSchema,
  updateUserSchema,
} from './user.schema';

export const userRouter = Router();

// Mọi route users đều cần đăng nhập
userRouter.use(authenticate);

userRouter.get('/', authorize('ADMIN'), validate(listUsersSchema), userController.list);
userRouter.post('/', authorize('ADMIN'), validate(createUserSchema), userController.create);
// USER xem được chính mình — kiểm tra trong service
userRouter.get('/:id', validate(getUserSchema), userController.getById);
userRouter.patch('/:id', authorize('ADMIN'), validate(updateUserSchema), userController.update);
userRouter.delete('/:id', authorize('ADMIN'), validate(deleteUserSchema), userController.remove);
