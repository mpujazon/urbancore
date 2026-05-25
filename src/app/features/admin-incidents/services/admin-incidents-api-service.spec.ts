import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { AdminIncidentsApiService } from './admin-incidents-api-service';

describe('AdminIncidentsApiService', () => {
  let service: AdminIncidentsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminIncidentsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests admin incidents with serialized query params', () => {
    service
      .getAdminIncidents({
        page: 2,
        size: 25,
        sort: 'priority,desc',
        search: 'pothole',
        status: 'UNDER_REVIEW',
        category: 'POTHOLE',
        priority: 'HIGH',
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      })
      .subscribe();

    const request = httpMock.expectOne((req) => req.url === `${environment.API_BASE_URL}/admin/incidents`);

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('25');
    expect(request.request.params.get('sort')).toBe('priority,desc');
    expect(request.request.params.get('search')).toBe('pothole');
    expect(request.request.params.get('status')).toBe('UNDER_REVIEW');
    expect(request.request.params.get('category')).toBe('POTHOLE');
    expect(request.request.params.get('priority')).toBe('HIGH');
    expect(request.request.params.get('dateFrom')).toBe('2026-01-01');
    expect(request.request.params.get('dateTo')).toBe('2026-01-31');

    request.flush({ content: [], page: 2, size: 25, totalElements: 0, totalPages: 0 });
  });
});
