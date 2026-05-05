import {computed, DestroyRef, inject, Injectable, signal} from '@angular/core';
import {IncidentDto, IncidentStatus} from '../../../shared/models/IncidentInterface';
import {IncidentService} from '../../report-incident/services/incident-service';
import {ResourceState} from '../../../shared/models/resource-state.model';
import {mapIncidentToCard} from '../../../shared/mappers/incident.mapper';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export type DashboardFilter = "ALL"|"UNRESOLVED"|"RESOLVED";
const UNRESOLVED_STATUSES: readonly IncidentStatus[] = [
  'NEW',
  'UNDER_REVIEW',
  'PLANNED',
  'IN_PROGRESS',
];

@Injectable()
export class CitizenDashboardStore {
  private readonly incidentService = inject(IncidentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly incidentsState = signal<ResourceState<IncidentDto[]>>({
    data: [],
    status: 'idle',
    error: null
  });

  readonly activeFilter = signal<DashboardFilter>("ALL");

  readonly incidents = computed(()=> this.incidentsState().data);
  readonly status = computed(()=> this.incidentsState().status);
  readonly error = computed(()=> this.incidentsState().error);

  readonly isLoading = computed(()=> this.status() === 'loading');
  readonly isError = computed(()=> this.status() === 'error');
  readonly isSuccess = computed(()=> this.status() === 'success');

  readonly filteredIncidents = computed(()=>{
    const filter = this.activeFilter();
    return this.incidents().filter((incident)=>
      this.matchesDashboardFilter(incident, filter)
    );
  });

  readonly filteredIncidentsVm = computed(()=>
    this.filteredIncidents().map(mapIncidentToCard)
  );

  readonly totalReported = computed(() => this.incidents().length);
  readonly totalResolved = computed(() =>
    this.incidents().filter((incident: IncidentDto) => incident.status === 'RESOLVED').length
  );

  readonly hasIncidents = computed(()=> this.incidents().length > 0);
  readonly hasFilteredIncidents = computed(() => this.filteredIncidents().length > 0);

  readonly showInitialLoading = computed(()=>
    this.isLoading() && !this.hasIncidents()
  );

  readonly showEmptyState = computed(()=>
    this.isSuccess() && !this.hasIncidents()
  );

  readonly showNoFilterResults = computed(()=>
    this.isSuccess() && this.hasIncidents() && !this.hasFilteredIncidents()
  );

  loadIncidents(): void{
    this.setLoading();

    this.incidentService
      .getSignedInCitizenIncidents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (incidents) => this.setSuccess(incidents),
        error: () => this.setError('Could not load your incidents. Please try again.')
      });
  }

  retry(): void{
    this.loadIncidents();
  }

  setFilter(filter: DashboardFilter){
    this.activeFilter.set(filter);
  }

  private setLoading(): void{
    this.incidentsState.update((state)=> ({
      ...state,
      status: 'loading',
      error: null
    }));
  }

  private setSuccess(incidents: IncidentDto[]): void{
    this.incidentsState.set({
      data: incidents,
      status:'success',
      error: null
    });
  }

  private setError(message: string){
    this.incidentsState.update((state)=> ({
      ...state,
      status:'error',
      error: message
    }))
  }

  private matchesDashboardFilter(incident: IncidentDto, filter: DashboardFilter): boolean {
    if (filter === 'RESOLVED') {
      return incident.status === 'RESOLVED';
    }

    if (filter === 'UNRESOLVED') {
      return UNRESOLVED_STATUSES.includes(incident.status);
    }

    return true;
  }
}
