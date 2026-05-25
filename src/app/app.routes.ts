import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ROUTE_ROLES } from './core/routing/route-roles';
import { publicIncidentDetailResolver } from './features/incident-detail/resolvers/public-incident-detail.resolver';

const defaultSiteDescription =
  'UrbanCore helps residents report city incidents and follow public status updates from submission to resolution.';

export const routes: Routes = [
  {
    path: '',
    title: 'UrbanCore | City Incident Management',
    data: {
      seo: {
        description: defaultSiteDescription,
      },
    },
    loadComponent: () =>
      import('./features/home/pages/homepage/homepage').then((m) => m.Homepage),
  },
  {
    path: 'dashboard',
    title: 'Citizen Dashboard | UrbanCore',
    loadComponent: () =>
      import('./features/citizen-dashboard/pages/citizen-dashboard/citizen-dashboard').then(
        (m) => m.CitizenDashboard,
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ROUTE_ROLES.citizenDashboard,
      seo: {
        description: 'Review and track your reported incidents from your UrbanCore dashboard.',
        noindex: true,
      },
    },
  },
  {
    path: 'report-incident',
    title: 'Report an Incident | UrbanCore',
    loadComponent: () =>
      import('./features/report-incident/pages/report-incident-page/report-incident-page').then(
        (m) => m.ReportIncidentPage,
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ROUTE_ROLES.reportIncident,
      seo: {
        description: 'Submit a new city incident report with location details and supporting media.',
        noindex: true,
      },
    },
  },
  {
    path: 'admin/incidents',
    title: 'Admin Incidents | UrbanCore',
    loadComponent: () =>
      import('./features/admin-incidents/pages/manage-incidents/manage-incidents').then(
        (m) => m.ManageIncidents,
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ROUTE_ROLES.manageIncidents,
      seo: {
        description: 'Manage incoming city incidents and operational workflows in UrbanCore admin tools.',
        noindex: true,
      },
    },
  },
  {
    path: 'admin/incidents/:id',
    title: 'Admin Incident Detail | UrbanCore',
    loadComponent: () =>
      import('./features/incident-detail/pages/incident-detail-page/incident-detail-page').then(
        (m) => m.IncidentDetailPageComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ROUTE_ROLES.manageIncidents,
      seo: {
        description: 'Review and update incident details, status history, and planned actions.',
        noindex: true,
      },
    },
    resolve: {
      incident: publicIncidentDetailResolver,
    },
  },
  {
    path: 'manage-incidents',
    redirectTo: 'admin/incidents',
    pathMatch: 'full',
  },
  {
    path: 'incidents',
    title: 'Explore Incidents | UrbanCore',
    data: {
      seo: {
        description: 'Explore open and resolved city incidents by status, category, city, and date range.',
      },
    },
    loadComponent: () =>
      import('./features/incidents-explorer/pages/incident-explorer-page/incident-explorer-page').then(
        (m) => m.IncidentExplorerPage,
      ),
  },
  {
    path: 'incidents/:id',
    title: 'Incident Detail | UrbanCore',
    data: {
      seo: {
        description: 'View incident details, updates, location, and evidence published through UrbanCore.',
      },
    },
    loadComponent: () =>
      import('./features/incident-detail/pages/incident-detail-page/incident-detail-page').then(
        (m) => m.IncidentDetailPageComponent,
      ),
    resolve: {
      incident: publicIncidentDetailResolver,
    },
  },
  {
    path: 'stats',
    title: 'Public Statistics | UrbanCore',
    data: {
      seo: {
        description: 'Analyze trends, categories, and status distribution for public city incidents.',
      },
    },
    loadComponent: () =>
      import(
        './features/public-statistics/components/public-statistics-dashboard/public-statistics-dashboard'
      ).then((m) => m.PublicStatisticsDashboard),
  },
  {
    path: 'planned-actions',
    title: 'Planned Actions | UrbanCore',
    data: {
      seo: {
        description: 'Review upcoming and completed planned actions linked to city incident resolution.',
      },
    },
    loadComponent: () =>
      import('./features/planned-actions/pages/planned-actions-page/planned-actions-page').then(
        (m) => m.PlannedActionsPage,
      ),
  },
  {
    path: 'unauthorized',
    title: 'Unauthorized Access | UrbanCore',
    data: {
      seo: {
        description: 'You do not have permission to access this page.',
        noindex: true,
      },
    },
    loadComponent: () =>
      import('./features/auth/pages/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
];
