import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlannedActionCalendarEventVm } from '../../models/planned-action-vm.model';

@Component({
  selector: 'app-planned-action-detail-panel',
  imports: [RouterLink],
  templateUrl: './planned-action-detail-panel.html',
  styleUrl: './planned-action-detail-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannedActionDetailPanel {
  event = input<PlannedActionCalendarEventVm | null>(null);
}
