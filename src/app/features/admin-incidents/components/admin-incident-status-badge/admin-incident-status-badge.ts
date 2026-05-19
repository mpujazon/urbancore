import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { AdminIncidentStatusTone } from '../../models/admin-incident-vm.model';

@Component({
  selector: 'app-admin-incident-status-badge',
  templateUrl: './admin-incident-status-badge.html',
  styleUrl: './admin-incident-status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIncidentStatusBadge {
  readonly label = input.required<string>();
  readonly tone = input.required<AdminIncidentStatusTone>();

  protected readonly badgeClass = computed(() => `status-badge status-badge--${this.tone()}`);
}
