import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as L from 'leaflet';
import { of } from 'rxjs';
import { IncidentCoordinates } from '../../../../shared/models/incident-dto.model';
import { LeafletMapService } from '../../../../shared/services/leaflet-map-service';
import { ReverseGeocodingDto } from '../../models/reverse-geocoding-dto.models';
import { ReverseGeocodingService } from '../../services/reverse-geocoding-service';
import { ReportIncidentLocation } from './report-incident-location';

type MapClickHandler = (event: L.LeafletMouseEvent) => void;

@Component({
  imports: [ReportIncidentLocation],
  template: `
    <app-report-incident-location
      (coordinatesChanged)="selectedCoordinates = $event"
    />
  `,
})
class TestHostComponent {
  selectedCoordinates?: IncidentCoordinates;
}

describe('ReportIncidentLocation integration', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let mapClickHandler: MapClickHandler | undefined;

  const mockMap = {
    on: vi.fn((eventName: string, handler: MapClickHandler) => {
      if (eventName === 'click') {
        mapClickHandler = handler;
      }
    }),
    invalidateSize: vi.fn(),
    panTo: vi.fn(),
  };

  const mockMarker = {
    remove: vi.fn(),
    setLatLng: vi.fn(),
  };

  const leafletMapServiceMock = {
    createMap: vi.fn(() => mockMap as unknown as L.Map),
    createMarker: vi.fn(() => mockMarker as unknown as L.Marker),
    destroyMap: vi.fn(),
    setView: vi.fn(),
  };

  const reverseGeocodingServiceMock = {
    getAddressInfo: vi.fn(),
  };

  beforeEach(async () => {
    mapClickHandler = undefined;
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: LeafletMapService, useValue: leafletMapServiceMock },
        { provide: ReverseGeocodingService, useValue: reverseGeocodingServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
  });

  it('should create the map on init and register map click selection', () => {
    fixture.detectChanges();

    expect(leafletMapServiceMock.createMap).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      [41.3874, 2.1686],
      13,
    );
    expect(mockMap.on).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mapClickHandler).toBeDefined();
  });

  it('should select map click location, resolve its address, and emit coordinates', () => {
    const lat = 41.39012;
    const lng = 2.15456;
    const mockAddress: ReverseGeocodingDto = {
      lat,
      lng,
      addressLabel: 'Carrer de Mallorca, Barcelona',
      addressLine1: 'Carrer de Mallorca',
      street: 'Carrer de Mallorca',
      houseNumber: '401',
      postcode: '08013',
      city: 'Barcelona',
      country: 'Spain',
      countryCode: 'ES',
      suburb: 'Eixample',
      provider: 'test-provider',
    };

    reverseGeocodingServiceMock.getAddressInfo.mockReturnValue(of(mockAddress));

    fixture.detectChanges();
    mapClickHandler?.({ latlng: { lat, lng } } as L.LeafletMouseEvent);
    fixture.detectChanges();

    expect(reverseGeocodingServiceMock.getAddressInfo).toHaveBeenCalledWith(lat, lng);
    expect(leafletMapServiceMock.createMarker).toHaveBeenCalledWith(mockMap, [lat, lng]);
    expect(mockMap.panTo).toHaveBeenCalledWith([lat, lng]);
    expect(hostComponent.selectedCoordinates).toEqual({ lat, lng });
    expect(fixture.nativeElement.textContent).toContain('Location selected.');
    expect(fixture.nativeElement.textContent).toContain('Carrer de Mallorca, Barcelona');
    expect(fixture.nativeElement.textContent).toContain('Eixample');
  });
});
