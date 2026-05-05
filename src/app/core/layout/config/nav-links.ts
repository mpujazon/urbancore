import { Link } from '../../../shared/models/LinkInterface';
import { ROUTE_ROLES } from '../../routing/route-roles';

export const NAV_LINKS: Link[] = [
  {
      label: 'Homepage',
      roles: ROUTE_ROLES.homepage,
      url: '/',
      iconClasses: 'fa-solid fa-house'
    },
    {
      label: 'My citizen-dashboard',
      roles: ROUTE_ROLES.dashboard,
      url: '/dashboard',
      iconClasses: 'fa-solid fa-chalkboard-user'
    },
    {
      label: 'Report incident',
      roles: ROUTE_ROLES.reportIncident,
      url: 'report-incident',
      iconClasses: 'fa-solid fa-circle-plus'
    },
    {
      label: 'Manage incidents',
      roles: ROUTE_ROLES.manageIncidents,
      url: '/manage-incidents',
      iconClasses: 'fa-solid fa-list'
    },
    {
      label: 'Incidents explorer',
      roles: ROUTE_ROLES.incidents,
      url: '/incidents',
      iconClasses: 'fa-solid fa-magnifying-glass-location'
    },
    {
      label: 'Planned Actions',
      roles: ROUTE_ROLES.plannedActions,
      url: '/planned-actions',
      iconClasses: 'fa-solid fa-calendar'
    },
    {
      label: 'Stats',
      roles: ROUTE_ROLES.stats,
      url: '/stats',
      iconClasses: 'fa-solid fa-chart-simple'
    }
  ]
