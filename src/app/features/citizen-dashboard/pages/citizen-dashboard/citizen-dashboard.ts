import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type {IncidentDto, IncidentStatus} from '../../../../shared/models/IncidentInterface';
import { IncidentService } from '../../../report-incident/services/incident-service';
import { IncidentCard } from '../../../../shared/components/incident-card/incident-card';
import { mapIncidentToCard } from '../../../../shared/mappers/incident.mapper';

type DashboardFilter = "ALL"|"UNRESOLVED"|"RESOLVED";
const UNRESOLVED_STATUSES: readonly IncidentStatus[] = [
  'NEW',
  'UNDER_REVIEW',
  'PLANNED',
  'IN_PROGRESS',
];

@Component({
  selector: 'app-citizen-dashboard',
  imports: [RouterLink, IncidentCard],
  templateUrl: './citizen-dashboard.html',
  styleUrl: './citizen-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitizenDashboard {
  private readonly incidentService = inject(IncidentService);

  private readonly incidentsResponse = toSignal(this.incidentService.getSignedInCitizenIncidents(), {initialValue: []});

  protected readonly activeFilter = signal<DashboardFilter>("ALL");
  protected readonly filteredIncidents = computed(() => {
    const filter = this.activeFilter();

    return this.incidentsResponse().filter((incident)=>
      this.matchesFilter(incident, filter)
    );
  });

  protected  readonly filteredIncidentsVm = computed(()=>{
    return this.filteredIncidents().map(incident => mapIncidentToCard(incident));
  });

  protected readonly totalReported = computed(() => this.incidentsResponse().length);
  protected readonly totalResolved = computed(() => this.incidentsResponse().filter((incident: IncidentDto) => incident.status === 'RESOLVED').length);

  setFilter(filter: DashboardFilter){
    this.activeFilter.set(filter);
  }
  private matchesFilter(incident: IncidentDto, filter: DashboardFilter): boolean {
    if (filter === 'RESOLVED') {
      return incident.status === 'RESOLVED';
    }

    if (filter === 'UNRESOLVED') {
      return UNRESOLVED_STATUSES.includes(incident.status);
    }

    return true;
  }
}
