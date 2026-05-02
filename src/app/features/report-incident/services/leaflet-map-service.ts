import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class LeafletMapService {
  private readonly mapMarkers = new WeakMap<L.Map, L.CircleMarker>();

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

    const marker = L.circleMarker(location, {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#0455bf',
      fillOpacity: 1,
    }).addTo(map);

    this.mapMarkers.set(map, marker);
  }

  destroyMap(map: L.Map): void {
    this.mapMarkers.delete(map);
    map.remove();
  }
}
