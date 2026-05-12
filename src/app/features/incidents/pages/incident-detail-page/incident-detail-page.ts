import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { IncidentDetailDescriptionComponent } from '../../components/incident-detail-description/incident-detail-description';
import { IncidentDetailGalleryComponent } from '../../components/incident-detail-gallery/incident-detail-gallery';
import { IncidentDetailHeaderComponent } from '../../components/incident-detail-header/incident-detail-header';
import { IncidentDetailLocationComponent } from '../../components/incident-detail-location/incident-detail-location';
import { IncidentDetailPlannedActionsComponent } from '../../components/incident-detail-planned-actions/incident-detail-planned-actions';
import { IncidentDetailStatusHistoryComponent } from '../../components/incident-detail-status-history/incident-detail-status-history';
import { IncidentDetailSummaryComponent } from '../../components/incident-detail-summary/incident-detail-summary';
import type { IncidentDetailVm } from '../../../../shared/models/incident-vm.model';

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
  ],
  templateUrl: './incident-detail-page.html',
  styleUrl: './incident-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly incident = signal<IncidentDetailVm | null>(null);
  protected readonly resolvedIncident = computed(() => this.incident());

  constructor() {
    this.route.data
      .pipe(
        map((data) => data['incident'] as IncidentDetailVm),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((incident) => this.incident.set(incident));
  }

  protected onBackToExplorer(): void {
    this.router.navigate(['/incidents']);
  }
}
