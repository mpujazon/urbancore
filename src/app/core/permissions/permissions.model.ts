export type UserRole = 'CITIZEN' | 'ADMIN';

export interface CurrentUser {
  id: string;
  role: UserRole;
  cityId: string;
}

export interface IncidentPermissionContext {
  id: string;
  reporterId?: string;
  cityId: string;
  status: IncidentStatus;
}

export type IncidentStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED';
