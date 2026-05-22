import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment.development';
import { ReverseGeocodingDto } from '../models/reverse-geocoding-dto.models';
import { ReverseGeocodingService } from './reverse-geocoding-service';

describe('ReverseGeocodingService', () => {
  let service: ReverseGeocodingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ReverseGeocodingService],
    });

    service = TestBed.inject(ReverseGeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request reverse geocoding info for the provided coordinates', () => {
    const lat = 41.3874;
    const lng = 2.1686;
    const mockResponse: ReverseGeocodingDto = {
      lat,
      lng,
      addressLabel: 'Plaça de Catalunya, Barcelona',
      addressLine1: 'Plaça de Catalunya',
      street: 'Plaça de Catalunya',
      houseNumber: '1',
      postcode: '08002',
      city: 'Barcelona',
      citySlug: 'es-barcelona',
      country: 'Spain',
      countryCode: 'ES',
      suburb: 'Eixample',
      provider: 'test-provider',
    };

    service.getAddressInfo(lat, lng).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const request = httpMock.expectOne(
      `${environment.API_BASE_URL}/geocoding/reverse?lat=${lat}&lng=${lng}`,
    );

    expect(request.request.method).toBe('GET');
    request.flush(mockResponse);
  });
});
