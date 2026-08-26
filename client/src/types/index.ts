export type Role = 'CUSTOMER' | 'OFFICER' | 'MANAGER' | 'ADMIN';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type RequestStatus =
  | 'NEW'
  | 'REVIEWED'
  | 'ASSIGNED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'OVERDUE'
  | 'ESCALATED';
export type NotificationType =
  | 'REQUEST_UPDATE'
  | 'DEADLINE_WARNING'
  | 'OVERDUE'
  | 'RESOLUTION'
  | 'ASSIGNMENT'
  | 'ESCALATION'
  | 'GENERAL';
export type DeadlineStatus = 'ON_TRACK' | 'DEADLINE_APPROACHING' | 'OVERDUE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  department?: { id: string; name: string } | null;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  defaultDeadlineHours: number;
  defaultPriority: Priority;
  isActive: boolean;
  department: { id: string; name: string };
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  deadline: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deadlineStatus?: DeadlineStatus;
  customer: { id: string; name: string; email: string };
  category: { id: string; name: string; defaultDeadlineHours: number; department?: { id: string; name: string } };
  assignedOfficer?: { id: string; name: string; email: string } | null;
  activities?: RequestActivity[];
  feedback?: Feedback | null;
}

export interface RequestActivity {
  id: string;
  requestId: string;
  action: string;
  description: string;
  isCustomerVisible: boolean;
  createdAt: string;
  user: { id: string; name: string; role: Role };
}

export interface Notification {
  id: string;
  userId: string;
  requestId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  request?: { id: string; requestNumber: string; title: string } | null;
}

export interface Feedback {
  id: string;
  requestId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  requests?: T[];
  users?: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerDashboard {
  stats: { totalRequests: number; activeRequests: number; resolvedRequests: number };
  recentRequests: ServiceRequest[];
  unreadNotifications: number;
}

export interface OfficerDashboard {
  stats: {
    openRequests: number;
    newRequests: number;
    dueSoon: number;
    overdue: number;
    completedToday: number;
  };
  attentionRequests: ServiceRequest[];
}

export interface ManagerDashboard {
  stats: {
    totalRequests: number;
    openRequests: number;
    resolvedRequests: number;
    overdueRequests: number;
    onTimeResolutionRate: number;
    avgResolutionHours: number | null;
    avgRating: number | null;
  };
  overdueRequests: ServiceRequest[];
  escalatedRequests: ServiceRequest[];
  deadlineApproaching: ServiceRequest[];
}
