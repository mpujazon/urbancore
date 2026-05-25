import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IncidentDetailDescriptionComponent } from '../../components/incident-detail-description/incident-detail-description';
import { IncidentDetailControlsComponent } from '../../components/incident-detail-controls/incident-detail-controls';
import { IncidentDetailGalleryComponent } from '../../components/incident-detail-gallery/incident-detail-gallery';
import { IncidentDetailHeaderComponent } from '../../components/incident-detail-header/incident-detail-header';
import { IncidentDetailLocationComponent } from '../../components/incident-detail-location/incident-detail-location';
import { IncidentDetailPlannedActionsComponent } from '../../components/incident-detail-planned-actions/incident-detail-planned-actions';
import { IncidentDetailStatusHistoryComponent } from '../../components/incident-detail-status-history/incident-detail-status-history';
import { IncidentDetailSummaryComponent } from '../../components/incident-detail-summary/incident-detail-summary';
import { IncidentDetailStore } from '../../store/incident-detail.store';

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
  providers: [IncidentDetailStore],
})
export class IncidentDetailPageComponent {
  protected readonly store = inject(IncidentDetailStore);
}
