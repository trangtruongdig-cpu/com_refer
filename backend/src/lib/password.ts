import bcrypt from 'bcryptjs';
import { isTest } from '../config/env';

// Giảm cost khi chạy test cho nhanh
const SALT_ROUNDS = isTest ? 4 : 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
