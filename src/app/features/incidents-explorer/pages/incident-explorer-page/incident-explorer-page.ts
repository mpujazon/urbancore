import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentCard } from '../../../../shared/components/incident-card/incident-card';
import { IncidentExplorerMapFacade } from '../../services/incident-explorer-map-facade';
import { LeafletMapService } from '../../../../shared/services/leaflet-map-service';
import { IncidentsExplorerStore } from '../../store/incidents-explorer.store';
import { ExplorerFilterBar } from '../../components/explorer-filter-bar/explorer-filter-bar';
import { AppPagination } from '../../../../shared/components/app-pagination/app-pagination';
import { mapIncidentListItemToCard } from '../../../../shared/mappers/incident.mapper';
import { IncidentCardVm } from '../../../../shared/models/incident-vm.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-incident-explorer-page',
  imports: [
    IncidentCard,
    ExplorerFilterBar,
    AppPagination,
  ],
  templateUrl: './incident-explorer-page.html',
  styleUrl: './incident-explorer-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IncidentExplorerMapFacade, IncidentsExplorerStore],
})
export class IncidentExplorerPage implements AfterViewInit, OnDestroy {
  private readonly leafletMapService = inject(LeafletMapService);
  private readonly mapFacade = inject(IncidentExplorerMapFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly store = inject(IncidentsExplorerStore);

  @ViewChild('mapContainer', { static: true })
  private mapContainer?: ElementRef<HTMLElement>;

  @ViewChild('incidentsContainer', { static: true })
  private incidentsContainer?: ElementRef<HTMLElement>;

  private readonly defaultCenter: L.LatLngTuple = [41.3874, 2.1686];
  private readonly defaultZoom = 13;

  protected readonly isMobileMapOpen = signal(false);
  protected readonly showFilters = signal(false);

  protected readonly incidentCards = computed<IncidentCardVm[]>(() =>
    this.store.incidents().map(mapIncidentListItemToCard),
  );

  constructor() {
    this.hydrateFromUrl();
    this.syncUrl();
  }

  private hydrateFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const record: Record<string, string | undefined> = {};

    params.keys.forEach((key) => {
      record[key] = params.get(key) ?? undefined;
    });

    this.store.hydrateFromQueryParams(record);
  }

  private syncUrl(): void {
    effect(() => {
      const queryParams = this.store.buildQueryParams();
      const cleaned: Record<string, string> = {};

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          cleaned[key] = value;
        }
      });

      this.router.navigate([], {
        queryParams: cleaned,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  ngAfterViewInit(): void {
    this.store.setIncidentsContainer(this.incidentsContainer?.nativeElement ?? null);

    if (!this.mapContainer) return;

    this.mapFacade.setMap(
      this.leafletMapService.createMap(
        this.mapContainer.nativeElement,
        this.defaultCenter,
        this.defaultZoom,
      ),
    );

    requestAnimationFrame(() => {
      this.mapFacade.map()?.invalidateSize();
    });

    setTimeout(() => {
      this.mapFacade.map()?.invalidateSize();
    }, 200);
  }

  ngOnDestroy(): void {
    if (!this.mapFacade.map()) {
      return;
    }
    this.mapFacade.destroy();
  }

  protected openMobileMap(): void {
    this.isMobileMapOpen.set(true);

    requestAnimationFrame(() => {
      this.mapFacade.map()?.invalidateSize();
    });

    setTimeout(() => {
      this.mapFacade.map()?.invalidateSize();
    }, 200);
  }

  protected closeMobileMap(): void {
    this.isMobileMapOpen.set(false);
  }

  @HostListener('window:resize')
  protected onViewportResize(): void {
    if (window.innerWidth >= 992 && this.isMobileMapOpen()) {
      this.isMobileMapOpen.set(false);
      this.mapFacade.map()?.invalidateSize();
    }
  }
}
