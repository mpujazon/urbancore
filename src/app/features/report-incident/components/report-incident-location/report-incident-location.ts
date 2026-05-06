import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal, output,
} from '@angular/core';
import * as L from 'leaflet';
import { LeafletMapService } from '../../../../shared/services/leaflet-map-service';

export interface IncidentCoordinates{
  lat: number;
  lng: number;
};

@Component({
  selector: 'app-report-incident-location',
  templateUrl: './report-incident-location.html',
  styleUrl: './report-incident-location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentLocation implements AfterViewInit, OnDestroy {
  private readonly leafletMapService = inject(LeafletMapService);

  @ViewChild('mapContainer', { static: true })
  private mapContainer?: ElementRef<HTMLElement>;

  protected readonly coordinates = signal('');
  protected readonly coordinatesChanged = output<IncidentCoordinates>();
  protected readonly isLocating = signal(false);
  protected readonly locationMessage = signal<string | null>(null);

  private map?: L.Map;
  private readonly defaultCenter: L.LatLngTuple = [41.3874, 2.1686];
  private readonly defaultZoom = 13;

  ngAfterViewInit(): void {
    if (!this.mapContainer) {
      return;
    }

    this.map = this.leafletMapService.createMap(
      this.mapContainer.nativeElement,
      this.defaultCenter,
      this.defaultZoom
    );

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.updateSelectedLocation([event.latlng.lat, event.latlng.lng], 'Location selected.');
    });

    requestAnimationFrame(() => {
      this.map?.invalidateSize();
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  ngOnDestroy(): void {
    if (!this.map) {
      return;
    }

    this.leafletMapService.destroyMap(this.map);
    this.map = undefined;
  }

  protected locateMe(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const map = this.map;

    this.locationMessage.set(null);

    if (!map) {
      this.locationMessage.set('The map is still loading. Please try again in a moment.');
      return;
    }

    if (!navigator.geolocation) {
      this.locationMessage.set('Geolocation is not available in this browser.');
      return;
    }

    this.isLocating.set(true);
    this.locationMessage.set('Requesting your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: L.LatLngTuple = [position.coords.latitude, position.coords.longitude];

        this.leafletMapService.setView(map, userLocation, 17);
        this.updateSelectedLocation(userLocation, 'Location updated.');
        this.isLocating.set(false);
      },
      (error) => {
        this.locationMessage.set(this.getGeolocationErrorMessage(error));
        this.isLocating.set(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  private getGeolocationErrorMessage(error: GeolocationPositionError): string {
    if (error.code === error.PERMISSION_DENIED) {
      return 'Location permission was denied. Enable location access in your browser to use this.';
    }

    if (error.code === error.POSITION_UNAVAILABLE) {
      return 'Your current location is unavailable. Please try again.';
    }

    if (error.code === error.TIMEOUT) {
      return 'Location request timed out. Please try again.';
    }

    return 'Could not get your current location. Please try again.';
  }

  private updateSelectedLocation(location: L.LatLngTuple, message: string): void {
    if (!this.map) {
      return;
    }

    this.leafletMapService.setMarker(this.map, location);
    this.coordinates.set(`${location[0].toFixed(5)}, ${location[1].toFixed(5)}`);
    this.coordinatesChanged.emit({lat: location[0], lng: location[1]});
    this.locationMessage.set(message);
  }
}
