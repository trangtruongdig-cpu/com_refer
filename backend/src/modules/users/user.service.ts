import type { User } from '@prisma/client';
import { hashPassword } from '../../lib/password';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/app-error';
import { buildPaginationMeta, getPagination, type PaginationMeta } from '../../utils/pagination';
import { userRepository } from './user.repository';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './user.schema';

export type PublicUser = Omit<User, 'password'>;

interface Requester {
  id: string;
  role: User['role'];
}

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

async function ensureEmailAvailable(email: string, exceptUserId?: string): Promise<void> {
  const existing = await userRepository.findByEmail(email);
  if (existing && existing.id !== exceptUserId) {
    throw new ConflictError('Email đã được sử dụng', 'EMAIL_TAKEN');
  }
}

async function findOrFail(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }
  return user;
}

export const userService = {
  async list(query: ListUsersQuery): Promise<{ items: PublicUser[]; meta: PaginationMeta }> {
    const { skip, take } = getPagination(query);
    const { items, total } = await userRepository.findMany({
      skip,
      take,
      search: query.search || undefined,
      role: query.role,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    return {
      items: items.map(toPublicUser),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string, requester: Requester): Promise<PublicUser> {
    // USER chỉ xem được chính mình, ADMIN xem được tất cả
    if (requester.role !== 'ADMIN' && requester.id !== id) {
      throw new ForbiddenError();
    }
    return toPublicUser(await findOrFail(id));
  },

  async create(input: CreateUserInput): Promise<PublicUser> {
    await ensureEmailAvailable(input.email);
    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      role: input.role,
      password: await hashPassword(input.password),
    });
    return toPublicUser(user);
  },

  async update(id: string, input: UpdateUserInput): Promise<PublicUser> {
    await findOrFail(id);
    if (input.email) {
      await ensureEmailAvailable(input.email, id);
    }
    const user = await userRepository.update(id, {
      email: input.email,
      name: input.name,
      role: input.role,
      password: input.password ? await hashPassword(input.password) : undefined,
    });
    return toPublicUser(user);
  },

  async remove(id: string, requester: Requester): Promise<void> {
    if (requester.id === id) {
      throw new BadRequestError('Không thể tự xóa tài khoản của mình', 'CANNOT_DELETE_SELF');
    }
    await findOrFail(id);
    await userRepository.delete(id);
  },
};
