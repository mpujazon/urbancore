import { computed, inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import { LeafletMapService } from '../../../shared/services/leaflet-map-service';

@Injectable()
export class ReportIncidentMapFacade {
  private selectedMarker = signal<L.Marker | null>(null);
  private readonly mapInstance = signal<L.Map | null>(null);

  readonly map = computed(()=> this.mapInstance())

  private readonly leafletMapService = inject(LeafletMapService);

  setMap(map: L.Map): void {
    this.mapInstance.set(map);
  }

  setMarker(location: L.LatLngTuple, recenter = false): void {
    const marker = this.selectedMarker();
    const map = this.mapInstance();

    if(!map){
      return;
    }

    if (marker) {
      marker.setLatLng(location);
      if (recenter) {
        map.panTo(location);
      }
      return;
    }

    this.selectedMarker.set(this.leafletMapService.createMarker(map, location));
    if (recenter) {
      map.panTo(location);
    }
  }

  clearMarker(): void {
    const marker = this.selectedMarker();
    marker?.remove();
    this.selectedMarker.set(null);
  }

  fitBounds(bounds: L.LatLngBoundsExpression, options?: L.FitBoundsOptions): void {
    const map = this.mapInstance();
    if (!map) {
      return;
    }

    map.fitBounds(bounds, options);
  }

  destroy(): void {
    this.clearMarker();

    const map = this.mapInstance();
    if(!map){
      return;
    }

    this.leafletMapService.destroyMap(map);
    this.mapInstance.set(null);
  }
}
