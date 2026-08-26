import api from './api';
import { ServiceRequest, ApiResponse, PaginatedResponse } from '../types';

export async function getRequests(params?: Record<string, string | number | undefined>) {
  const res = await api.get<ApiResponse<PaginatedResponse<ServiceRequest>>>('/requests', { params });
  return res.data.data!;
}

export async function getRequestById(id: string) {
  const res = await api.get<ApiResponse<ServiceRequest>>(`/requests/${id}`);
  return res.data.data!;
}

export async function createRequest(data: { categoryId: string; title: string; description: string }) {
  const res = await api.post<ApiResponse<ServiceRequest>>('/requests', data);
  return res.data;
}

export async function reviewRequest(id: string) {
  const res = await api.post<ApiResponse<ServiceRequest>>(`/requests/${id}/review`);
  return res.data;
}

export async function assignRequest(id: string, officerId: string) {
  const res = await api.post<ApiResponse<ServiceRequest>>(`/requests/${id}/assign`, { officerId });
  return res.data;
}

export async function startInvestigation(id: string) {
  const res = await api.post<ApiResponse<ServiceRequest>>(`/requests/${id}/start`);
  return res.data;
}

export async function addNote(id: string, note: string, isCustomerVisible: boolean) {
  const res = await api.post(`/requests/${id}/note`, { note, isCustomerVisible });
  return res.data;
}

export async function escalateRequest(id: string, reason: string) {
  const res = await api.post<ApiResponse<ServiceRequest>>(`/requests/${id}/escalate`, { reason });
  return res.data;
}

export async function resolveRequest(id: string, resolution: string) {
  const res = await api.post<ApiResponse<ServiceRequest>>(`/requests/${id}/resolve`, { resolution });
  return res.data;
}

export async function reopenRequest(id: string, reason: string) {
  const res = await api.post<ApiResponse<ServiceRequest>>(`/requests/${id}/reopen`, { reason });
  return res.data;
}

export async function closeRequest(id: string) {
  const res = await api.post<ApiResponse<ServiceRequest>>(`/requests/${id}/close`);
  return res.data;
}

export async function submitFeedback(id: string, rating: number, comment?: string) {
  const res = await api.post(`/requests/${id}/feedback`, { rating, comment });
  return res.data;
}
