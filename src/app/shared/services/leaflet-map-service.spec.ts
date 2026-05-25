import { LeafletMapService } from './leaflet-map-service';

describe('LeafletMapService', () => {
  let service: LeafletMapService;

  beforeEach(() => {
    service = new LeafletMapService();
  });

  it('creates a map instance with tile layer', () => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';

    const map = service.createMap(container, [41.3874, 2.1686], 13);

    expect(map).toBeDefined();
    expect(map.getZoom()).toBe(13);
  });

  it('disables interactions in readonly mode', () => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';

    const map = service.createMap(container, [41.3874, 2.1686], 13, true);

    expect(map.dragging.enabled()).toBe(false);
    expect(map.scrollWheelZoom.enabled()).toBe(false);
  });

  it('creates a marker and adds it to the map', () => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    const map = service.createMap(container, [41.3874, 2.1686], 13);

    const marker = service.createMarker(map, [41.39, 2.17]);

    expect(marker).toBeDefined();
    expect(marker.getLatLng()).toEqual({ lat: 41.39, lng: 2.17 });
  });

  it('removes a marker', () => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    const map = service.createMap(container, [41.3874, 2.1686], 13);
    const marker = service.createMarker(map, [41.39, 2.17]);

    service.removeMarker(marker);

    expect(() => marker.getLatLng()).not.toThrow();
  });

  it('destroys a map', () => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    const map = service.createMap(container, [41.3874, 2.1686], 13);

    service.destroyMap(map);

    expect(container.querySelector('.leaflet-container')).toBeNull();
  });

  it('sets view on an existing map', () => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    const map = service.createMap(container, [41.3874, 2.1686], 13);

    service.setView(map, [41.39, 2.17], 15);

    expect(map.getZoom()).toBe(15);
    expect(map.getCenter()).toEqual({ lat: 41.39, lng: 2.17 });
  });
});
