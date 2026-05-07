import {computed, inject, Injectable, signal} from '@angular/core';
import {LeafletMapService} from '../../../shared/services/leaflet-map-service';
import {IncidentDto} from '../../../shared/models/IncidentInterface';
import * as L from 'leaflet';

@Injectable()
export class IncidentExplorerMapFacade {
  private readonly incidentMarkers = signal<Map<string, L.Marker>>(new Map());
  private readonly filteredIncidents = signal<IncidentDto[]>([]);

  private readonly mapInstance = signal<L.Map | null>(null);
  readonly map = computed(()=> this.mapInstance())

  private readonly leafletMapService = inject(LeafletMapService);

  setMap(map: L.Map): void {
    this.mapInstance.set(map);
    this.syncMarkers(this.filteredIncidents());
  }

  setFilteredIncidents(incidents: IncidentDto[]): void {
    this.filteredIncidents.set(incidents);
    this.syncMarkers(incidents);
  }

  private syncMarkers(incidents: IncidentDto[]): void {
    const map = this.mapInstance();

    if (!map) {
      return;
    }

    const previous = this.incidentMarkers();
    const next = new Map<string, L.Marker>();
    const nextIds = new Set(incidents.map((incident) => incident.id));

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
        next.set(incident.id, existingMarker);
        return;
      }

      next.set(incident.id, this.leafletMapService.createMarker(map, location));
    });

    this.incidentMarkers.set(next);
    this.fitToActiveMarkers();
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
    this.clearMarkers();

    const map = this.mapInstance();
    if(!map){
      return;
    }

    this.leafletMapService.destroyMap(map);
    this.mapInstance.set(null);
  }
}
