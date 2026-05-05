import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {IncidentService} from '../../../report-incident/services/incident-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {IncidentCard} from '../../../../shared/components/incident-card/incident-card';
import {map, Observable} from 'rxjs';
import type {IncidentCardVm, IncidentDto} from '../../../../shared/models/IncidentInterface';
import {mapIncidentToCard} from '../../../../shared/mappers/incident.mapper';

@Component({
  selector: 'app-incident-explorer-page',
  imports: [
    IncidentCard
  ],
  templateUrl: './incident-explorer-page.html',
  styleUrl: './incident-explorer-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentExplorerPage {
  private readonly incidentService = inject(IncidentService);

  private readonly myIncidents$: Observable<IncidentCardVm[]> = this.incidentService
    .getAllIncidents()
    .pipe(map((incidents: IncidentDto[]) => incidents.map((incident: IncidentDto) => mapIncidentToCard(incident))));

  private readonly incidentsResponse = toSignal(this.myIncidents$, { initialValue: [] as IncidentCardVm[] });
  protected readonly incidents = computed((): IncidentCardVm[] => this.incidentsResponse() ?? []);


}
