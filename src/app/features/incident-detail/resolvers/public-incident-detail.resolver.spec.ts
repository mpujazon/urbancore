import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RedirectCommand, Router, UrlTree, convertToParamMap } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { PublicIncidentsApiService } from '../../../shared/services/public-incidents-api-service';
import { publicIncidentDetailResolver } from './public-incident-detail.resolver';

describe('publicIncidentDetailResolver', () => {
  const routerMock = {
    parseUrl: vi.fn((url: string) => ({ url } as unknown as UrlTree)),
  };

  const incidentsApiMock = {
    getPublicIncidentById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: PublicIncidentsApiService, useValue: incidentsApiMock },
      ],
    });
  });

  it('redirects to incidents list when route id is missing', () => {
    const route = { paramMap: convertToParamMap({}) } as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => publicIncidentDetailResolver(route, {} as never));

    expect(result).toBeInstanceOf(RedirectCommand);
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/incidents');
  });

  it('maps incident dto to detail vm on success', async () => {
    incidentsApiMock.getPublicIncidentById.mockReturnValue(of(buildIncidentDto()));
    const route = { paramMap: convertToParamMap({ id: 'inc-1' }) } as ActivatedRouteSnapshot;

    const result$ = TestBed.runInInjectionContext(() => publicIncidentDetailResolver(route, {} as never));
    const result = await firstValueFrom(result$ as ReturnType<typeof of>) as { rawId: string; header: { title: string } };

    expect(incidentsApiMock.getPublicIncidentById).toHaveBeenCalledWith('inc-1');
    expect(result.rawId).toBe('inc-1');
    expect(result.header.title).toBe('Broken light');
  });

  it('redirects to incidents list on 404', async () => {
    incidentsApiMock.getPublicIncidentById.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' })),
    );
    const route = { paramMap: convertToParamMap({ id: 'missing-id' }) } as ActivatedRouteSnapshot;

    const result$ = TestBed.runInInjectionContext(() => publicIncidentDetailResolver(route, {} as never));
    const result = await firstValueFrom(result$ as ReturnType<typeof of>);

    expect(result).toBeInstanceOf(RedirectCommand);
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/incidents');
  });
});

function buildIncidentDto() {
  return {
    id: 'inc-1',
    title: 'Broken light',
    description: 'Lamp is not working',
    category: 'LIGHTING',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    cityId: 'city-1',
    reporter: { id: 'citizen-1', displayName: 'Citizen', role: 'ROLE_CITIZEN' },
    location: { lat: 41.38, lng: 2.17, geohash: 'sp3e3u', addressLabel: 'Main St', city: 'Barcelona' },
    images: [],
    plannedActions: [],
    statusHistory: [],
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  };
}
