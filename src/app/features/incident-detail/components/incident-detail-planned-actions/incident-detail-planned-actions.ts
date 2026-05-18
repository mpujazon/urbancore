import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import type { IncidentDetailPlannedActionVm } from '../../../../shared/models/incident-vm.model';

@Component({
  selector: 'app-incident-detail-planned-actions',
  imports: [StatusPill],
  templateUrl: './incident-detail-planned-actions.html',
  styleUrl: './incident-detail-planned-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailPlannedActionsComponent {
  readonly plannedActions = input.required<IncidentDetailPlannedActionVm[]>();
}
