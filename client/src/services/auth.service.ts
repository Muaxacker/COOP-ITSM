import api from './api';
import { User } from '../types';

export interface LoginResult {
  token?: string;
  user?: User;
  require2FA?: boolean;
  tempToken?: string;
  message?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await api.post<{ success: boolean; data: LoginResult }>('/auth/login', { email, password });
  return res.data.data;
}

export async function verify2faLogin(tempToken: string, code: string): Promise<{ token: string; user: User }> {
  const res = await api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/2fa/verify-login', { tempToken, code });
  return res.data.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ success: boolean; data: User }>('/auth/me');
  return res.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
