import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import type { IncidentCardVm } from '../../../shared/models/incident-vm.model';
import { LeafletMapService } from '../../../shared/services/leaflet-map-service';
import { IncidentsExplorerStore } from '../store/incidents-explorer.store';
import { buildIncidentsExplorerQueryParams } from '../helpers/incidents-explorer-query.helper';
import { IncidentExplorerPageFacade } from './incident-explorer-page.facade';
import { IncidentExplorerMapFacade } from './incident-explorer-map-facade';

describe('IncidentExplorerPageFacade', () => {
  const mockQueryParams: Record<string, string> = {};

  const storeMock = {
    hydrateFromQueryParams: vi.fn(),
    setFilters: vi.fn(),
    clearFilters: vi.fn(),
    setPage: vi.fn(),
    setSize: vi.fn(),
    buildQueryParams: vi.fn().mockReturnValue({}),
    incidents: vi.fn(() => []),
    isLoading: vi.fn(() => false),
    totalPages: vi.fn(() => 0),
    totalElements: vi.fn(() => 0),
  };

  const mapFacadeMock = {
    setMap: vi.fn(),
    map: vi.fn(() => null),
    destroy: vi.fn(),
  };

  const leafletMapServiceMock = {
    createMap: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
  };

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: {
        keys: [] as string[],
        get: vi.fn((key: string) => mockQueryParams[key]),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockQueryParams).forEach((key) => delete mockQueryParams[key]);

    TestBed.configureTestingModule({
      providers: [
        IncidentExplorerPageFacade,
        { provide: IncidentsExplorerStore, useValue: storeMock },
        { provide: IncidentExplorerMapFacade, useValue: mapFacadeMock },
        { provide: LeafletMapService, useValue: leafletMapServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });
  });

  it('hydrates store from URL query params on construction', () => {
    mockQueryParams['q'] = 'pothole';
    mockQueryParams['status'] = 'RESOLVED';
    activatedRouteMock.snapshot.queryParamMap.keys = ['q', 'status'];

    const facade = TestBed.inject(IncidentExplorerPageFacade);

    expect(storeMock.hydrateFromQueryParams).toHaveBeenCalledWith({
      q: 'pothole',
      status: 'RESOLVED',
    });
    expect(facade).toBeTruthy();
  });

  it('delegates filter changes to store', () => {
    const facade = TestBed.inject(IncidentExplorerPageFacade);

    facade.setFilters({ status: 'NEW' });

    expect(storeMock.setFilters).toHaveBeenCalledWith({ status: 'NEW' });
  });

  it('delegates pagination to store', () => {
    const facade = TestBed.inject(IncidentExplorerPageFacade);

    facade.setPage(2);
    facade.setSize(25);

    expect(storeMock.setPage).toHaveBeenCalledWith(2);
    expect(storeMock.setSize).toHaveBeenCalledWith(25);
  });

  it('initializes map and sets it on map facade', () => {
    const map = L.map(document.createElement('div'), { zoomControl: false }).setView([41.3874, 2.1686], 13);
    leafletMapServiceMock.createMap.mockReturnValue(map);
    mapFacadeMock.map.mockReturnValue(null);

    const facade = TestBed.inject(IncidentExplorerPageFacade);
    const container = document.createElement('div');
    facade.initMap(container);

    expect(leafletMapServiceMock.createMap).toHaveBeenCalled();
    expect(mapFacadeMock.setMap).toHaveBeenCalledWith(map);
  });
});
