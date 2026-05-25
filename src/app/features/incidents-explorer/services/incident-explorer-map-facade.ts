import {computed, inject, Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {LeafletMapService} from '../../../shared/services/leaflet-map-service';
import {IncidentListItemDto} from '../../../shared/models/incident-dto.model';
import {IncidentsExplorerStore} from '../store/incidents-explorer.store';
import {Subscription} from 'rxjs';
import { buildIncidentMarkerPopupHtml } from '../helpers/incident-marker-popup.helper';
import * as L from 'leaflet';

@Injectable()
export class IncidentExplorerMapFacade {
  private readonly incidentMarkers = signal<Map<string, L.Marker>>(new Map());
  private readonly filteredIncidents = signal<IncidentListItemDto[]>([]);

  private readonly mapInstance = signal<L.Map | null>(null);
  readonly map = computed(()=> this.mapInstance())

  readonly selectedIncidentId = signal<string | null>(null);

  private readonly leafletMapService = inject(LeafletMapService);
  private readonly store = inject(IncidentsExplorerStore);
  private readonly router = inject(Router);
  private readonly syncSub: Subscription;

  constructor() {
    this.syncSub = toObservable(this.store.incidents)
      .subscribe((incidents) => this.setFilteredIncidents(incidents));
  }

  setMap(map: L.Map): void {
    this.mapInstance.set(map);
    this.syncMarkers(this.filteredIncidents());
  }

  setFilteredIncidents(incidents: IncidentListItemDto[]): void {
    this.filteredIncidents.set(incidents);
    this.syncMarkers(incidents);
  }

  flyToIncident(incidentId: string): void {
    const map = this.mapInstance();
    if (!map) return;

    const marker = this.incidentMarkers().get(incidentId);
    if (!marker) return;

    const latLng = marker.getLatLng();
    map.flyTo(latLng, Math.max(map.getZoom(), 17), {duration: 0.4});
    marker.openPopup();
  }

  private syncMarkers(incidents: IncidentListItemDto[]): void {
    const map = this.mapInstance();

    if (!map) {
      return;
    }

    const previous = this.incidentMarkers();
    const next = new Map<string, L.Marker>();
    const nextIds = new Set(incidents.map((incident) => incident.id));

    if (this.selectedIncidentId() !== null && !nextIds.has(this.selectedIncidentId()!)) {
      this.selectedIncidentId.set(null);
    }

    previous.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.remove();
      }
    });

    incidents.forEach((incident) => {
      const location: L.LatLngTuple = [incident.location.lat, incident.location.lng];
      const existingMarker = previous.get(incident.id);

      if (existingMarker) {
        existingMarker.setLatLng(location);
        this.attachPopup(existingMarker, incident);
        next.set(incident.id, existingMarker);
        return;
      }

      const marker = this.leafletMapService.createMarker(map, location);
      marker.bindPopup(buildIncidentMarkerPopupHtml(incident), {
        className: 'incident-marker-popup',
        closeButton: true,
        maxWidth: 280,
      });
      this.bindPopupLink(marker, incident.id);
      next.set(incident.id, marker);
    });

    this.incidentMarkers.set(next);
    this.fitToActiveMarkers();
  }

  private attachPopup(marker: L.Marker, incident: IncidentListItemDto): void {
    marker.unbindPopup();
    marker.bindPopup(buildIncidentMarkerPopupHtml(incident), {
      className: 'incident-marker-popup',
      closeButton: true,
      maxWidth: 280,
    });
    this.bindPopupLink(marker, incident.id);
  }

  private bindPopupLink(marker: L.Marker, incidentId: string): void {
    marker.off('popupopen');
    marker.on('popupopen', () => {
      const el = marker.getPopup()?.getElement();
      if (!el) return;
      const link = el.querySelector<HTMLAnchorElement>('.marker-popup-cta');
      if (link && !link.dataset['bound']) {
        link.dataset['bound'] = '1';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.router.navigate(['/incidents', incidentId]);
        });
      }
    });
  }

  private fitToActiveMarkers(): void {
    const map = this.mapInstance();
    if (!map) {
      return;
    }

    const markers = Array.from(this.incidentMarkers().values());
    if (markers.length === 0) {
      return;
    }

    if (markers.length === 1) {
      map.setView(markers[0].getLatLng(), Math.max(map.getZoom(), 15));
      return;
    }

    const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));
    map.fitBounds(bounds, {padding: [24, 24], maxZoom: 16});
  }

  clearMarkers(): void {
    this.incidentMarkers().forEach((marker) => marker.remove());
    this.incidentMarkers.set(new Map());
  }

  fitBounds(bounds: L.LatLngBoundsExpression, options?: L.FitBoundsOptions): void {
    const map = this.mapInstance();
    if (!map) {
      return;
    }

    map.fitBounds(bounds, options);
  }

  destroy(): void {
    this.syncSub.unsubscribe();
    this.clearMarkers();

    const map = this.mapInstance();
    if(!map){
      return;
    }

    this.leafletMapService.destroyMap(map);
    this.mapInstance.set(null);
  }
}
