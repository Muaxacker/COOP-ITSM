import api from './api';
import { User, ServiceCategory, Department, ApiResponse, Role } from '../types';

// Users
export async function getUsers(params?: { role?: Role; search?: string; page?: number; limit?: number }) {
  const res = await api.get<ApiResponse<{ users: User[]; total: number; page: number; limit: number }>>('/users', { params });
  return res.data.data!;
}

export async function createUser(data: { name: string; email: string; password: string; role: Role; departmentId?: string }) {
  const res = await api.post<ApiResponse<User>>('/users', data);
  return res.data;
}

export async function updateUser(id: string, data: Partial<{ name: string; email: string; role: Role; departmentId: string | null }>) {
  const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
  return res.data;
}

export async function toggleUserStatus(id: string) {
  const res = await api.patch<ApiResponse<User>>(`/users/${id}/status`);
  return res.data;
}

// Officers (for assign dropdown — accessible by OFFICER, MANAGER, ADMIN)
export async function getOfficers() {
  const res = await api.get<ApiResponse<{ users: User[]; total: number }>>('/users', { params: { role: 'OFFICER', limit: 100 } });
  return res.data.data!.users;
}

// Categories
export async function getCategories(all = false) {
  const res = await api.get<ApiResponse<ServiceCategory[]>>('/categories', { params: all ? { all: 'true' } : {} });
  return res.data.data!;
}

export async function createCategory(data: { name: string; description?: string; departmentId: string; defaultDeadlineHours: number; defaultPriority: string }) {
  const res = await api.post<ApiResponse<ServiceCategory>>('/categories', data);
  return res.data;
}

export async function updateCategory(id: string, data: Partial<ServiceCategory>) {
  const res = await api.patch<ApiResponse<ServiceCategory>>(`/categories/${id}`, data);
  return res.data;
}

// Departments
export async function getDepartments() {
  const res = await api.get<ApiResponse<Department[]>>('/departments');
  return res.data.data!;
}
