import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IncidentCard } from '../../../../shared/components/incident-card/incident-card';
import {CitizenDashboardStore, DashboardFilter} from '../../store/citizen-dashboard.store';
import {IncidentSkeleton} from '../../components/incident-skeleton/incident-skeleton';

@Component({
  selector: 'app-citizen-dashboard',
  imports: [RouterLink, IncidentCard, IncidentSkeleton],
  templateUrl: './citizen-dashboard.html',
  styleUrl: './citizen-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CitizenDashboardStore]
})
export class CitizenDashboard implements OnInit{
  protected readonly store = inject(CitizenDashboardStore);
  protected readonly skeletonItems = Array.from({ length: 6 });

  ngOnInit(): void {
    this.store.loadIncidents();
  }

  protected setFilter(filter: DashboardFilter): void{
    this.store.setFilter(filter);
  }

  protected retry(): void{
    this.store.retry();
  }
}
