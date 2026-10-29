import { api } from '@/api/client';
import type { ApiSuccess, PaginationMeta, SortOrder } from '@/types/api';
import type { Role, User } from '@/types/user';

export type UserSortField = 'createdAt' | 'name' | 'email';

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
}

export interface PaginatedUsers {
  items: User[];
  meta: PaginationMeta;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export type UpdateUserRequest = Partial<CreateUserRequest>;

export const usersApi = {
  async list(params: ListUsersParams): Promise<PaginatedUsers> {
    const { data } = await api.get<ApiSuccess<User[], PaginationMeta>>('/users', {
      params: { ...params, search: params.search || undefined },
    });
    return { items: data.data, meta: data.meta };
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<ApiSuccess<User>>(`/users/${id}`);
    return data.data;
  },

  async create(body: CreateUserRequest): Promise<User> {
    const { data } = await api.post<ApiSuccess<User>>('/users', body);
    return data.data;
  },

  async update(id: string, body: UpdateUserRequest): Promise<User> {
    const { data } = await api.patch<ApiSuccess<User>>(`/users/${id}`, body);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
