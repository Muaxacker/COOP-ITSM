import {
  Role,
  Priority,
  IncidentStatus,
  DivisionCode,
  ActivityAction,
  NotificationType,
} from '@prisma/client';
import { Request } from 'express';

export {
  Role,
  Priority,
  IncidentStatus,
  DivisionCode,
  ActivityAction,
  NotificationType,
};

export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
  branchId?: string | null;
  divisionId?: string | null;
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

export interface IncidentFilters {
  status?: IncidentStatus;
  priority?: Priority;
  divisionId?: string;
  divisionCode?: DivisionCode;
  categoryId?: string;
  branchId?: string;
  assignedTechnicianId?: string;
  reportedById?: string;
  slaBreached?: boolean;
  search?: string;
}

