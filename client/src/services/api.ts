import axios from 'axios';
import {
  Branch,
  Division,
  IncidentCategory,
  Incident,
  Notification,
  TechnicianWithWorkload,
  User,
  Priority,
  IncidentStatus,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coop_itsm_token') || localStorage.getItem('bankcare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('coop_itsm_token');
      localStorage.removeItem('coop_itsm_user');
      localStorage.removeItem('bankcare_token');
      localStorage.removeItem('bankcare_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { token: string; user: User }; message: string }>('/auth/login', {
      email,
      password,
    }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get<{ success: boolean; data: User }>('/auth/me'),
};

// ─── Incidents API ─────────────────────────────────────────────────────────
export const incidentApi = {
  getIncidents: (params?: {
    status?: IncidentStatus;
    priority?: Priority;
    divisionId?: string;
    categoryId?: string;
    branchId?: string;
    assignedTechnicianId?: string;
    search?: string;
    slaBreached?: boolean;
    page?: number;
    limit?: number;
  }) =>
    api.get<{
      success: boolean;
      data: {
        incidents: Incident[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    }>('/incidents', { params }),

  getIncident: (id: string) =>
    api.get<{ success: boolean; data: Incident }>(`/incidents/${id}`),

  createIncident: (data: {
    branchId: string;
    categoryId: string;
    title: string;
    description: string;
    priority?: Priority;
  }) => api.post<{ success: boolean; data: Incident }>('/incidents', data),

  reviewIncident: (id: string, data: { priority?: Priority; categoryId?: string; notes?: string }) =>
    api.patch<{ success: boolean; data: Incident }>(`/incidents/${id}/review`, data),

  assignTechnician: (id: string, technicianId: string, notes?: string) =>
    api.post<{ success: boolean; data: Incident }>(`/incidents/${id}/assign`, {
      technicianId,
      notes,
    }),

  startInvestigation: (id: string) =>
    api.post<{ success: boolean; data: Incident }>(`/incidents/${id}/investigate`),

  requestMoreInfo: (id: string, question: string) =>
    api.post<{ success: boolean; data: Incident }>(`/incidents/${id}/request-info`, { question }),

  provideMoreInfo: (id: string, response: string) =>
    api.post<{ success: boolean; data: Incident }>(`/incidents/${id}/provide-info`, { response }),

  addTroubleshootingLog: (
    id: string,
    data: { action: string; observation: string; result: string }
  ) => api.post<{ success: boolean; data: unknown }>(`/incidents/${id}/troubleshooting`, data),

  resolveIncident: (
    id: string,
    data: { rootCause: string; resolution: string; notes?: string }
  ) => api.post<{ success: boolean; data: Incident }>(`/incidents/${id}/resolve`, data),

  verifyResolution: (
    id: string,
    data: { isResolved: boolean; feedback?: string }
  ) => api.post<{ success: boolean; data: Incident }>(`/incidents/${id}/verify`, data),

  addNote: (id: string, data: { message: string; isInternal?: boolean }) =>
    api.post<{ success: boolean; data: unknown }>(`/incidents/${id}/notes`, data),
};

// ─── Branches API ──────────────────────────────────────────────────────────
export const branchApi = {
  getBranches: (includeInactive = false) =>
    api.get<{ success: boolean; data: Branch[] }>('/branches', {
      params: { includeInactive },
    }),
  getBranch: (id: string) =>
    api.get<{ success: boolean; data: Branch }>(`/branches/${id}`),
  createBranch: (data: { name: string; code: string; location: string; phone?: string }) =>
    api.post<{ success: boolean; data: Branch }>('/branches', data),
  updateBranch: (id: string, data: Partial<Branch>) =>
    api.patch<{ success: boolean; data: Branch }>(`/branches/${id}`, data),
};

// ─── Divisions & Categories API ───────────────────────────────────────────
export const divisionApi = {
  getDivisions: () =>
    api.get<{ success: boolean; data: Division[] }>('/divisions'),
  getCategories: (divisionId?: string) =>
    api.get<{ success: boolean; data: IncidentCategory[] }>('/divisions/categories', {
      params: { divisionId },
    }),
  createCategory: (data: {
    divisionId: string;
    name: string;
    description?: string;
    defaultPriority?: Priority;
    defaultSlaHours?: number;
  }) => api.post<{ success: boolean; data: IncidentCategory }>('/divisions/categories', data),
  updateCategory: (id: string, data: Partial<IncidentCategory>) =>
    api.patch<{ success: boolean; data: IncidentCategory }>(`/divisions/categories/${id}`, data),
};

// ─── Users API ─────────────────────────────────────────────────────────────
export const userApi = {
  getUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
    api.get<{
      success: boolean;
      data: { users: User[]; total: number; page: number; limit: number };
    }>('/users', { params }),

  getTechnicians: (divisionId?: string) =>
    api.get<{ success: boolean; data: TechnicianWithWorkload[] }>('/users/technicians', {
      params: { divisionId },
    }),

  createUser: (data: Partial<User> & { password: string }) =>
    api.post<{ success: boolean; data: User }>('/users', data),

  updateUser: (id: string, data: Partial<User>) =>
    api.patch<{ success: boolean; data: User }>(`/users/${id}`, data),

  toggleUserStatus: (id: string) =>
    api.patch<{ success: boolean; data: User }>(`/users/${id}/status`),
};

// ─── Dashboard API ─────────────────────────────────────────────────────────
export const dashboardApi = {
  getDashboard: () =>
    api.get<{ success: boolean; data: any }>('/dashboard'),
};

// ─── Reports API ───────────────────────────────────────────────────────────
export const reportApi = {
  getReports: () =>
    api.get<{ success: boolean; data: any }>('/reports'),
};

// ─── Notifications API ─────────────────────────────────────────────────────
export const notificationApi = {
  getNotifications: () =>
    api.get<{
      success: boolean;
      data: { notifications: Notification[]; unreadCount: number };
    }>('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export default api;
