import { Routes } from '@angular/router';
import { Homepage } from './features/home/pages/homepage/homepage';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ROUTE_ROLES } from './core/routing/route-roles';
import { Unauthorized } from './features/auth/pages/unauthorized/unauthorized';
import { ReportIncidentPage } from './features/report-incident/pages/report-incident-page/report-incident-page';
import { publicIncidentDetailResolver } from './features/incident-detail/resolvers/public-incident-detail.resolver';

export const routes: Routes = [
  {
    path: '',
    component: Homepage,
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
    component: ReportIncidentPage,
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
    component: Unauthorized,
  },
];
