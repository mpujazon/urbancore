import { Routes } from '@angular/router';
import { Homepage } from './features/home/pages/homepage/homepage';
import { CitizenDashboard } from './features/citizen-dashboard/pages/citizen-dashboard/citizen-dashboard';
import { ManageIncidents } from './features/admin-incidents/pages/manage-incidents/manage-incidents';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ROUTE_ROLES } from './core/routing/route-roles';
import { Unauthorized } from './features/auth/pages/unauthorized/unauthorized';
import { ReportIncidentPage } from './features/report-incident/pages/report-incident-page/report-incident-page';
import { IncidentExplorerPage } from './features/incidents-explorer/pages/incident-explorer-page/incident-explorer-page';
import { IncidentDetailPageComponent } from './features/incidents/pages/incident-detail-page/incident-detail-page';
import { publicIncidentDetailResolver } from './features/incidents/resolvers/public-incident-detail.resolver';

export const routes: Routes = [
  {
    path: '',
    component: Homepage,
  },
  {
    path: 'dashboard',
    component: CitizenDashboard,
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
    path: 'manage-incidents',
    component: ManageIncidents,
    canActivate: [authGuard, roleGuard],
    data: { roles: ROUTE_ROLES.manageIncidents },
  },
  {
    path: 'incidents',
    component: IncidentExplorerPage
  },
  {
    path: 'incidents/:id',
    component: IncidentDetailPageComponent,
    resolve: {
      incident: publicIncidentDetailResolver,
    },
  },
  {
    path: 'unauthorized',
    component: Unauthorized,
  },
];
