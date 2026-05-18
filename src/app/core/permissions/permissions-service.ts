import { Injectable } from '@angular/core';
import {CurrentUser, IncidentPermissionContext} from './permissions.model';
import type { UserRole } from '../../shared/models/user-dto.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private readonly readOnlyStatuses = new Set(['CANCELLED', 'REJECTED', 'RESOLVED']);

  canManageIncident(user: CurrentUser | null, incident: IncidentPermissionContext | null): boolean {
    if (!user || !incident || this.isReadOnlyIncident(incident)) return false;
    return user.role === 'ROLE_ADMIN';
  }

  canEditIncident(
    user: CurrentUser | null,
    incident: IncidentPermissionContext | null
  ): boolean {
    if (!user || !incident) return false;

    if (this.isReadOnlyIncident(incident)) {
      return false;
    }

    const isOwner = incident.reporterId === user.id;
    const isEditableStatus =
      incident.status === 'NEW' || incident.status === 'UNDER_REVIEW';

    return user.role === 'ROLE_CITIZEN' && isOwner && isEditableStatus;
  }

  canDeleteIncident(
    user: CurrentUser | null,
    incident: IncidentPermissionContext | null
  ): boolean {
    if (!user || !incident) return false;
    if (this.isReadOnlyIncident(incident)) return false;

    if (user.role === 'ROLE_ADMIN') {
      return incident.status === 'NEW';
    }

    const isOwner = incident.reporterId === user.id;
    return user.role === 'ROLE_CITIZEN' && isOwner && incident.status === 'NEW';
  }

  isReadOnlyIncident(incident: IncidentPermissionContext | null): boolean {
    if (!incident) return false;
    return this.readOnlyStatuses.has(incident.status);
  }
}
