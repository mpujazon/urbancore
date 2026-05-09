import {computed, inject, Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {LeafletMapService} from '../../../shared/services/leaflet-map-service';
import {IncidentListItemDto} from '../../../shared/models/incident-dto.model';
import {formatCategory, formatStatus, getStatusStyleClass, getCategoryIcon} from '../../../shared/mappers/incident.mapper';
import {IncidentsExplorerStore} from '../store/incidents-explorer.store';
import {Subscription} from 'rxjs';
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
      marker.bindPopup(this.buildPopupHtml(incident), {
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
    marker.bindPopup(this.buildPopupHtml(incident), {
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

  private buildPopupHtml(incident: IncidentListItemDto): string {
    const date = new Date(incident.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const statusCls = getStatusStyleClass(incident.status);
    const categoryLabel = formatCategory(incident.category);
    const categoryIcon = getCategoryIcon(incident.category);
    const statusLabel = formatStatus(incident.status);

    const locationText = [incident.location?.addressLabel, incident.location?.city]
      .filter(Boolean)
      .join(', ');

    const imageSection = incident.thumbnailUrl
      ? `<div class="marker-popup-media">
           <img src="${incident.thumbnailUrl}" alt="${this.escapeHtml(incident.title)}" class="marker-popup-img" loading="lazy" />
           <span class="marker-popup-status-badge ${statusCls}">
             <span class="marker-popup-status-dot" aria-hidden="true"></span>${statusLabel}
           </span>
         </div>`
      : `<div class="marker-popup-media marker-popup-media--fallback">
           <div class="marker-popup-fallback">
             <i class="fa-solid ${categoryIcon}" aria-hidden="true"></i>
           </div>
           <span class="marker-popup-status-badge ${statusCls}">
             <span class="marker-popup-status-dot" aria-hidden="true"></span>${statusLabel}
           </span>
         </div>`;

    const locationSection = locationText
      ? `<div class="marker-popup-location">
           <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
           <span>${this.escapeHtml(locationText)}</span>
         </div>`
      : '';

    return `
      <article class="marker-popup-card">
        ${imageSection}
        <div class="marker-popup-body">
          <header class="marker-popup-header">
            <span class="marker-popup-category">${categoryLabel}</span>
          </header>
          <h3 class="marker-popup-title">${this.escapeHtml(incident.title)}</h3>
          ${locationSection}
          <time class="marker-popup-date" datetime="${incident.createdAt}">${date}</time>
          <footer class="marker-popup-footer">
            <a href="/incidents/${incident.id}" class="marker-popup-cta">
              View details
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </a>
          </footer>
        </div>
      </article>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
