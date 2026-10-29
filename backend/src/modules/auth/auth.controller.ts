import type { CookieOptions, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { env, isProduction } from '../../config/env';
import { requireUser } from '../../middlewares/authenticate';
import { UnauthorizedError } from '../../utils/app-error';
import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess } from '../../utils/response';
import type { LoginInput, RegisterInput } from './auth.schema';
import { authService, type AuthResult } from './auth.service';

export const REFRESH_COOKIE_NAME = 'refresh_token';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // app.example.com và api.example.com cùng "site" nên strict vẫn gửi được cookie
  sameSite: 'strict',
  path: '/api/auth',
  domain: env.COOKIE_DOMAIN,
};

function setRefreshCookie(res: Response, result: AuthResult): void {
  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
    ...baseCookieOptions,
    expires: result.refreshTokenExpiresAt,
  });
}

function readRefreshCookie(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, string | undefined>;
  return cookies[REFRESH_COOKIE_NAME];
}

function toResponse(result: AuthResult): { accessToken: string; user: AuthResult['user'] } {
  return { accessToken: result.accessToken, user: result.user };
}

export const authController = {
  register: asyncHandler<ParamsDictionary, RegisterInput>(async (req, res) => {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result);
    sendSuccess(res, toResponse(result), { statusCode: 201, message: 'Đăng ký thành công' });
  }),

  login: asyncHandler<ParamsDictionary, LoginInput>(async (req, res) => {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result);
    sendSuccess(res, toResponse(result), { message: 'Đăng nhập thành công' });
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = readRefreshCookie(req);
    if (!token) {
      throw new UnauthorizedError('Thiếu refresh token', 'MISSING_REFRESH_TOKEN');
    }
    try {
      const result = await authService.refresh(token);
      setRefreshCookie(res, result);
      sendSuccess(res, toResponse(result));
    } catch (error) {
      res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
      throw error;
    }
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(readRefreshCookie(req));
    res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
    sendSuccess(res, null, { message: 'Đăng xuất thành công' });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(requireUser(req).id);
    sendSuccess(res, user);
  }),
};
