import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IncidentCard } from '../../../../shared/components/incident-card/incident-card';
import {CitizenDashboardStore, DashboardFilter} from '../../store/citizen-dashboard.store';


@Component({
  selector: 'app-citizen-dashboard',
  imports: [RouterLink, IncidentCard],
  templateUrl: './citizen-dashboard.html',
  styleUrl: './citizen-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CitizenDashboardStore]
})
export class CitizenDashboard implements OnInit{
  protected readonly store = inject(CitizenDashboardStore);

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
