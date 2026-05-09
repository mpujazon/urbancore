import { UserRole } from '../../shared/models/user-dto.model';

export const ROUTE_ROLES = {
  homepage: ['unlogged', 'ROLE_CITIZEN', 'ROLE_ADMIN'],
  citizenDashboard: ['ROLE_CITIZEN'],
  manageIncidents: ['ROLE_ADMIN'],
  incidents: ['unlogged', 'ROLE_CITIZEN', 'ROLE_ADMIN'],
  plannedActions: ['unlogged', 'ROLE_CITIZEN', 'ROLE_ADMIN'],
  stats: ['unlogged', 'ROLE_CITIZEN', 'ROLE_ADMIN'],
  reportIncident: ['ROLE_CITIZEN']
} satisfies Record<string, UserRole[]>;
