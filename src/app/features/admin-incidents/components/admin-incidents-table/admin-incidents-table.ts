import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { AdminIncidentSort, AdminIncidentSortField } from '../../models/admin-incident-query.model';
import type { AdminIncidentRowVm } from '../../models/admin-incident-vm.model';
import { AdminIncidentPriorityBadge } from '../admin-incident-priority-badge/admin-incident-priority-badge';
import { AdminIncidentStatusBadge } from '../admin-incident-status-badge/admin-incident-status-badge';

const sortableFields: AdminIncidentSortField[] = ['createdAt', 'title', 'category', 'priority', 'status'];

@Component({
  selector: 'app-admin-incidents-table',
  imports: [AdminIncidentPriorityBadge, AdminIncidentStatusBadge],
  templateUrl: './admin-incidents-table.html',
  styleUrl: './admin-incidents-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIncidentsTable {
  readonly rows = input.required<AdminIncidentRowVm[]>();
  readonly sort = input.required<AdminIncidentSort>();
  readonly refreshing = input.required<boolean>();

  readonly sortChange = output<AdminIncidentSort>();
  readonly viewDetails = output<string>();

  protected readonly skeletonRows = [1, 2, 3, 4, 5];
  protected readonly hasRows = computed(() => this.rows().length > 0);

  protected ariaSort(field: AdminIncidentSortField): 'ascending' | 'descending' | 'none' {
    const [activeField, direction] = this.sort().split(',');

    if (activeField !== field) {
      return 'none';
    }

    return direction === 'asc' ? 'ascending' : 'descending';
  }

  protected sortIcon(field: AdminIncidentSortField): string {
    const [activeField, direction] = this.sort().split(',');

    if (activeField !== field) {
      return '↕';
    }

    return direction === 'asc' ? '↑' : '↓';
  }

  protected onSort(field: AdminIncidentSortField): void {
    if (!sortableFields.includes(field)) {
      return;
    }

    const [activeField, direction] = this.sort().split(',');
    const nextDirection = activeField === field && direction === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit(`${field},${nextDirection}` as AdminIncidentSort);
  }
}
