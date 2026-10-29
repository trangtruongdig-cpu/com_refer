import { z } from '../../lib/zod';
import { paginationQuerySchema } from '../../utils/pagination';

export const roleSchema = z.enum(['ADMIN', 'USER']).openapi('Role');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email không hợp lệ')
  .max(255)
  .openapi({ example: 'user@example.com' });

// bcrypt chỉ dùng 72 byte đầu nên giới hạn max 72
export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .max(72, 'Mật khẩu tối đa 72 ký tự')
  .openapi({ example: 'Secret@123' });

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Tên không được để trống')
  .max(100)
  .openapi({ example: 'Nguyễn Văn A' });

/** User trả về cho client (không có password) */
export const userResponseSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    role: roleSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('User');

export const userIdParams = z.object({
  id: z.string().uuid('ID không hợp lệ'),
});

export const createUserBody = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    role: roleSchema.default('USER'),
  })
  .openapi('CreateUserInput');

export const updateUserBody = z
  .object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    name: nameSchema.optional(),
    role: roleSchema.optional(),
  })
  .openapi('UpdateUserInput');

export const listUsersQuery = paginationQuerySchema.extend({
  search: z.string().trim().max(100).optional().openapi({ description: 'Tìm theo email hoặc tên' }),
  role: roleSchema.optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema dùng cho middleware validate
export const listUsersSchema = z.object({ query: listUsersQuery });
export const getUserSchema = z.object({ params: userIdParams });
export const createUserSchema = z.object({ body: createUserBody });
export const updateUserSchema = z.object({ params: userIdParams, body: updateUserBody });
export const deleteUserSchema = z.object({ params: userIdParams });

// DTO type lấy từ schema
export type UserIdParams = z.infer<typeof userIdParams>;
export type CreateUserInput = z.infer<typeof createUserBody>;
export type UpdateUserInput = z.infer<typeof updateUserBody>;
export type ListUsersQuery = z.infer<typeof listUsersQuery>;
