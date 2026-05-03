import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class LeafletMapService {
  private readonly mapMarkers = new WeakMap<L.Map, L.Marker>();
  private readonly selectedLocationIcon = L.divIcon({
    className: 'incident-selection-marker',
    html: '<span class="incident-selection-marker__pin"><span class="incident-selection-marker__center"></span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  createMap(container: HTMLElement, center: L.LatLngTuple, zoom: number): L.Map {
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
    }).setView(center, zoom);

    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    this.setMarker(map, center);

    return map;
  }

  setView(map: L.Map, center: L.LatLngTuple, zoom: number): void {
    map.setView(center, zoom);
  }

  setMarker(map: L.Map, location: L.LatLngTuple): void {
    const existingMarker = this.mapMarkers.get(map);

    if (existingMarker) {
      existingMarker.setLatLng(location);
      return;
    }

    const marker = L.marker(location, {
      icon: this.selectedLocationIcon,
      keyboard: false,
    }).addTo(map);

    this.mapMarkers.set(map, marker);
  }

  destroyMap(map: L.Map): void {
    this.mapMarkers.delete(map);
    map.remove();
  }
}
