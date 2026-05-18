import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StatusPill } from '../../../../shared/components/status-pill/status-pill';
import type { IncidentDetailHeaderVm } from '../../../../shared/models/incident-vm.model';

@Component({
  selector: 'app-incident-detail-header',
  imports: [StatusPill],
  templateUrl: './incident-detail-header.html',
  styleUrl: './incident-detail-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailHeaderComponent {
  readonly header = input.required<IncidentDetailHeaderVm>();
  readonly incidentId = input.required<string>();
  readonly back = output<void>();
}
