import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { AdminIncidentPriorityTone } from '../../models/admin-incident-vm.model';

@Component({
  selector: 'app-admin-incident-priority-badge',
  templateUrl: './admin-incident-priority-badge.html',
  styleUrl: './admin-incident-priority-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIncidentPriorityBadge {
  readonly label = input.required<string>();
  readonly tone = input.required<AdminIncidentPriorityTone>();

  protected readonly badgeClass = computed(() => `priority-badge priority-badge--${this.tone()}`);
}
