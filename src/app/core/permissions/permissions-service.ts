import { Injectable } from '@angular/core';
import {CurrentUser, IncidentPermissionContext} from './permissions.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  canEditIncident(
    user: CurrentUser | null,
    incident: IncidentPermissionContext | null
  ): boolean {
    if (!user || !incident) return false;

    const isOwner = incident.reporterId === user.id;
    const isEditableStatus =
      incident.status === 'NEW' || incident.status === 'UNDER_REVIEW';

    return user.role === 'CITIZEN' && isOwner && isEditableStatus;
  }

  canDeleteIncident(
    user: CurrentUser | null,
    incident: IncidentPermissionContext | null
  ): boolean {
    return this.canEditIncident(user, incident);
  }
}
