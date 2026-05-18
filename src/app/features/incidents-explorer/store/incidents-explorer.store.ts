import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap } from 'rxjs';
import {
  IncidentExplorerQuery,
  IncidentListItemDto,
} from '../../../shared/models/incident-dto.model';
import { IncidentExplorerFilters } from '../../../shared/models/incident-vm.model';
import { IncidentsApiService } from '../../../shared/services/incidents-api-service';
import { PagedResponseDto } from '../../../shared/models/paged-response.model';

@Injectable()
export class IncidentsExplorerStore {
  private readonly incidentService = inject(IncidentsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filters = signal<IncidentExplorerFilters>({});
  readonly page = signal<number>(0);
  readonly size = signal<number>(10);
  readonly sort = signal<string>('createdAt,desc');

  private readonly response = signal<PagedResponseDto<IncidentListItemDto> | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);
  private incidentsContainer: HTMLElement | null = null;

  readonly incidents = computed(() => this.response()?.content ?? []);
  readonly totalPages = computed(() => this.response()?.totalPages ?? 0);
  readonly totalElements = computed(() => this.response()?.totalElements ?? 0);
  readonly first = computed(() => this.response()?.first ?? true);
  readonly last = computed(() => this.response()?.last ?? true);
  readonly isLoading = computed(() => this.loadingState());
  readonly isRefreshing = computed(() => this.loadingState() && this.response() !== null);
  readonly error = computed(() => this.errorState());
  readonly hasNoResults = computed(
    () =>
      !this.isLoading() &&
      !this.error() &&
      this.response() !== null &&
      this.incidents().length === 0,
  );
  readonly activeFilterCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.q?.trim()) count++;
    if (f.status) count++;
    if (f.category) count++;
    if (f.priority) count++;
    if (f.cityId) count++;
    if (f.from) count++;
    if (f.to) count++;
    return count;
  });

  private readonly querySubject = new Subject<IncidentExplorerQuery>();

  constructor() {
    this.querySubject
      .pipe(
        tap(() => {
          this.loadingState.set(true);
          this.errorState.set(null);
        }),
        switchMap((query) => this.incidentService.getPublicIncidents(query)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.response.set(res);
          this.loadingState.set(false);
          if (res.totalPages > 0 && res.page >= res.totalPages) {
            this.page.set(0);
            this.emitQuery();
          }
        },
        error: (err) => {
          this.errorState.set(
            err?.error?.message ?? 'Failed to load incidents. Please try again.',
          );
          this.loadingState.set(false);
        },
      });

    this.emitQuery();
  }

  setFilters(partial: Partial<IncidentExplorerFilters>): void {
    this.filters.update((prev) => {
      const next = { ...prev, ...partial };
      Object.keys(next).forEach((key) => {
        const k = key as keyof IncidentExplorerFilters;
        if (next[k] === undefined || next[k] === null || (typeof next[k] === 'string' && next[k].trim() === '')) {
          delete next[k];
        }
      });
      return next;
    });
    this.page.set(0);
    this.scrollIncidentsContainerToTop();
    this.emitQuery();
  }

  clearFilters(): void {
    this.filters.set({});
    this.page.set(0);
    this.scrollIncidentsContainerToTop();
    this.emitQuery();
  }

  setPage(page: number): void {
    this.page.set(page);
    this.scrollIncidentsContainerToTop();
    this.emitQuery();
  }

  setSize(size: number): void {
    this.size.set(size);
    this.page.set(0);
    this.scrollIncidentsContainerToTop();
    this.emitQuery();
  }

  setSort(sort: string): void {
    this.sort.set(sort);
    this.page.set(0);
    this.scrollIncidentsContainerToTop();
    this.emitQuery();
  }

  reload(): void {
    this.emitQuery();
  }

  setIncidentsContainer(container: HTMLElement | null): void {
    this.incidentsContainer = container;
  }

  scrollIncidentsContainerToTop(): void {
    if (!this.incidentsContainer) {
      return;
    }

    this.incidentsContainer.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  hydrateFromQueryParams(params: Record<string, string | undefined>): void {
    const filters: IncidentExplorerFilters = {};

    if (params['q']) filters.q = params['q'];
    if (params['status']) filters.status = params['status'] as IncidentExplorerFilters['status'];
    if (params['category']) filters.category = params['category'] as IncidentExplorerFilters['category'];
    if (params['priority']) filters.priority = params['priority'] as IncidentExplorerFilters['priority'];
    if (params['cityId']) filters.cityId = params['cityId'];
    if (params['from']) filters.from = params['from'];
    if (params['to']) filters.to = params['to'];

    const page = params['page'] ? Number(params['page']) : 0;
    const size = params['size'] ? Number(params['size']) : 10;
    const sort = params['sort'] || 'createdAt,desc';

    this.filters.set(filters);
    this.page.set(Number.isNaN(page) ? 0 : page);
    this.size.set(Number.isNaN(size) || size < 1 || size > 50 ? 10 : size);
    this.sort.set(sort);

    this.emitQuery();
  }

  buildQueryParams(): Record<string, string | undefined> {
    const f = this.filters();
    const params: Record<string, string | undefined> = {};

    if (f.q?.trim()) params['q'] = f.q.trim();
    if (f.status) params['status'] = f.status;
    if (f.category) params['category'] = f.category;
    if (f.priority) params['priority'] = f.priority;
    if (f.cityId) params['cityId'] = f.cityId;
    if (f.from) params['from'] = f.from;
    if (f.to) params['to'] = f.to;

    params['page'] = this.page() > 0 ? String(this.page()) : undefined;
    params['size'] = this.size() !== 10 ? String(this.size()) : undefined;
    params['sort'] = this.sort() !== 'createdAt,desc' ? this.sort() : undefined;

    return params;
  }

  private emitQuery(): void {
    const f = this.filters();
    const query: IncidentExplorerQuery = {
      page: this.page(),
      size: this.size(),
      sort: this.sort(),
    };

    if (f.q?.trim()) query.q = f.q.trim();
    if (f.status) query.status = f.status;
    if (f.category) query.category = f.category;
    if (f.priority) query.priority = f.priority;
    if (f.cityId) query.cityId = f.cityId;
    if (f.from) query.from = f.from;
    if (f.to) query.to = f.to;

    this.querySubject.next(query);
  }
}
