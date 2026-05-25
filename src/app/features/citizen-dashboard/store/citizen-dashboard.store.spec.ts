import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { IncidentListItemDto } from '../../../shared/models/incident-dto.model';
import { CitizenIncidentsApiService } from '../../../shared/services/citizen-incidents-api-service';
import { CitizenDashboardStore } from './citizen-dashboard.store';

describe('CitizenDashboardStore', () => {
  const citizenIncidentsApiMock = {
    getSignedInCitizenIncidents: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        CitizenDashboardStore,
        { provide: CitizenIncidentsApiService, useValue: citizenIncidentsApiMock },
      ],
    });
  });

  it('loads incidents and computes totals on success', () => {
    citizenIncidentsApiMock.getSignedInCitizenIncidents.mockReturnValue(of(buildIncidents()));
    const store = TestBed.inject(CitizenDashboardStore);

    store.loadIncidents();

    expect(store.isSuccess()).toBe(true);
    expect(store.totalReported()).toBe(3);
    expect(store.totalResolved()).toBe(1);
    expect(store.hasIncidents()).toBe(true);
  });

  it('sets error state when loading incidents fails', () => {
    citizenIncidentsApiMock.getSignedInCitizenIncidents.mockReturnValue(
      throwError(() => new Error('failed')),
    );
    const store = TestBed.inject(CitizenDashboardStore);

    store.loadIncidents();

    expect(store.isError()).toBe(true);
    expect(store.error()).toBe('Could not load your incidents. Please try again.');
  });

  it('filters unresolved and resolved incidents correctly', () => {
    citizenIncidentsApiMock.getSignedInCitizenIncidents.mockReturnValue(of(buildIncidents()));
    const store = TestBed.inject(CitizenDashboardStore);

    store.loadIncidents();
    store.setFilter('UNRESOLVED');
    expect(store.filteredIncidents().every((incident) => incident.status !== 'RESOLVED')).toBe(true);

    store.setFilter('RESOLVED');
    expect(store.filteredIncidents().every((incident) => incident.status === 'RESOLVED')).toBe(true);
  });
});

function buildIncidents(): IncidentListItemDto[] {
  return [
    {
      id: 'inc-1',
      title: 'Broken light',
      category: 'LIGHTING',
      status: 'UNDER_REVIEW',
      priority: 'MEDIUM',
      location: { lat: 41.38, lng: 2.17, geohash: 'sp3e3u', addressLabel: 'Main St', city: 'Barcelona' },
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    },
    {
      id: 'inc-2',
      title: 'Pothole',
      category: 'POTHOLE',
      status: 'RESOLVED',
      priority: 'HIGH',
      location: { lat: 41.39, lng: 2.18, geohash: 'sp3e3v', addressLabel: 'Second St', city: 'Barcelona' },
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-03T10:00:00.000Z',
    },
    {
      id: 'inc-3',
      title: 'Graffiti',
      category: 'GRAFFITI',
      status: 'NEW',
      priority: 'LOW',
      location: { lat: 41.40, lng: 2.19, geohash: 'sp3e3w', addressLabel: 'Third St', city: 'Barcelona' },
      createdAt: '2026-01-04T10:00:00.000Z',
      updatedAt: '2026-01-04T10:00:00.000Z',
    },
  ];
}
