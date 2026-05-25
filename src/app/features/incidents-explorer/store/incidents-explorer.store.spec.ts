import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CityContextService } from '../../../core/services/city-context-service';
import type { IncidentListItemDto } from '../../../shared/models/incident-dto.model';
import type { PagedResponseDto } from '../../../shared/models/paged-response.model';
import { PublicIncidentsApiService } from '../../../shared/services/public-incidents-api-service';
import { IncidentsExplorerStore } from './incidents-explorer.store';

describe('IncidentsExplorerStore', () => {
  const publicIncidentsApiMock = {
    getPublicIncidents: vi.fn(),
  };

  const cityContextMock = {
    citiesLoaded: vi.fn(() => true),
    selectedCityId: vi.fn(() => 'city-1'),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        IncidentsExplorerStore,
        { provide: PublicIncidentsApiService, useValue: publicIncidentsApiMock },
        { provide: CityContextService, useValue: cityContextMock },
      ],
    });
  });

  it('hydrates query params and loads incidents with city context', async () => {
    publicIncidentsApiMock.getPublicIncidents.mockReturnValue(of(buildResponse()));
    const store = TestBed.inject(IncidentsExplorerStore);

    store.hydrateFromQueryParams({
      q: '  lights  ',
      page: '1',
      size: '25',
      sort: 'createdAt,asc',
      status: 'UNDER_REVIEW',
    });
    store.reload();

    expect(publicIncidentsApiMock.getPublicIncidents).toHaveBeenCalled();
    const query = publicIncidentsApiMock.getPublicIncidents.mock.calls[0][0];
    expect(query.q).toBe('lights');
    expect(query.status).toBe('UNDER_REVIEW');
    expect(query.page).toBe(1);
    expect(query.size).toBe(25);
    expect(query.sort).toBe('createdAt,asc');
    expect(query.cityId).toBe('city-1');
    expect(store.totalElements()).toBe(1);
    expect(store.error()).toBeNull();
  });

  it('resets page when filters change and removes blank filter values', async () => {
    publicIncidentsApiMock.getPublicIncidents.mockReturnValue(of(buildResponse()));
    const store = TestBed.inject(IncidentsExplorerStore);

    store.hydrateFromQueryParams({ page: '3' });
    store.setFilters({ q: '   ', status: 'RESOLVED' });

    const lastCall = publicIncidentsApiMock.getPublicIncidents.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    const query = lastCall![0];
    expect(store.page()).toBe(0);
    expect(query.page).toBe(0);
    expect(query.q).toBeUndefined();
    expect(query.status).toBe('RESOLVED');
  });

  it('sets fallback error message when loading fails', async () => {
    publicIncidentsApiMock.getPublicIncidents.mockReturnValue(
      throwError(() => ({ error: { message: 'Backend unavailable' } })),
    );
    const store = TestBed.inject(IncidentsExplorerStore);

    store.hydrateFromQueryParams({});
    store.reload();

    expect(store.error()).toBe('Backend unavailable');
    expect(store.isLoading()).toBe(false);
  });
});

function buildResponse(): PagedResponseDto<IncidentListItemDto> {
  return {
    content: [
      {
        id: 'inc-1',
        title: 'Street light out',
        category: 'LIGHTING',
        status: 'UNDER_REVIEW',
        priority: 'MEDIUM',
        cityId: 'city-1',
        location: {
          lat: 41.38,
          lng: 2.17,
          geohash: 'sp3e3u',
          addressLabel: 'Main St',
          city: 'Barcelona',
        },
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-01-01T10:00:00.000Z',
      },
    ],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
    sort: [],
  };
}
