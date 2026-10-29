import { z } from '../../lib/zod';
import { emailSchema, nameSchema, passwordSchema, userResponseSchema } from '../users/user.schema';

export const registerBody = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
  })
  .openapi('RegisterInput');

export const loginBody = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Vui lòng nhập mật khẩu').openapi({ example: 'Secret@123' }),
  })
  .openapi('LoginInput');

export const authResponseSchema = z
  .object({
    accessToken: z.string(),
    user: userResponseSchema,
  })
  .openapi('AuthResponse');

export const registerSchema = z.object({ body: registerBody });
export const loginSchema = z.object({ body: loginBody });

export type RegisterInput = z.infer<typeof registerBody>;
export type LoginInput = z.infer<typeof loginBody>;
