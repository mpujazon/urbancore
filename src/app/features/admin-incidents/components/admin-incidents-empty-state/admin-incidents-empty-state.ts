import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-admin-incidents-empty-state',
  templateUrl: './admin-incidents-empty-state.html',
  styleUrl: './admin-incidents-empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIncidentsEmptyState {
  readonly activeFilterCount = input.required<number>();
  readonly clearFilters = output<void>();
}
