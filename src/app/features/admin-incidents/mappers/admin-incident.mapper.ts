import type { IncidentCategory, IncidentPriority, IncidentStatus } from '../../../shared/models/incident-dto.model';
import type { AdminIncidentListItemDto } from '../models/admin-incident-dto.model';
import type {
  AdminIncidentPriorityTone,
  AdminIncidentRowVm,
  AdminIncidentStatusTone,
} from '../models/admin-incident-vm.model';

const categoryLabels: Record<IncidentCategory, string> = {
  POTHOLE: 'Pothole',
  LIGHTING: 'Lighting',
  STREET_FURNITURE: 'Street Furniture',
  CLEANLINESS: 'Cleanliness',
  NOISE: 'Noise',
  GRAFFITI: 'Graffiti',
  OTHER: 'Other',
};

const statusLabels: Record<IncidentStatus, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const statusTones: Record<IncidentStatus, AdminIncidentStatusTone> = {
  NEW: 'info',
  UNDER_REVIEW: 'warning',
  PLANNED: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
};

const priorityLabels: Record<IncidentPriority, string> = {
  UNDEFINED: 'Unassigned',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const priorityTones: Record<IncidentPriority, AdminIncidentPriorityTone> = {
  UNDEFINED: 'neutral',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export function mapAdminIncidentDtoToVm(dto: AdminIncidentListItemDto): AdminIncidentRowVm {
  const priority = dto.priority ?? null;

  return {
    id: dto.id,
    shortId: createShortId(dto.id),
    title: dto.title,
    category: {
      value: dto.category,
      label: categoryLabels[dto.category],
    },
    status: {
      value: dto.status,
      label: statusLabels[dto.status],
      tone: statusTones[dto.status],
    },
    priority: {
      value: priority,
      label: priority ? priorityLabels[priority] : 'Unassigned',
      tone: priority ? priorityTones[priority] : 'neutral',
    },
    reporterLabel: dto.reporterDisplayName?.trim() || 'Unknown reporter',
    createdAtLabel: formatDate(dto.createdAt),
    linkedPlannedActionsCount: dto.linkedPlannedActionsCount ?? 0,
  };
}

function createShortId(id: string): string {
  const compactId = id.replaceAll('-', '');
  return `#${compactId.slice(0, 8).toUpperCase()}`;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
