import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlannedActionsViewMode } from '../../models/planned-action-vm.model';

@Component({
  selector: 'app-planned-actions-toolbar',
  templateUrl: './planned-actions-toolbar.html',
  styleUrl: './planned-actions-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannedActionsToolbar {
  rangeLabel = input.required<string>();
  viewMode = input.required<PlannedActionsViewMode>();
  isLoading = input(false);

  previousRange = output<void>();
  nextRange = output<void>();
  currentRange = output<void>();
  viewModeChanged = output<PlannedActionsViewMode>();

  readonly viewModes: { value: PlannedActionsViewMode; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'agenda', label: 'Agenda' },
  ];

  onViewModeChange(viewMode: PlannedActionsViewMode): void {
    this.viewModeChanged.emit(viewMode);
  }
}
