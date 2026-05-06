import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {IncidentService} from '../../../report-incident/services/incident-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {IncidentCard} from '../../../../shared/components/incident-card/incident-card';
import {map, Observable} from 'rxjs';
import type {IncidentCardVm, IncidentDto} from '../../../../shared/models/IncidentInterface';
import {mapIncidentToCard} from '../../../../shared/mappers/incident.mapper';
import {IncidentsExplorerMapFacade} from '../../services/incidents-explorer-map.facade';
import {LeafletMapService} from '../../../../shared/services/leaflet-map-service';
import * as L from 'leaflet';

@Component({
  selector: 'app-incident-explorer-page',
  imports: [
    IncidentCard
  ],
  templateUrl: './incident-explorer-page.html',
  styleUrl: './incident-explorer-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ IncidentsExplorerMapFacade ]
})
export class IncidentExplorerPage implements AfterViewInit, OnDestroy{
  private readonly incidentService = inject(IncidentService);
  private readonly leafletMapService = inject(LeafletMapService);
  private readonly mapFacade = inject(IncidentsExplorerMapFacade);

  @ViewChild('mapContainer', { static: true })
  private mapContainer?: ElementRef<HTMLElement>;

  private readonly defaultCenter: L.LatLngTuple = [41.3874, 2.1686];
  private readonly defaultZoom = 13;

  ngAfterViewInit(): void {
    if(!this.mapContainer){
      return;
    }

    this.mapFacade.setMap(this.leafletMapService.createMap(
      this.mapContainer.nativeElement,
      this.defaultCenter,
      this.defaultZoom
    ));

    requestAnimationFrame(() => {
      this.mapFacade.map()?.invalidateSize();
    });

    setTimeout(() => {
      this.mapFacade.map()?.invalidateSize();
    }, 200);
  }

  ngOnDestroy(): void{
    if(!this.mapFacade.map()){
      return;
    }

    this.mapFacade.destroy();
  }

  private readonly myIncidents$: Observable<IncidentCardVm[]> = this.incidentService
    .getAllIncidents()
    .pipe(map((incidents: IncidentDto[]) => incidents.map((incident: IncidentDto) => mapIncidentToCard(incident))));

  private readonly incidentsResponse = toSignal(this.myIncidents$, { initialValue: [] as IncidentCardVm[] });
  protected readonly incidents = computed((): IncidentCardVm[] => this.incidentsResponse() ?? []);






}
