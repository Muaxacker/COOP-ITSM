import api from './api';
import { CustomerDashboard, OfficerDashboard, ManagerDashboard, ApiResponse } from '../types';

export async function getCustomerDashboard() {
  const res = await api.get<ApiResponse<CustomerDashboard>>('/dashboard/customer');
  return res.data.data!;
}

export async function getOfficerDashboard() {
  const res = await api.get<ApiResponse<OfficerDashboard>>('/dashboard/officer');
  return res.data.data!;
}

export async function getManagerDashboard() {
  const res = await api.get<ApiResponse<ManagerDashboard>>('/dashboard/manager');
  return res.data.data!;
}
