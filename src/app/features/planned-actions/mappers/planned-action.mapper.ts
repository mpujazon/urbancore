import { PublicPlannedActionDto, PlannedActionStatus } from '../../../shared/models/planned-action.model';
import { PlannedActionCalendarEventVm, PlannedActionTone } from '../models/planned-action-vm.model';

const statusLabels: Record<PlannedActionStatus, string> = {
  PLANNED: 'Planned',
  CONFIRMED: 'Confirmed',
  DONE: 'Completed',
  CANCELLED: 'Cancelled',
};

const statusTones: Record<PlannedActionStatus, PlannedActionTone> = {
  PLANNED: 'info',
  CONFIRMED: 'warning',
  DONE: 'success',
  CANCELLED: 'neutral',
};

export function mapPublicPlannedActionToCalendarEvent(
  dto: PublicPlannedActionDto,
): PlannedActionCalendarEventVm {
  const startsAt = new Date(dto.scheduledStart);
  const endsAt = dto.scheduledEnd ? new Date(dto.scheduledEnd) : null;
  const incidentId = dto.incident?.id?.trim() || dto.incidentId;
  const incidentTitle = dto.incident?.title?.trim() || 'Linked incident';
  const addressLabel = dto.incident?.location?.addressLabel || dto.incident?.location?.area;

  return {
    id: dto.id,
    incidentId,
    title: dto.title.trim() || 'Planned maintenance action',
    description: dto.description?.trim() || 'No public description has been provided yet.',
    status: dto.status,
    statusLabel: statusLabels[dto.status],
    statusTone: statusTones[dto.status],
    startsAt,
    endsAt,
    dateLabel: formatDateLabel(startsAt),
    timeLabel: formatTimeLabel(startsAt, endsAt),
    incidentTitle,
    incidentCategoryLabel: dto.incident?.category ? toTitleCase(dto.incident.category) : undefined,
    incidentStatusLabel: dto.incident?.status ? toTitleCase(dto.incident.status) : undefined,
    addressLabel,
  };
}

export function mapPublicPlannedActionsToCalendarEvents(
  dtos: PublicPlannedActionDto[],
): PlannedActionCalendarEventVm[] {
  return dtos
    .map(mapPublicPlannedActionToCalendarEvent)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTimeLabel(startsAt: Date, endsAt: Date | null): string {
  const formatter = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const start = formatter.format(startsAt);

  if (!endsAt) {
    return start;
  }

  return `${start} - ${formatter.format(endsAt)}`;
}

function toTitleCase(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
