import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  type ResponseConfig,
} from '@asteasolutions/zod-to-openapi';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { z } from '../lib/zod';
import { authResponseSchema, loginBody, registerBody } from '../modules/auth/auth.schema';
import {
  createUserBody,
  listUsersQuery,
  updateUserBody,
  userIdParams,
  userResponseSchema,
} from '../modules/users/user.schema';
import { paginationMetaSchema } from '../utils/pagination';

const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});
const security = [{ [bearerAuth.name]: [] }];

// ----- Envelope chuẩn -----
const errorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    success: z.literal(false),
    data: z.null(),
    message: z.string(),
    error: z.object({ code: z.string(), details: z.unknown().optional() }),
  }),
);

function successSchema<T extends z.ZodTypeAny>(data: T, withMeta = false) {
  return z.object({
    success: z.literal(true),
    data,
    message: z.string().optional(),
    ...(withMeta ? { meta: paginationMetaSchema } : {}),
  });
}

function json(description: string, schema: z.ZodTypeAny): ResponseConfig {
  return { description, content: { 'application/json': { schema } } };
}

const errors = {
  401: json('Chưa xác thực', errorResponseSchema),
  403: json('Không có quyền', errorResponseSchema),
  404: json('Không tìm thấy', errorResponseSchema),
  409: json('Dữ liệu bị trùng', errorResponseSchema),
  422: json('Dữ liệu không hợp lệ', errorResponseSchema),
} satisfies Record<number, ResponseConfig>;

// ----- Health -----
registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Kiểm tra trạng thái server và kết nối database',
  responses: {
    200: json(
      'OK',
      successSchema(
        z.object({
          status: z.enum(['ok', 'error']),
          database: z.enum(['up', 'down']),
          uptime: z.number(),
          timestamp: z.string(),
        }),
      ),
    ),
    503: json('Database không khả dụng', errorResponseSchema),
  },
});

// ----- Auth -----
registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Đăng ký tài khoản (set cookie refresh_token)',
  request: { body: { content: { 'application/json': { schema: registerBody } } } },
  responses: {
    201: json('Đăng ký thành công', successSchema(authResponseSchema)),
    409: errors[409],
    422: errors[422],
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Đăng nhập (set cookie refresh_token)',
  request: { body: { content: { 'application/json': { schema: loginBody } } } },
  responses: {
    200: json('Đăng nhập thành công', successSchema(authResponseSchema)),
    401: errors[401],
    422: errors[422],
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Cấp access token mới từ cookie refresh_token (xoay vòng refresh token)',
  responses: {
    200: json('Thành công', successSchema(authResponseSchema)),
    401: errors[401],
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Đăng xuất, thu hồi refresh token',
  responses: { 200: json('Thành công', successSchema(z.null())) },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Thông tin người dùng hiện tại',
  security,
  responses: {
    200: json('Thành công', successSchema(userResponseSchema)),
    401: errors[401],
  },
});

// ----- Users -----
registry.registerPath({
  method: 'get',
  path: '/users',
  tags: ['Users'],
  summary: 'Danh sách người dùng (ADMIN) — phân trang, tìm kiếm, sắp xếp',
  security,
  request: { query: listUsersQuery },
  responses: {
    200: json('Thành công', successSchema(z.array(userResponseSchema), true)),
    401: errors[401],
    403: errors[403],
  },
});

registry.registerPath({
  method: 'post',
  path: '/users',
  tags: ['Users'],
  summary: 'Tạo người dùng (ADMIN)',
  security,
  request: { body: { content: { 'application/json': { schema: createUserBody } } } },
  responses: {
    201: json('Tạo thành công', successSchema(userResponseSchema)),
    401: errors[401],
    403: errors[403],
    409: errors[409],
    422: errors[422],
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Chi tiết người dùng (ADMIN hoặc chính mình)',
  security,
  request: { params: userIdParams },
  responses: {
    200: json('Thành công', successSchema(userResponseSchema)),
    401: errors[401],
    403: errors[403],
    404: errors[404],
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Cập nhật người dùng (ADMIN)',
  security,
  request: {
    params: userIdParams,
    body: { content: { 'application/json': { schema: updateUserBody } } },
  },
  responses: {
    200: json('Thành công', successSchema(userResponseSchema)),
    401: errors[401],
    403: errors[403],
    404: errors[404],
    409: errors[409],
    422: errors[422],
  },
});

registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Xóa người dùng (ADMIN)',
  security,
  request: { params: userIdParams },
  responses: {
    200: json('Thành công', successSchema(z.null())),
    401: errors[401],
    403: errors[403],
    404: errors[404],
  },
});

export function generateOpenApiDocument(): OpenAPIObject {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Base Project API',
      version: '1.0.0',
      description: 'API docs sinh tự động từ Zod schema',
    },
    servers: [{ url: '/api' }],
  });
}
