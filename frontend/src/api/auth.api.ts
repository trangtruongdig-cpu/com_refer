import { api } from '@/api/client';
import type { ApiSuccess } from '@/types/api';
import type { AuthPayload, User } from '@/types/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const authApi = {
  async login(body: LoginRequest): Promise<AuthPayload> {
    const { data } = await api.post<ApiSuccess<AuthPayload>>('/auth/login', body);
    return data.data;
  },

  async register(body: RegisterRequest): Promise<AuthPayload> {
    const { data } = await api.post<ApiSuccess<AuthPayload>>('/auth/register', body);
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiSuccess<User>>('/auth/me');
    return data.data;
  },
};
