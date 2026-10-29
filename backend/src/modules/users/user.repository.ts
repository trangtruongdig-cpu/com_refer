import type { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface FindManyUsersParams {
  skip: number;
  take: number;
  search?: string;
  role?: Role;
  sortBy: 'createdAt' | 'name' | 'email';
  sortOrder: 'asc' | 'desc';
}

/** Nơi DUY NHẤT của module users làm việc với Prisma */
export const userRepository = {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },

  async findMany(params: FindManyUsersParams): Promise<{ items: User[]; total: number }> {
    const { skip, take, search, role, sortBy, sortOrder } = params;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder } }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },
};

export type UserRepository = typeof userRepository;
