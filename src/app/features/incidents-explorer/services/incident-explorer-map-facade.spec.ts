import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import type { IncidentListItemDto } from '../../../shared/models/incident-dto.model';
import { LeafletMapService } from '../../../shared/services/leaflet-map-service';
import { IncidentsExplorerStore } from '../store/incidents-explorer.store';
import { IncidentExplorerMapFacade } from './incident-explorer-map-facade';

describe('IncidentExplorerMapFacade', () => {
  let incidentsSignal: () => IncidentListItemDto[];
  const storeMock = {
    get incidents() {
      return incidentsSignal;
    },
  };

  const leafletMapServiceMock = {
    createMarker: vi.fn(),
    destroyMap: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    incidentsSignal = vi.fn(() => []) as unknown as () => IncidentListItemDto[];

    TestBed.configureTestingModule({
      providers: [
        IncidentExplorerMapFacade,
        { provide: IncidentsExplorerStore, useValue: storeMock },
        { provide: LeafletMapService, useValue: leafletMapServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('syncs markers when map and incidents are provided', () => {
    const facade = TestBed.inject(IncidentExplorerMapFacade);
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    const map = L.map(container, { zoomControl: false }).setView([41.3874, 2.1686], 13);
    const marker = L.marker([41.38, 2.17]);

    leafletMapServiceMock.createMarker.mockReturnValue(marker);
    facade.setMap(map);

    const incidents = [buildIncident('inc-1', 41.38, 2.17)];
    (incidentsSignal as ReturnType<typeof vi.fn>).mockReturnValue(incidents);
    facade.setFilteredIncidents(incidents);

    expect(leafletMapServiceMock.createMarker).toHaveBeenCalledWith(map, [41.38, 2.17]);
  });

  it('clears all markers on destroy', () => {
    const facade = TestBed.inject(IncidentExplorerMapFacade);
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    const map = L.map(container, { zoomControl: false }).setView([41.3874, 2.1686], 13);
    const marker = L.marker([41.38, 2.17]);
    marker.addTo(map);

    leafletMapServiceMock.createMarker.mockReturnValue(marker);
    facade.setMap(map);
    const incidents = [buildIncident('inc-1', 41.38, 2.17)];
    (incidentsSignal as ReturnType<typeof vi.fn>).mockReturnValue(incidents);
    facade.setFilteredIncidents(incidents);
    facade.clearMarkers();

    expect(() => marker.getLatLng()).not.toThrow();
  });
});

function buildIncident(id: string, lat: number, lng: number): IncidentListItemDto {
  return {
    id,
    title: `Incident ${id}`,
    category: 'LIGHTING',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    location: { lat, lng, geohash: 'sp3e3u', addressLabel: 'Main St', city: 'Barcelona' },
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  };
}
