import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { mapPublicPlannedActionsToCalendarEvents } from '../mappers/planned-action.mapper';
import { ApiError } from '../models/planned-action-dto.model';
import {
  PlannedActionCalendarEventVm,
  PlannedActionsDateRange,
  PlannedActionsViewMode,
} from '../models/planned-action-vm.model';
import { PlannedActionsApiService } from '../services/planned-actions-api-service';

type ResourceState<T> = {
  data: T;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: ApiError | null;
  lastUpdatedAt: string | null;
};

interface PlannedActionsQueryState {
  range: PlannedActionsDateRange;
}

const today = new Date();

@Injectable()
export class PlannedActionsStore {
  private readonly api = inject(PlannedActionsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visibleDateRange = signal<PlannedActionsDateRange>(getMonthRange(today));
  readonly viewMode = signal<PlannedActionsViewMode>('month');
  readonly selectedEventId = signal<string | null>(null);
  readonly resource = signal<ResourceState<PlannedActionCalendarEventVm[]>>({
    data: [],
    status: 'idle',
    error: null,
    lastUpdatedAt: null,
  });

  readonly events = computed(() => this.resource().data);
  readonly selectedEvent = computed(() => {
    const selectedEventId = this.selectedEventId();
    return this.events().find((event) => event.id === selectedEventId) ?? this.events()[0] ?? null;
  });
  readonly isLoading = computed(() => this.resource().status === 'loading');
  readonly isEmpty = computed(
    () => this.resource().status === 'success' && this.events().length === 0,
  );
  readonly hasError = computed(() => this.resource().status === 'error');
  readonly error = computed(() => this.resource().error);
  readonly rangeLabel = computed(() => formatRangeLabel(this.visibleDateRange()));
  readonly resultLabel = computed(() => {
    const count = this.events().length;
    return `${count} planned ${count === 1 ? 'action' : 'actions'} in ${this.rangeLabel()}`;
  });

  private readonly reloadSubject = new Subject<PlannedActionsQueryState>();

  constructor() {
    this.reloadSubject
      .pipe(
        tap(() => {
          this.resource.update((state) => ({ ...state, status: 'loading', error: null }));
        }),
        switchMap((query) =>
          this.api
            .getPublicPlannedActions({
              dateFrom: toIsoDate(query.range.from),
              dateTo: toIsoDate(query.range.to),
            })
            .pipe(
              map((dtos) => ({ events: mapPublicPlannedActionsToCalendarEvents(dtos), error: null })),
              catchError((error: unknown) =>
                of({ events: null, error: toApiError(error) }),
              ),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result.error) {
          this.resource.update((state) => ({
            ...state,
            status: 'error',
            error: result.error,
          }));
          return;
        }

        this.resource.set({
          data: result.events,
          status: 'success',
          error: null,
          lastUpdatedAt: new Date().toISOString(),
        });

        if (result.events.length === 0) {
          this.selectedEventId.set(null);
        } else if (!result.events.some((event) => event.id === this.selectedEventId())) {
          this.selectedEventId.set(result.events[0].id);
        }
      });
  }

  hydrateFromQueryParams(params: Record<string, string | undefined>): void {
    const view = parseViewMode(params['view']);
    const range = getHydratedRange(params['from'], params['to'], view);

    this.viewMode.set(view);
    this.visibleDateRange.set(range);
    this.fetch();
  }

  buildQueryParams(): Record<string, string | undefined> {
    const range = this.visibleDateRange();

    return {
      from: toIsoDate(range.from),
      to: toIsoDate(range.to),
      view: this.viewMode(),
    };
  }

  setViewMode(viewMode: PlannedActionsViewMode): void {
    this.viewMode.set(viewMode);
    if (viewMode === 'week') {
      this.visibleDateRange.set(getWeekRange(this.visibleDateRange().from));
    } else if (viewMode === 'month') {
      this.visibleDateRange.set(getMonthRange(this.visibleDateRange().from));
    }
    this.fetch();
  }

  selectEvent(eventId: string): void {
    this.selectedEventId.set(eventId);
  }

  goToPreviousRange(): void {
    this.visibleDateRange.update((range) => shiftRange(range, this.viewMode(), -1));
    this.fetch();
  }

  goToNextRange(): void {
    this.visibleDateRange.update((range) => shiftRange(range, this.viewMode(), 1));
    this.fetch();
  }

  goToCurrentRange(): void {
    const now = new Date();
    this.visibleDateRange.set(this.viewMode() === 'week' ? getWeekRange(now) : getMonthRange(now));
    this.fetch();
  }

  retry(): void {
    this.fetch();
  }

  private fetch(): void {
    this.reloadSubject.next({
      range: this.visibleDateRange(),
    });
  }
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getHydratedRange(
  from: string | undefined,
  to: string | undefined,
  viewMode: PlannedActionsViewMode,
): PlannedActionsDateRange {
  const parsedFrom = from ? parseLocalDate(from) : null;
  const parsedTo = to ? parseLocalDate(to) : null;

  if (parsedFrom && parsedTo && parsedFrom <= parsedTo) {
    return { from: parsedFrom, to: parsedTo };
  }

  return viewMode === 'week' ? getWeekRange(today) : getMonthRange(today);
}

function parseViewMode(value: string | undefined): PlannedActionsViewMode {
  return value === 'week' || value === 'agenda' || value === 'month' ? value : 'month';
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function getMonthRange(date: Date): PlannedActionsDateRange {
  return {
    from: new Date(date.getFullYear(), date.getMonth(), 1),
    to: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  };
}

function getWeekRange(date: Date): PlannedActionsDateRange {
  const from = new Date(date);
  const day = from.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  from.setDate(from.getDate() + offset);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  return { from, to };
}

function shiftRange(
  range: PlannedActionsDateRange,
  viewMode: PlannedActionsViewMode,
  direction: 1 | -1,
): PlannedActionsDateRange {
  const anchor = new Date(range.from);

  if (viewMode === 'week') {
    anchor.setDate(anchor.getDate() + direction * 7);
    return getWeekRange(anchor);
  }

  anchor.setMonth(anchor.getMonth() + direction);
  return getMonthRange(anchor);
}

function formatRangeLabel(range: PlannedActionsDateRange): string {
  const sameMonth =
    range.from.getFullYear() === range.to.getFullYear() &&
    range.from.getMonth() === range.to.getMonth();

  if (sameMonth) {
    return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(range.from);
  }

  const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${formatter.format(range.from)} - ${formatter.format(range.to)}`;
}

function toApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const httpError = error as { status?: number; error?: { message?: string }; message?: string };
    return {
      status: httpError.status,
      message:
        httpError.error?.message ||
        httpError.message ||
        'Unable to load planned actions. Please try again.',
    };
  }

  return { message: 'Unable to load planned actions. Please try again.' };
}
