import { UserRole } from '../../shared/models/UserInterface';

export const ROUTE_ROLES = {
  homepage: ['unlogged', 'citizen', 'admin'],
  dashboard: ['citizen'],
  manageIncidents: ['admin'],
  incidents: ['unlogged', 'citizen'],
  plannedActions: ['unlogged', 'citizen', 'admin'],
  stats: ['unlogged', 'citizen', 'admin'],
} satisfies Record<string, UserRole[]>;
