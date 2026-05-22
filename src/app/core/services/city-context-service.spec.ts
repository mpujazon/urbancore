import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import type { CityDto } from '../../shared/models/city-dto.model';
import { CityContextService } from './city-context-service';

const STORAGE_KEY = 'urbancore:selected-city';
const CITIES: CityDto[] = [
  { id: 'city-1', name: 'Barcelona', slug: 'es-barcelona' },
  { id: 'city-2', name: 'Santa Coloma de Gramenet', slug: 'es-santa-coloma-de-gramenet' },
];

describe('CityContextService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should request and expose the available cities', () => {
    const service = TestBed.inject(CityContextService);

    flushCities();

    expect(service.availableCities()).toEqual(CITIES);
  });

  it('should persist a selected city', () => {
    const service = TestBed.inject(CityContextService);

    flushCities();
    service.selectCity(CITIES[0]);

    expect(service.selectedCity()).toEqual(CITIES[0]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(CITIES[0].id);
  });

  it('should restore a valid persisted city', () => {
    localStorage.setItem(STORAGE_KEY, CITIES[1].id);

    const service = TestBed.inject(CityContextService);

    flushCities();

    expect(service.selectedCity()).toEqual(CITIES[1]);
  });

  it('should discard an invalid persisted city', () => {
    localStorage.setItem(STORAGE_KEY, 'missing-city');

    const service = TestBed.inject(CityContextService);

    flushCities();

    expect(service.selectedCity()).toBeUndefined();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should clear the selected city and persistence', () => {
    const service = TestBed.inject(CityContextService);

    flushCities();
    service.selectCity(CITIES[0]);
    service.clearSelectedCity();

    expect(service.selectedCity()).toBeUndefined();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  function flushCities(cities = CITIES): void {
    const request = httpMock.expectOne(`${environment.API_BASE_URL}/cities`);

    expect(request.request.method).toBe('GET');
    request.flush(cities);
  }
});
