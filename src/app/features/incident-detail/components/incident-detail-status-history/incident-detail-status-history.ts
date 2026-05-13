import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import type { IncidentDetailStatusHistoryVm } from '../../../../shared/models/incident-vm.model';

@Component({
  selector: 'app-incident-detail-status-history',
  imports: [StatusPill],
  templateUrl: './incident-detail-status-history.html',
  styleUrl: './incident-detail-status-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailStatusHistoryComponent {
  readonly history = input.required<IncidentDetailStatusHistoryVm[]>();
}
