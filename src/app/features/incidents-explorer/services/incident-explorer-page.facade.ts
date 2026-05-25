import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mapIncidentListItemToCard } from '../../../shared/mappers/incident.mapper';
import type { IncidentCardVm } from '../../../shared/models/incident-vm.model';
import { LeafletMapService } from '../../../shared/services/leaflet-map-service';
import { IncidentExplorerMapFacade } from './incident-explorer-map-facade';
import { IncidentsExplorerStore } from '../store/incidents-explorer.store';
import type * as L from 'leaflet';

@Injectable()
export class IncidentExplorerPageFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leafletMapService = inject(LeafletMapService);

  readonly store = inject(IncidentsExplorerStore);
  readonly mapFacade = inject(IncidentExplorerMapFacade);

  private readonly defaultCenter: L.LatLngTuple = [41.3874, 2.1686];
  private readonly defaultZoom = 13;
  private incidentsContainer: HTMLElement | null = null;

  readonly isMobileMapOpen = signal(false);
  readonly showFilters = signal(false);
  readonly incidentCards = computed<IncidentCardVm[]>(() => this.store.incidents().map(mapIncidentListItemToCard));

  constructor() {
    this.hydrateFromUrl();
    this.syncUrl();
  }

  setIncidentsContainer(container: HTMLElement | null): void {
    this.incidentsContainer = container;
  }

  setFilters(filters: Parameters<IncidentsExplorerStore['setFilters']>[0]): void {
    this.store.setFilters(filters);
    this.scrollIncidentsContainerToTop();
  }

  clearFilters(): void {
    this.store.clearFilters();
    this.scrollIncidentsContainerToTop();
  }

  setPage(page: number): void {
    this.store.setPage(page);
    this.scrollIncidentsContainerToTop();
  }

  setSize(size: number): void {
    this.store.setSize(size);
    this.scrollIncidentsContainerToTop();
  }

  initMap(container: HTMLElement): void {
    this.mapFacade.setMap(this.leafletMapService.createMap(container, this.defaultCenter, this.defaultZoom));
    this.invalidateMapSizeSoon();
  }

  destroy(): void {
    if (!this.mapFacade.map()) {
      return;
    }

    this.mapFacade.destroy();
  }

  onIncidentCardClick(incidentId: string): void {
    this.mapFacade.selectedIncidentId.set(incidentId);
    this.mapFacade.flyToIncident(incidentId);

    if (window.innerWidth < 992) {
      this.openMobileMap();
    }
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  openMobileMap(): void {
    this.isMobileMapOpen.set(true);
    this.invalidateMapSizeSoon();
  }

  closeMobileMap(): void {
    this.isMobileMapOpen.set(false);
  }

  onViewportResize(): void {
    if (window.innerWidth >= 992 && this.isMobileMapOpen()) {
      this.isMobileMapOpen.set(false);
      this.mapFacade.map()?.invalidateSize();
    }
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
      const cleaned: Record<string, string | null> = { cityId: null };

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          cleaned[key] = value;
        }
      });

      void this.router.navigate([], {
        queryParams: cleaned,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  private invalidateMapSizeSoon(): void {
    requestAnimationFrame(() => {
      this.mapFacade.map()?.invalidateSize();
    });

    setTimeout(() => {
      this.mapFacade.map()?.invalidateSize();
    }, 200);
  }

  private scrollIncidentsContainerToTop(): void {
    if (!this.incidentsContainer) {
      return;
    }

    this.incidentsContainer.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
