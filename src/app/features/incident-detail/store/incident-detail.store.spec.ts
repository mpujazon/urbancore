import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { IncidentDto } from '../../../shared/models/incident-dto.model';
import type { IncidentDetailVm } from '../../../shared/models/incident-vm.model';
import { PermissionsService } from '../../../core/permissions/permissions-service';
import { AuthService } from '../../../core/services/auth-service';
import { ToastService } from '../../../core/services/toast-service';
import { CitizenIncidentsApiService } from '../../../shared/services/citizen-incidents-api-service';
import { IncidentManagementApiService } from '../../../shared/services/incident-management-api-service';
import { PlannedActionsApiService } from '../../../shared/services/planned-actions-api-service';
import { PublicIncidentsApiService } from '../../../shared/services/public-incidents-api-service';
import { IncidentDetailStore } from './incident-detail.store';

describe('IncidentDetailStore', () => {
  const routeData$ = new BehaviorSubject<{ incident: IncidentDetailVm }>({
    incident: buildIncidentVm(),
  });

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
  };

  const toastMock = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  };

  const authMock = {
    dbUser$: of(null),
    dbUser: vi.fn().mockReturnValue(null),
  };

  const permissionsMock = {
    canManageIncident: vi.fn().mockReturnValue(false),
    canDeleteIncident: vi.fn().mockReturnValue(false),
  };

  const incidentManagementApiMock = {
    updateIncidentStatus: vi.fn(),
    updateIncidentPriority: vi.fn(),
    deleteIncident: vi.fn(),
  };

  const citizenApiMock = {
    getSignedInCitizenIncidents: vi.fn().mockReturnValue(of([])),
  };

  const plannedActionsApiMock = {
    createPlannedAction: vi.fn(),
  };

  const publicIncidentsApiMock = {
    getPublicIncidentById: vi.fn(),
  };

  beforeEach(() => {
    routeData$.next({ incident: buildIncidentVm() });
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        IncidentDetailStore,
        {
          provide: ToastService,
          useValue: toastMock,
        },
        {
          provide: AuthService,
          useValue: authMock,
        },
        {
          provide: PermissionsService,
          useValue: permissionsMock,
        },
        {
          provide: IncidentManagementApiService,
          useValue: incidentManagementApiMock,
        },
        {
          provide: CitizenIncidentsApiService,
          useValue: citizenApiMock,
        },
        {
          provide: PlannedActionsApiService,
          useValue: plannedActionsApiMock,
        },
        {
          provide: PublicIncidentsApiService,
          useValue: publicIncidentsApiMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeData$.asObservable(),
            snapshot: {
              paramMap: convertToParamMap({ id: 'inc-1' }),
            },
          },
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });
  });

  it('blocks status updates when user cannot manage incident', () => {
    const store = TestBed.inject(IncidentDetailStore);

    permissionsMock.canManageIncident.mockReturnValue(false);

    store.onUpdateIncidentStatus('RESOLVED');

    expect(incidentManagementApiMock.updateIncidentStatus).not.toHaveBeenCalled();
    expect(toastMock.showError).toHaveBeenCalledWith('This incident cannot be modified.');
  });

  it('updates status and announces on successful mutation', () => {
    const updatedDto = buildIncidentDto({ status: 'RESOLVED' });
    incidentManagementApiMock.updateIncidentStatus.mockReturnValue(of(updatedDto));
    permissionsMock.canManageIncident.mockReturnValue(true);

    const store = TestBed.inject(IncidentDetailStore);
    store.onUpdateIncidentStatus('RESOLVED');

    expect(incidentManagementApiMock.updateIncidentStatus).toHaveBeenCalledWith('inc-1', 'RESOLVED');
    expect(store.statusChangeAnnouncement()).toBe('Incident status updated to Resolved.');
    expect(toastMock.showSuccess).toHaveBeenCalledWith('Incident status updated to Resolved.');
    expect(store.incident()?.status).toBe('RESOLVED');
  });

  it('does not call delete endpoint when user cancels confirmation', () => {
    permissionsMock.canDeleteIncident.mockReturnValue(true);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const store = TestBed.inject(IncidentDetailStore);
    store.onDeleteIncident();

    expect(incidentManagementApiMock.deleteIncident).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('deletes incident and navigates after confirmation', () => {
    permissionsMock.canDeleteIncident.mockReturnValue(true);
    incidentManagementApiMock.deleteIncident.mockReturnValue(of(void 0));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const store = TestBed.inject(IncidentDetailStore);
    store.onDeleteIncident();

    expect(incidentManagementApiMock.deleteIncident).toHaveBeenCalledWith('inc-1');
    expect(toastMock.showSuccess).toHaveBeenCalledWith('Incident deleted.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/incidents']);

    confirmSpy.mockRestore();
  });

  it('shows delete error toast when deletion fails', () => {
    permissionsMock.canDeleteIncident.mockReturnValue(true);
    incidentManagementApiMock.deleteIncident.mockReturnValue(throwError(() => new Error('delete failed')));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const store = TestBed.inject(IncidentDetailStore);
    store.onDeleteIncident();

    expect(toastMock.showError).toHaveBeenCalledWith('Could not delete incident.');

    confirmSpy.mockRestore();
  });
});

function buildIncidentVm(status: IncidentDetailVm['status'] = 'UNDER_REVIEW'): IncidentDetailVm {
  return {
    id: 'INC-INC1',
    rawId: 'inc-1',
    cityId: 'city-1',
    status,
    reporterId: 'citizen-1',
    header: {
      title: 'Broken light',
      categoryLabel: 'Lighting',
      statusLabel: 'Under Review',
      statusTone: 'is-review',
      createdAtLabel: 'Jan 01, 2026',
    },
    summary: {
      categoryLabel: 'Lighting',
      statusLabel: 'Under Review',
      statusTone: 'is-review',
      createdAtLabel: 'Jan 01, 2026',
    },
    description: 'Street light is broken',
    location: {
      lat: 41.38,
      lng: 2.17,
      coordinatesLabel: '41.3800° N, 2.1700° E',
      addressLabel: 'Main St',
      city: 'Barcelona',
    },
    images: [],
    statusHistory: [],
    plannedActions: [],
  };
}

function buildIncidentDto(partial: Partial<IncidentDto> = {}): IncidentDto {
  return {
    id: 'inc-1',
    title: 'Broken light',
    description: 'Street light is broken',
    category: 'LIGHTING',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    cityId: 'city-1',
    reporter: {
      id: 'citizen-1',
      displayName: 'Citizen',
      role: 'ROLE_CITIZEN',
    },
    location: {
      lat: 41.38,
      lng: 2.17,
      addressLabel: 'Main St',
      city: 'Barcelona',
      geohash: 'sp3e3u',
    },
    images: [],
    plannedActions: [],
    statusHistory: [],
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    ...partial,
  };
}
