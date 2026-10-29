import { z } from 'zod';

const email = z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ');

export const loginFormSchema = z.object({
  email,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Vui lòng nhập tên').max(100),
    email,
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(72, 'Mật khẩu tối đa 72 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
