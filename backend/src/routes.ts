import { Router } from 'express';
import { authRouter } from './modules/auth/auth.route';
import { healthRouter } from './modules/health/health.route';
import { userRouter } from './modules/users/user.route';

/** Gom route của các module — được mount tại /api */
export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/auth', authRouter);
routes.use('/users', userRouter);
