import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  PlannedActionCalendarEventVm,
  PlannedActionsCalendarDayVm,
  PlannedActionsCalendarWeekVm,
  PlannedActionsDateRange,
  PlannedActionsViewMode,
} from '../../models/planned-action-vm.model';
import { toIsoDate } from '../../store/planned-actions.store';

@Component({
  selector: 'app-planned-actions-calendar',
  templateUrl: './planned-actions-calendar.html',
  styleUrl: './planned-actions-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannedActionsCalendar {
  events = input.required<PlannedActionCalendarEventVm[]>();
  range = input.required<PlannedActionsDateRange>();
  viewMode = input.required<PlannedActionsViewMode>();
  selectedEventId = input<string | null>(null);

  eventSelected = output<string>();

  readonly weeks = computed(() => buildCalendarWeeks(this.range(), this.events(), this.viewMode()));
  readonly agendaEvents = computed(() => this.events());

  selectEvent(event: PlannedActionCalendarEventVm): void {
    this.eventSelected.emit(event.id);
  }
}

function buildCalendarWeeks(
  range: PlannedActionsDateRange,
  events: PlannedActionCalendarEventVm[],
  viewMode: PlannedActionsViewMode,
): PlannedActionsCalendarWeekVm[] {
  const start = new Date(range.from);
  const end = new Date(range.to);

  if (viewMode === 'month') {
    start.setDate(start.getDate() - start.getDay());
    end.setDate(end.getDate() + (6 - end.getDay()));
  }

  const eventMap = new Map<string, PlannedActionCalendarEventVm[]>();
  events.forEach((event) => {
    const key = toIsoDate(event.startsAt);
    eventMap.set(key, [...(eventMap.get(key) ?? []), event]);
  });

  const days: PlannedActionsCalendarDayVm[] = [];
  const current = new Date(start);
  const todayIso = toIsoDate(new Date());

  while (current <= end) {
    const isoDate = toIsoDate(current);
    days.push({
      isoDate,
      dayNumber: current.getDate(),
      weekdayLabel: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(current),
      monthLabel: new Intl.DateTimeFormat('en', { month: 'short' }).format(current),
      isToday: isoDate === todayIso,
      isOutsideRange: current < range.from || current > range.to,
      events: eventMap.get(isoDate) ?? [],
    });
    current.setDate(current.getDate() + 1);
  }

  const weeks: PlannedActionsCalendarWeekVm[] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push({ id: days[index].isoDate, days: days.slice(index, index + 7) });
  }

  return weeks;
}
