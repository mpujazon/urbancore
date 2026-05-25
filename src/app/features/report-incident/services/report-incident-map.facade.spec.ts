import { TestBed } from '@angular/core/testing';
import * as L from 'leaflet';
import { LeafletMapService } from '../../../shared/services/leaflet-map-service';
import { ReportIncidentMapFacade } from './report-incident-map.facade';

describe('ReportIncidentMapFacade', () => {
  const leafletMapServiceMock = {
    createMarker: vi.fn(),
    destroyMap: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ReportIncidentMapFacade,
        { provide: LeafletMapService, useValue: leafletMapServiceMock },
      ],
    });
  });

  it('creates marker when no marker exists', () => {
    const facade = TestBed.inject(ReportIncidentMapFacade);
    const map = createRealMap();
    const marker = L.marker([41.38, 2.17]);

    leafletMapServiceMock.createMarker.mockReturnValue(marker);
    facade.setMap(map);

    facade.setMarker([41.39, 2.18]);

    expect(leafletMapServiceMock.createMarker).toHaveBeenCalledWith(map, [41.39, 2.18]);
    expect((facade.map() as L.Map).getZoom()).toBe(13);
  });

  it('updates existing marker position', () => {
    const facade = TestBed.inject(ReportIncidentMapFacade);
    const map = createRealMap();
    const marker = L.marker([41.38, 2.17]).addTo(map);

    leafletMapServiceMock.createMarker.mockReturnValue(marker);
    facade.setMap(map);
    facade.setMarker([41.38, 2.17]);
    facade.setMarker([41.39, 2.18]);

    expect(marker.getLatLng()).toEqual({ lat: 41.39, lng: 2.18 });
  });

  it('clears marker', () => {
    const facade = TestBed.inject(ReportIncidentMapFacade);
    const map = createRealMap();
    const marker = L.marker([41.38, 2.17]).addTo(map);

    leafletMapServiceMock.createMarker.mockReturnValue(marker);
    facade.setMap(map);
    facade.setMarker([41.38, 2.17]);
    facade.clearMarker();

    expect(() => marker.getLatLng()).not.toThrow();
  });

  it('destroys map and clears marker', () => {
    const facade = TestBed.inject(ReportIncidentMapFacade);
    const map = createRealMap();
    const marker = L.marker([41.38, 2.17]).addTo(map);

    leafletMapServiceMock.createMarker.mockReturnValue(marker);
    facade.setMap(map);
    facade.setMarker([41.38, 2.17]);
    facade.destroy();

    expect(leafletMapServiceMock.destroyMap).toHaveBeenCalledWith(map);
    expect(facade.map()).toBeNull();
  });
});

function createRealMap(): L.Map {
  return L.map(document.createElement('div'), { zoomControl: false }).setView([41.3874, 2.1686], 13);
}
