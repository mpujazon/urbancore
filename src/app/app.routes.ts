import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ROUTE_ROLES } from './core/routing/route-roles';
import { publicIncidentDetailResolver } from './features/incident-detail/resolvers/public-incident-detail.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/homepage/homepage').then((m) => m.Homepage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/citizen-dashboard/pages/citizen-dashboard/citizen-dashboard').then(
        (m) => m.CitizenDashboard,
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.citizenDashboard },
  },
  {
    path: 'report-incident',
    loadComponent: () =>
      import('./features/report-incident/pages/report-incident-page/report-incident-page').then(
        (m) => m.ReportIncidentPage,
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.reportIncident}
  },
  {
    path: 'admin/incidents',
    loadComponent: () =>
      import('./features/admin-incidents/pages/manage-incidents/manage-incidents').then(
        (m) => m.ManageIncidents,
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.manageIncidents },
  },
  {
    path: 'admin/incidents/:id',
    loadComponent: () =>
      import('./features/incident-detail/pages/incident-detail-page/incident-detail-page').then(
        (m) => m.IncidentDetailPageComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.manageIncidents },
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
    loadComponent: () =>
      import('./features/incidents-explorer/pages/incident-explorer-page/incident-explorer-page').then(
        (m) => m.IncidentExplorerPage,
      ),
  },
  {
    path: 'incidents/:id',
    loadComponent: () =>
      import('./features/incident-detail/pages/incident-detail-page/incident-detail-page').then(
        (m) => m.IncidentDetailPageComponent,
      ),
    resolve: {
      incident: publicIncidentDetailResolver,
    },
  },
  {
    path:'stats',
    loadComponent: () =>
      import(
        './features/public-statistics/components/public-statistics-dashboard/public-statistics-dashboard'
      ).then((m) => m.PublicStatisticsDashboard),
  },
  {
    path: 'planned-actions',
    loadComponent: () =>
      import('./features/planned-actions/pages/planned-actions-page/planned-actions-page').then(
        (m) => m.PlannedActionsPage,
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/pages/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
];
