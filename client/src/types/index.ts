export type Role = 'BRANCH_USER' | 'IT_SUPERVISOR' | 'TECHNICIAN' | 'ADMIN';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_INFO'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type DivisionCode = 'ATM' | 'APPLICATION' | 'NETWORKING' | 'MAINTENANCE';

export type NotificationType =
  | 'INCIDENT_CREATED'
  | 'INCIDENT_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'INFO_REQUESTED'
  | 'INFO_PROVIDED'
  | 'INCIDENT_RESOLVED'
  | 'INCIDENT_CLOSED'
  | 'INCIDENT_REOPENED'
  | 'SLA_WARNING'
  | 'SLA_BREACHED';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}


export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number; incidents: number };
}

export interface Division {
  id: string;
  name: string;
  code: DivisionCode;
  description?: string | null;
  categories?: IncidentCategory[];
  users?: { id: string; name: string; email: string; phone?: string | null }[];
  _count?: { users: number; categories: number };
}

export interface IncidentCategory {
  id: string;
  divisionId: string;
  name: string;
  description?: string | null;
  defaultPriority: Priority;
  defaultSlaHours: number;
  isActive: boolean;
  division?: { id: string; name: string; code: DivisionCode };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  branchId?: string | null;
  divisionId?: string | null;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  branch?: { id: string; name: string; code: string; location: string } | null;
  division?: { id: string; name: string; code: DivisionCode } | null;
}

export interface TroubleshootingLog {
  id: string;
  incidentId: string;
  technicianId: string;
  action: string;
  observation: string;
  result: string;
  createdAt: string;
  technician?: { id: string; name: string };
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  userId: string;
  action: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user: { id: string; name: string; role: Role };
}

export interface Attachment {
  id: string;
  incidentId: string;
  uploadedById: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy?: { id: string; name: string };
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  branchId: string;
  categoryId: string;
  reportedById: string;
  assignedTechnicianId?: string | null;
  priority: Priority;
  status: IncidentStatus;
  slaDeadline: string;
  slaBreached: boolean;
  rootCause?: string | null;
  resolution?: string | null;
  reportedAt: string;
  assignedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  reopenedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  branch: { id: string; name: string; code: string; location: string; phone?: string | null };
  category: {
    id: string;
    name: string;
    division?: { id: string; name: string; code: DivisionCode };
  };
  reportedBy: { id: string; name: string; email: string; phone?: string | null; role?: Role };
  assignedTechnician?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role?: Role;
    division?: { id: string; name: string; code: DivisionCode };
  } | null;
  updates?: IncidentUpdate[];
  troubleshootingLogs?: TroubleshootingLog[];
  attachments?: Attachment[];
}

export interface Notification {
  id: string;
  userId: string;
  incidentId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  incident?: { id: string; incidentNumber: string; title: string } | null;
}

export interface TechnicianWithWorkload {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  division?: { id: string; name: string; code: DivisionCode } | null;
  activeWorkload: number;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
}
