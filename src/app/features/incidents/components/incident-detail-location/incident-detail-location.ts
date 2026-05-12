import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { IncidentDetailLocationVm } from '../../../../shared/models/incident-vm.model';

@Component({
  selector: 'app-incident-detail-location',
  templateUrl: './incident-detail-location.html',
  styleUrl: './incident-detail-location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailLocationComponent {
  readonly location = input.required<IncidentDetailLocationVm>();
}
