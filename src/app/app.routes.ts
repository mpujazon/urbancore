import { Routes } from '@angular/router';
import { Homepage } from './features/home/pages/homepage/homepage';
import { Dashboard } from './features/citizen-incidents/pages/dashboard/dashboard';
import { ManageIncidents } from './features/admin-incidents/pages/manage-incidents/manage-incidents';


export const routes: Routes = [
  {
    path:"",
    component: Homepage
  },
  {
    path:"dashboard",
    component:Dashboard
  },
  {
    path:"manage-incidents",
    component: ManageIncidents
  }
];
