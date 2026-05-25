import type { IncidentStatus } from '../models/incident-dto.model';

export const UNRESOLVED_INCIDENT_STATUSES: readonly IncidentStatus[] = [
  'NEW',
  'UNDER_REVIEW',
  'PLANNED',
  'IN_PROGRESS',
];

export function isIncidentUnresolved(status: IncidentStatus): boolean {
  return UNRESOLVED_INCIDENT_STATUSES.includes(status);
}
