import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import type { IncidentDetailSummaryVm } from '../../../../shared/models/incident-vm.model';

@Component({
  selector: 'app-incident-detail-summary',
  imports: [StatusPill],
  templateUrl: './incident-detail-summary.html',
  styleUrl: './incident-detail-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailSummaryComponent {
  readonly summary = input.required<IncidentDetailSummaryVm>();
}
