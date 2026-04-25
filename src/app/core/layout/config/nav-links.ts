import { Link } from "../../../shared/models/LinkInterface"

export const NAV_LINKS: Link[] = [
  {
      label: 'Homepage',
      roles: ['unlogged','citizen','admin'],
      url: '/',
      iconClasses: 'fa-solid fa-house'
    },
    {
      label: 'My dashboard',
      roles: ['citizen'],
      url: '/dashboard',
      iconClasses: 'fa-solid fa-chalkboard-user'
    },
    {
      label: 'Manage incidents',
      roles: ['admin'],
      url: '/manage-incidents',
      iconClasses: 'fa-solid fa-list'
    },
    {
      label: 'Incidents Explorer',
      roles: ['unlogged','citizen'],
      url: '/incidents',
      iconClasses: 'fa-solid fa-magnifying-glass-location'
    },
    {
      label: 'Planned Actions',
      roles: ['unlogged','citizen','admin'],
      url: '/planned-actions',
      iconClasses: 'fa-solid fa-calendar'
    },
    {
      label: 'Stats',
      roles: ['unlogged','citizen','admin'],
      url: '/stats',
      iconClasses: 'fa-solid fa-chart-simple'
    }
  ]
