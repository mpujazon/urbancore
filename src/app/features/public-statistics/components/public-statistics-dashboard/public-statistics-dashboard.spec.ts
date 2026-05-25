import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CityContextService } from '../../../../core/services/city-context-service';
import { environment } from '../../../../../environments/environment';
import { PublicStatisticsDashboard } from './public-statistics-dashboard';

describe('PublicStatisticsDashboard', () => {
  let httpMock: HttpTestingController;

  const cityContextMock = {
    citiesLoaded: vi.fn(() => true),
    selectedCityId: vi.fn(() => 'city-1'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicStatisticsDashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CityContextService, useValue: cityContextMock },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads incident summary on init with selected city', () => {
    const fixture = TestBed.createComponent(PublicStatisticsDashboard);
    fixture.detectChanges();

    const request = httpMock.expectOne((req) => req.url === `${environment.API_BASE_URL}/stats/incidents/summary`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('cityId')).toBe('city-1');

    request.flush({
      totalIncidents: 12,
      openIncidents: 5,
      resolvedIncidents: 6,
      plannedIncidents: 1,
      averageResolutionDays: 3,
      byStatus: [],
      byCategory: [],
      trend: [],
      byArea: [],
    });

    const component = fixture.componentInstance as unknown as {
      dashboardState: () => { status: string; error: string | null; data: { totalIncidents: number } };
    };

    expect(component.dashboardState().status).toBe('success');
    expect(component.dashboardState().error).toBeNull();
    expect(component.dashboardState().data.totalIncidents).toBe(12);
  });

  it('sets error state with fallback summary when request fails', () => {
    const fixture = TestBed.createComponent(PublicStatisticsDashboard);
    fixture.detectChanges();

    const request = httpMock.expectOne((req) => req.url === `${environment.API_BASE_URL}/stats/incidents/summary`);
    request.flush({ message: 'failed' }, { status: 500, statusText: 'Server Error' });

    const component = fixture.componentInstance as unknown as {
      dashboardState: () => { status: string; error: string | null; data: { totalIncidents: number } };
    };

    expect(component.dashboardState().status).toBe('error');
    expect(component.dashboardState().error).toBe('Could not load public statistics from the incidents summary endpoint.');
    expect(component.dashboardState().data.totalIncidents).toBe(0);
  });
});
