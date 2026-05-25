import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { PublicIncidentsApiService } from './public-incidents-api-service';

describe('PublicIncidentsApiService', () => {
  let service: PublicIncidentsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PublicIncidentsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests public incidents with normalized query params', () => {
    service
      .getPublicIncidents({
        q: '  pothole  ',
        status: 'UNDER_REVIEW',
        category: 'POTHOLE',
        priority: 'HIGH',
        from: '2026-01-01',
        to: '2026-01-31',
        cityId: 'city-1',
        page: 2,
        size: 25,
        sort: 'createdAt,asc',
      })
      .subscribe();

    const request = httpMock.expectOne((req) => req.url === `${environment.API_BASE_URL}/incidents`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('pothole');
    expect(request.request.params.get('status')).toBe('UNDER_REVIEW');
    expect(request.request.params.get('category')).toBe('POTHOLE');
    expect(request.request.params.get('priority')).toBe('HIGH');
    expect(request.request.params.get('from')).toBe('2026-01-01');
    expect(request.request.params.get('to')).toBe('2026-01-31');
    expect(request.request.params.get('cityId')).toBe('city-1');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sort')).toBe('createdAt,asc');

    request.flush({ content: [], page: 2, size: 25, totalElements: 0, totalPages: 0, first: false, last: true, sort: [] });
  });

  it('requests a single public incident by id', () => {
    service.getPublicIncidentById('inc-123').subscribe();

    const request = httpMock.expectOne(`${environment.API_BASE_URL}/incidents/inc-123`);
    expect(request.request.method).toBe('GET');

    request.flush({});
  });
});
