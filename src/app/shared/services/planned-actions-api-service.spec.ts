import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { PlannedActionsApiService } from './planned-actions-api-service';

describe('PlannedActionsApiService', () => {
  let service: PlannedActionsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PlannedActionsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests planned actions with date range and optional cityId', () => {
    service
      .getPublicPlannedActions({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
        cityId: 'city-1',
      })
      .subscribe();

    const request = httpMock.expectOne((req) => req.url === `${environment.API_BASE_URL}/planned-actions`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('dateFrom')).toBe('2026-01-01');
    expect(request.request.params.get('dateTo')).toBe('2026-01-31');
    expect(request.request.params.get('cityId')).toBe('city-1');

    request.flush([]);
  });

  it('creates a planned action with POST payload', () => {
    const payload = {
      incidentId: 'inc-123',
      title: 'Repair pavement',
      description: 'Repair team scheduled',
      scheduledStart: '2026-02-01T10:00:00.000Z',
      scheduledEnd: '2026-02-01T12:00:00.000Z',
    };

    service.createPlannedAction(payload).subscribe();

    const request = httpMock.expectOne(`${environment.API_BASE_URL}/planned-actions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({});
  });
});
