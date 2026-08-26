import { Role, Priority, RequestStatus, ActivityAction, NotificationType } from '@prisma/client';
import { Request } from 'express';

export { Role, Priority, RequestStatus, ActivityAction, NotificationType };

export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface RequestFilters {
  status?: RequestStatus;
  priority?: Priority;
  categoryId?: string;
  assignedOfficerId?: string;
  customerId?: string;
  search?: string;
}
