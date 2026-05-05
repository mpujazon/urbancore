import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, type Observable } from 'rxjs';
import type {
  IncidentCardVm,
  IncidentDto
} from '../../../../shared/models/IncidentInterface';
import { IncidentService } from '../../../report-incident/services/incident-service';
import {IncidentCard} from '../../../../shared/components/incident-card/incident-card';
import {mapIncidentToCard} from '../../../../shared/mappers/incident.mapper';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, IncidentCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly incidentService = inject(IncidentService);
  private readonly myIncidents$: Observable<IncidentCardVm[]> = this.incidentService
    .getSignedInCitizenIncidents()
    .pipe(map((incidents: IncidentDto[]) => incidents.map((incident: IncidentDto) => mapIncidentToCard(incident))));

  private readonly incidentsResponse = toSignal(this.myIncidents$, { initialValue: [] as IncidentCardVm[] });
  protected readonly incidents = computed((): IncidentCardVm[] => this.incidentsResponse() ?? []);

  protected readonly totalReported = computed(() => this.incidents().length);
  protected readonly totalResolved = computed(() => this.incidents().filter((incident: IncidentCardVm) => incident.status === 'RESOLVED').length);


}
