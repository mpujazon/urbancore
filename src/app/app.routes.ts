import { Routes } from '@angular/router';
import { Homepage } from './features/home/pages/homepage/homepage';
import { Dashboard } from './features/citizen-incidents/pages/dashboard/dashboard';
import { ManageIncidents } from './features/admin-incidents/pages/manage-incidents/manage-incidents';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ROUTE_ROLES } from './core/routing/route-roles';
import { Unauthorized } from './features/auth/pages/unauthorized/unauthorized';
import { ReportIncidentPage } from './features/report-incident/pages/report-incident-page/report-incident-page';

export const routes: Routes = [
  {
    path: '',
    component: Homepage,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.dashboard },
  },
  {
    path: 'report-incident',
    component: ReportIncidentPage,
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.reportIncident}
  },
  {
    path: 'manage-incidents',
    component: ManageIncidents,
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.manageIncidents },
  },
  {
    path: 'unauthorized',
    component: Unauthorized,
  },
];
