import { z } from 'zod';

/** Chuỗi thời lượng kiểu "15m", "7d", "3600s" — dùng cho JWT và cookie */
const durationSchema = z
  .string()
  .regex(/^\d+[smhd]$/, 'Định dạng thời lượng không hợp lệ (ví dụ: 15m, 7d)');

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET phải dài ít nhất 32 ký tự'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET phải dài ít nhất 32 ký tự'),
  JWT_ACCESS_EXPIRES: durationSchema.default('15m'),
  JWT_REFRESH_EXPIRES: durationSchema.default('7d'),

  /** Danh sách origin, cách nhau bằng dấu phẩy */
  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  SWAGGER_ENABLED: booleanString.default('true'),
  /** Số proxy tin cậy đứng trước app (Caddy = 1). 0 = không tin proxy nào */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Biến môi trường không hợp lệ:');
    for (const issue of parsed.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
