import { PlannedActionStatus } from './planned-action-dto.model';

export type PlannedActionTone = 'info' | 'success' | 'warning' | 'neutral' | 'danger';
export type PlannedActionsViewMode = 'month' | 'week' | 'agenda';

export interface PlannedActionCalendarEventVm {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  status: PlannedActionStatus;
  statusLabel: string;
  statusTone: PlannedActionTone;
  startsAt: Date;
  endsAt: Date | null;
  dateLabel: string;
  timeLabel: string;
  incidentTitle: string;
  incidentCategoryLabel?: string;
  incidentStatusLabel?: string;
  addressLabel?: string;
  detailUrl: string;
}

export interface PlannedActionsDateRange {
  from: Date;
  to: Date;
}

export interface PlannedActionsCalendarDayVm {
  isoDate: string;
  dayNumber: number;
  weekdayLabel: string;
  monthLabel: string;
  isToday: boolean;
  isOutsideRange: boolean;
  events: PlannedActionCalendarEventVm[];
}

export interface PlannedActionsCalendarWeekVm {
  id: string;
  days: PlannedActionsCalendarDayVm[];
}
