import api from './api';
import { User } from '../types';

export async function login(email: string, password: string) {
  const res = await api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/login', { email, password });
  return res.data.data;
}

export async function getMe() {
  const res = await api.get<{ success: boolean; data: User }>('/auth/me');
  return res.data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}
