import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class LeafletMapService {
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

    return map;
  }

  setView(map: L.Map, center: L.LatLngTuple, zoom: number): void {
    map.setView(center, zoom);
  }
  createMarker(map: L.Map, location: L.LatLngTuple, options?: L.MarkerOptions): L.Marker{
    return L.marker(location, {
      icon: this.selectedLocationIcon,
      keyboard: false,
      ...options
    }).addTo(map);
  }


  removeMarker(marker: L.Marker): void{
    marker.remove();
  }

  fitBounds(map: L.Map, bounds: L.LatLngBoundsExpression, options?: L.FitBoundsOptions): void{
    map.fitBounds(bounds, {
      animate: true,
      padding: [24, 24],
      ...options
    });
  }

  destroyMap(map: L.Map): void {
    map.remove();
  }
}
