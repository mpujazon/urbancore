import type { IncidentStatus } from '../../shared/models/incident-dto.model';
import type { UserRole } from '../../shared/models/user-dto.model';

export interface CurrentUser {
  id: string;
  role: UserRole;
  cityId?: string;
}

export interface IncidentPermissionContext {
  id: string;
  reporterId?: string;
  cityId?: string;
  status: IncidentStatus;
}
