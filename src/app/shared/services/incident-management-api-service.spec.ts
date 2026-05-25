import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { IncidentManagementApiService } from './incident-management-api-service';

describe('IncidentManagementApiService', () => {
  let service: IncidentManagementApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(IncidentManagementApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls status endpoint with PATCH and status body', () => {
    service.updateIncidentStatus('inc-1', 'RESOLVED').subscribe();

    const request = httpMock.expectOne(`${environment.API_BASE_URL}/incidents/inc-1/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'RESOLVED' });

    request.flush({});
  });

  it('calls priority endpoint with PATCH and priority body', () => {
    service.updateIncidentPriority('inc-2', 'HIGH').subscribe();

    const request = httpMock.expectOne(`${environment.API_BASE_URL}/incidents/inc-2/priority`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ priority: 'HIGH' });

    request.flush({});
  });

  it('calls delete endpoint with DELETE', () => {
    service.deleteIncident('inc-3').subscribe();

    const request = httpMock.expectOne(`${environment.API_BASE_URL}/incidents/inc-3`);
    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });
});
