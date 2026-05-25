import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, catchError, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { PermissionsService } from '../../../core/permissions/permissions-service';
import { ToastService } from '../../../core/services/toast-service';
import type { IncidentPriority, IncidentStatus } from '../../../shared/models/incident-dto.model';
import type { IncidentDetailVm } from '../../../shared/models/incident-vm.model';
import { mapIncidentToDetailVm } from '../../../shared/mappers/incident.mapper';
import { CitizenIncidentsApiService } from '../../../shared/services/citizen-incidents-api-service';
import { IncidentManagementApiService } from '../../../shared/services/incident-management-api-service';
import { PlannedActionsApiService } from '../../../shared/services/planned-actions-api-service';
import { PublicIncidentsApiService } from '../../../shared/services/public-incidents-api-service';
import type { CurrentUser, IncidentPermissionContext } from '../../../core/permissions/permissions.model';
import type { PlannedActionCreatePayload } from '../components/incident-detail-controls/incident-detail-controls';

const CANNOT_MODIFY_MESSAGE = 'This incident cannot be modified.';

const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS: 'In Progress',
  PLANNED: 'Planned',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

@Injectable()
export class IncidentDetailStore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly citizenIncidentsApi = inject(CitizenIncidentsApiService);
  private readonly incidentManagementApi = inject(IncidentManagementApiService);
  private readonly plannedActionsApi = inject(PlannedActionsApiService);
  private readonly publicIncidentsApi = inject(PublicIncidentsApiService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(PermissionsService);

  readonly incident = signal<IncidentDetailVm | null>(null);
  readonly statusChangeAnnouncement = signal('');
  private readonly ownedIncidentIds = signal<Set<string>>(new Set<string>());
  readonly resolvedIncident = computed(() => this.incident());

  private readonly permissionUser = computed<CurrentUser | null>(() => {
    const dbUser = this.auth.dbUser();
    if (!dbUser) {
      return null;
    }

    return {
      id: dbUser.role === 'ROLE_CITIZEN' ? dbUser.firebaseUid : String(dbUser.id),
      role: dbUser.role,
    };
  });

  private readonly permissionIncident = computed<IncidentPermissionContext | null>(() => {
    const incident = this.incident();
    if (!incident) {
      return null;
    }

    return {
      id: incident.rawId,
      reporterId: this.ownedIncidentIds().has(incident.rawId) ? this.permissionUser()?.id : undefined,
      status: incident.status,
    };
  });

  readonly canManageIncident = computed(() => {
    return this.permissions.canManageIncident(this.permissionUser(), this.permissionIncident());
  });

  readonly canDeleteIncident = computed(() => {
    return this.permissions.canDeleteIncident(this.permissionUser(), this.permissionIncident());
  });

  constructor() {
    this.route.data
      .pipe(
        map((data) => data['incident'] as IncidentDetailVm),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((incident) => this.incident.set(incident));

    this.auth.dbUser$
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .pipe(
        switchMap((user) => {
          if (!user || user.role !== 'ROLE_CITIZEN') {
            return of(new Set<string>());
          }

          return this.citizenIncidentsApi.getSignedInCitizenIncidents().pipe(
            map((incidents) => new Set(incidents.map((item) => item.id))),
          );
        }),
      )
      .subscribe({
        next: (ownedIds) => this.ownedIncidentIds.set(ownedIds),
        error: () => this.ownedIncidentIds.set(new Set<string>()),
      });
  }

  onBackToExplorer(): void {
    void this.router.navigate(['/incidents']);
  }

  onUpdateIncidentStatus(status: IncidentStatus): void {
    if (!this.assertCanManageIncident()) {
      return;
    }

    this.incidentManagementApi
      .updateIncidentStatus(this.getApiIncidentId(), status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        this.createIncidentUpdateObserver(
          `Incident status updated to ${INCIDENT_STATUS_LABELS[status]}.`,
          'Could not update incident status.',
        ),
      );
  }

  onUpdateIncidentPriority(priority: IncidentPriority): void {
    if (!this.assertCanManageIncident()) {
      return;
    }

    this.incidentManagementApi
      .updateIncidentPriority(this.getApiIncidentId(), priority)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        this.createIncidentUpdateObserver('Incident priority updated.', 'Could not update incident priority.'),
      );
  }

  onCreatePlannedAction(payload: PlannedActionCreatePayload): void {
    if (!this.assertCanManageIncident()) {
      return;
    }

    const incidentId = this.getApiIncidentId();
    this.plannedActionsApi
      .createPlannedAction({
        incidentId,
        title: payload.title,
        description: payload.description,
        scheduledStart: this.toInstant(payload.scheduledStart),
        scheduledEnd: payload.scheduledEnd ? this.toInstant(payload.scheduledEnd) : undefined,
      })
      .pipe(
        switchMap(() => {
          return this.incidentManagementApi.updateIncidentStatus(incidentId, 'PLANNED').pipe(
            catchError(() => {
              this.toast.showError('Planned action was created, but incident status could not be changed to Planned.');
              return of(null);
            }),
          );
        }),
        switchMap(() => {
          this.toast.showSuccess('Planned action created successfully.');
          return this.publicIncidentsApi.getPublicIncidentById(incidentId).pipe(
            catchError(() => {
              this.toast.showError('Planned action was created, but incident refresh failed.');
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedIncident) => this.incident.set(mapIncidentToDetailVm(updatedIncident)),
        error: () => this.toast.showError('Could not create planned action.'),
      });
  }

  onDeleteIncident(): void {
    if (!this.canDeleteIncident()) {
      this.toast.showError('You are not allowed to delete this incident.');
      return;
    }

    const confirmed = window.confirm('Delete this incident permanently?');
    if (!confirmed) {
      return;
    }

    this.incidentManagementApi
      .deleteIncident(this.getApiIncidentId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.showSuccess('Incident deleted.');
          void this.router.navigate(['/incidents']);
        },
        error: () => this.toast.showError('Could not delete incident.'),
      });
  }

  private getApiIncidentId(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }

  private assertCanManageIncident(): boolean {
    if (this.canManageIncident()) {
      return true;
    }

    this.toast.showError(CANNOT_MODIFY_MESSAGE);
    return false;
  }

  private createIncidentUpdateObserver(successMessage: string, errorMessage: string): {
    next: (updatedIncident: Parameters<typeof mapIncidentToDetailVm>[0]) => void;
    error: () => void;
  } {
    return {
      next: (updatedIncident) => {
        this.incident.set(mapIncidentToDetailVm(updatedIncident));
        this.statusChangeAnnouncement.set(successMessage);
        this.toast.showSuccess(successMessage);
      },
      error: () => {
        this.statusChangeAnnouncement.set(errorMessage);
        this.toast.showError(errorMessage);
      },
    };
  }

  private toInstant(localDateTime: string): string {
    return new Date(localDateTime).toISOString();
  }
}
