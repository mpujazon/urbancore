import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, catchError, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';
import { PermissionsService } from '../../../../core/permissions/permissions-service';
import { ToastService } from '../../../../core/services/toast-service';
import { IncidentDetailDescriptionComponent } from '../../components/incident-detail-description/incident-detail-description';
import {
  IncidentDetailControlsComponent,
  PlannedActionCreatePayload,
} from '../../components/incident-detail-controls/incident-detail-controls';
import { IncidentDetailGalleryComponent } from '../../components/incident-detail-gallery/incident-detail-gallery';
import { IncidentDetailHeaderComponent } from '../../components/incident-detail-header/incident-detail-header';
import { IncidentDetailLocationComponent } from '../../components/incident-detail-location/incident-detail-location';
import { IncidentDetailPlannedActionsComponent } from '../../components/incident-detail-planned-actions/incident-detail-planned-actions';
import { IncidentDetailStatusHistoryComponent } from '../../components/incident-detail-status-history/incident-detail-status-history';
import { IncidentDetailSummaryComponent } from '../../components/incident-detail-summary/incident-detail-summary';
import { mapIncidentToDetailVm } from '../../../../shared/mappers/incident.mapper';
import type { IncidentPriority, IncidentStatus } from '../../../../shared/models/incident-dto.model';
import type { IncidentDetailVm } from '../../../../shared/models/incident-vm.model';
import { CitizenIncidentsApiService } from '../../../../shared/services/citizen-incidents-api-service';
import { IncidentManagementApiService } from '../../../../shared/services/incident-management-api-service';
import { PlannedActionsApiService } from '../../../../shared/services/planned-actions-api-service';
import { PublicIncidentsApiService } from '../../../../shared/services/public-incidents-api-service';
import type { CurrentUser, IncidentPermissionContext } from '../../../../core/permissions/permissions.model';

const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS: 'In Progress',
  PLANNED: 'Planned',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

@Component({
  selector: 'app-incident-detail-page',
  imports: [
    IncidentDetailHeaderComponent,
    IncidentDetailDescriptionComponent,
    IncidentDetailGalleryComponent,
    IncidentDetailLocationComponent,
    IncidentDetailStatusHistoryComponent,
    IncidentDetailPlannedActionsComponent,
    IncidentDetailSummaryComponent,
    IncidentDetailControlsComponent,
  ],
  templateUrl: './incident-detail-page.html',
  styleUrl: './incident-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailPageComponent {
  private static readonly CANNOT_MODIFY_MESSAGE = 'This incident cannot be modified.';

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

  protected readonly incident = signal<IncidentDetailVm | null>(null);
  protected readonly statusChangeAnnouncement = signal('');
  private readonly ownedIncidentIds = signal<Set<string>>(new Set<string>());
  protected readonly resolvedIncident = computed(() => this.incident());
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
  protected readonly canManageIncident = computed(() => {
    return this.permissions.canManageIncident(this.permissionUser(), this.permissionIncident());
  });
  protected readonly canDeleteIncident = computed(() => {
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

  protected onBackToExplorer(): void {
    this.router.navigate(['/incidents']);
  }

  protected onUpdateIncidentStatus(status: IncidentStatus): void {
    if (!this.assertCanManageIncident()) {
      return;
    }

    this.incidentManagementApi
      .updateIncidentStatus(this.getApiIncidentId(), status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.createIncidentUpdateObserver(
        `Incident status updated to ${INCIDENT_STATUS_LABELS[status]}.`,
        'Could not update incident status.',
      ));
  }

  protected onUpdateIncidentPriority(priority: IncidentPriority): void {
    if (!this.assertCanManageIncident()) {
      return;
    }

    this.incidentManagementApi
      .updateIncidentPriority(this.getApiIncidentId(), priority)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.createIncidentUpdateObserver('Incident priority updated.', 'Could not update incident priority.'));
  }

  protected onCreatePlannedAction(payload: PlannedActionCreatePayload): void {
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

  protected onDeleteIncident(): void {
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
          this.router.navigate(['/incidents']);
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

    this.toast.showError(IncidentDetailPageComponent.CANNOT_MODIFY_MESSAGE);
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
