import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CityContextService } from '../../../core/services/city-context-service';
import type { PublicPlannedActionDto } from '../../../shared/models/planned-action.model';
import { PlannedActionsApiService } from '../../../shared/services/planned-actions-api-service';
import { PlannedActionsStore } from './planned-actions.store';

describe('PlannedActionsStore', () => {
  const plannedActionsApiMock = {
    getPublicPlannedActions: vi.fn(),
  };

  const cityContextMock = {
    citiesLoaded: vi.fn(() => true),
    selectedCityId: vi.fn(() => 'city-1'),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        PlannedActionsStore,
        { provide: PlannedActionsApiService, useValue: plannedActionsApiMock },
        { provide: CityContextService, useValue: cityContextMock },
      ],
    });
  });

  it('hydrates and loads planned actions successfully', () => {
    plannedActionsApiMock.getPublicPlannedActions.mockReturnValue(of(buildPlannedActions()));
    const store = TestBed.inject(PlannedActionsStore);

    store.hydrateFromQueryParams({ view: 'month', from: '2026-01-01', to: '2026-01-31' });
    store.retry();

    expect(plannedActionsApiMock.getPublicPlannedActions).toHaveBeenCalled();
    const query = plannedActionsApiMock.getPublicPlannedActions.mock.calls[0][0];
    expect(query.dateFrom).toBe('2026-01-01');
    expect(query.dateTo).toBe('2026-01-31');
    expect(query.cityId).toBe('city-1');
    expect(store.hasError()).toBe(false);
    expect(store.events().length).toBe(1);
    expect(store.selectedEvent()?.id).toBe('pa-1');
  });

  it('sets error state when loading planned actions fails', () => {
    plannedActionsApiMock.getPublicPlannedActions.mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'Server unavailable' } })),
    );
    const store = TestBed.inject(PlannedActionsStore);

    store.hydrateFromQueryParams({ view: 'month' });
    store.retry();

    expect(store.hasError()).toBe(true);
    expect(store.error()?.message).toBe('Server unavailable');
  });

  it('builds query params from current range and view mode', () => {
    plannedActionsApiMock.getPublicPlannedActions.mockReturnValue(of([]));
    const store = TestBed.inject(PlannedActionsStore);

    store.hydrateFromQueryParams({ view: 'week', from: '2026-03-02', to: '2026-03-08' });
    const params = store.buildQueryParams();

    expect(params['view']).toBe('week');
    expect(params['from']).toBe('2026-03-02');
    expect(params['to']).toBe('2026-03-08');
  });
});

function buildPlannedActions(): PublicPlannedActionDto[] {
  return [
    {
      id: 'pa-1',
      incidentId: 'inc-1',
      title: 'Repair lamp',
      description: 'Electric team visit',
      status: 'PLANNED',
      scheduledStart: '2026-01-05T09:00:00.000Z',
      scheduledEnd: '2026-01-05T11:00:00.000Z',
      cityId: 'city-1',
      incident: {
        id: 'inc-1',
        title: 'Broken light',
        category: 'LIGHTING',
        status: 'UNDER_REVIEW',
        location: {
          addressLabel: 'Main St',
        },
      },
    },
  ];
}
