import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';
import type { PagedResponseDto } from '../../../shared/models/paged-response.model';
import { mapAdminIncidentDtoToVm } from '../mappers/admin-incident.mapper';
import type { AdminIncidentListItemDto } from '../models/admin-incident-dto.model';
import type {
  AdminIncidentFilters,
  AdminIncidentQuery,
  AdminIncidentSort,
  ApiError,
  ResourceStatus,
} from '../models/admin-incident-query.model';
import type { AdminIncidentRowVm } from '../models/admin-incident-vm.model';
import { AdminIncidentsApiService } from '../services/admin-incidents-api.service';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const DEFAULT_SORT: AdminIncidentSort = 'createdAt,desc';
const PAGE_SIZES = [10, 25, 50];

@Injectable()
export class AdminIncidentsStore {
  private readonly api = inject(AdminIncidentsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly queryRequests = new Subject<AdminIncidentQuery>();
  private readonly rowsState = signal<AdminIncidentRowVm[]>([]);
  private readonly statusState = signal<ResourceStatus>('idle');
  private readonly errorState = signal<ApiError | null>(null);
  private readonly pageState = signal(DEFAULT_PAGE);
  private readonly sizeState = signal(DEFAULT_SIZE);
  private readonly totalElementsState = signal(0);
  private readonly totalPagesState = signal(0);
  private readonly sortState = signal<AdminIncidentSort>(DEFAULT_SORT);
  private readonly filtersState = signal<AdminIncidentFilters>({});
  private readonly hydratedState = signal(false);

  readonly rows = this.rowsState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly page = this.pageState.asReadonly();
  readonly size = this.sizeState.asReadonly();
  readonly totalElements = this.totalElementsState.asReadonly();
  readonly totalPages = this.totalPagesState.asReadonly();
  readonly sort = this.sortState.asReadonly();
  readonly filters = this.filtersState.asReadonly();
  readonly isLoading = computed(() => this.status() === 'loading' && this.rows().length === 0);
  readonly isRefreshing = computed(() => this.status() === 'loading' && this.rows().length > 0);
  readonly hasRows = computed(() => this.rows().length > 0);
  readonly isEmpty = computed(() => this.status() === 'success' && this.rows().length === 0);
  readonly activeFilterCount = computed(() => countActiveFilters(this.filters()));
  readonly query = computed<AdminIncidentQuery>(() => ({
    page: this.page(),
    size: this.size(),
    sort: this.sort(),
    ...this.filters(),
  }));
  readonly pagination = computed(() => ({
    page: this.page(),
    size: this.size(),
    totalElements: this.totalElements(),
    totalPages: this.totalPages(),
    first: this.page() <= 0,
    last: this.totalPages() === 0 || this.page() >= this.totalPages() - 1,
  }));
  readonly resultsLabel = computed(() => {
    if (this.status() === 'loading' && !this.hasRows()) {
      return 'Loading incidents';
    }

    const total = this.totalElements();
    return `${total} incident${total === 1 ? '' : 's'} found`;
  });

  constructor() {
    this.queryRequests
      .pipe(
        tap(() => {
          this.statusState.set('loading');
          this.errorState.set(null);
        }),
        switchMap((query) =>
          this.api.getAdminIncidents(query).pipe(
            catchError((error: unknown) => {
              this.statusState.set('error');
              this.errorState.set(normalizeApiError(error));
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => this.handleResponse(response));
  }

  hydrateFromQueryParams(params: Record<string, string | undefined>): void {
    this.filtersState.set(parseFilters(params));
    this.pageState.set(parsePage(params['page']));
    this.sizeState.set(parseSize(params['size']));
    this.sortState.set(parseSort(params['sort']));
    this.hydratedState.set(true);
    this.load();
  }

  load(): void {
    this.queryRequests.next(this.query());
  }

  retry(): void {
    this.load();
  }

  setSearch(search: string): void {
    this.patchFilters({ search: search.trim() || undefined });
  }

  setStatus(status: AdminIncidentFilters['status'] | null): void {
    this.patchFilters({ status: status ?? undefined });
  }

  setCategory(category: AdminIncidentFilters['category'] | null): void {
    this.patchFilters({ category: category ?? undefined });
  }

  setPriority(priority: AdminIncidentFilters['priority'] | null): void {
    this.patchFilters({ priority: priority ?? undefined });
  }

  setDateFrom(dateFrom: string | null): void {
    this.patchFilters({ dateFrom: dateFrom || undefined });
  }

  setDateTo(dateTo: string | null): void {
    this.patchFilters({ dateTo: dateTo || undefined });
  }

  setPage(page: number): void {
    this.pageState.set(Math.max(0, page));
    this.syncUrlAndLoad();
  }

  setSize(size: number): void {
    this.sizeState.set(PAGE_SIZES.includes(size) ? size : DEFAULT_SIZE);
    this.pageState.set(DEFAULT_PAGE);
    this.syncUrlAndLoad();
  }

  setSort(sort: AdminIncidentSort): void {
    this.sortState.set(sort);
    this.pageState.set(DEFAULT_PAGE);
    this.syncUrlAndLoad();
  }

  clearFilters(): void {
    this.filtersState.set({});
    this.pageState.set(DEFAULT_PAGE);
    this.syncUrlAndLoad();
  }

  openIncident(id: string): void {
    void this.router.navigate(['/admin/incidents', id]);
  }

  private patchFilters(partial: AdminIncidentFilters): void {
    this.filtersState.update((filters) => cleanFilters({ ...filters, ...partial }));
    this.pageState.set(DEFAULT_PAGE);
    this.syncUrlAndLoad();
  }

  private syncUrlAndLoad(): void {
    if (this.hydratedState()) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.buildQueryParams(),
        replaceUrl: true,
      });
    }

    this.load();
  }

  private buildQueryParams(): Record<string, string | undefined> {
    const query = this.query();

    return {
      search: query.search || undefined,
      status: query.status,
      category: query.category,
      priority: query.priority,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page: query.page === DEFAULT_PAGE ? undefined : String(query.page),
      size: query.size === DEFAULT_SIZE ? undefined : String(query.size),
      sort: query.sort === DEFAULT_SORT ? undefined : query.sort,
    };
  }

  private handleResponse(response: PagedResponseDto<AdminIncidentListItemDto>): void {
    this.rowsState.set(response.content.map(mapAdminIncidentDtoToVm));
    this.pageState.set(response.page);
    this.sizeState.set(response.size);
    this.totalElementsState.set(response.totalElements);
    this.totalPagesState.set(response.totalPages);
    this.statusState.set('success');
  }
}

function parseFilters(params: Record<string, string | undefined>): AdminIncidentFilters {
  return cleanFilters({
    search: params['search'],
    status: params['status'] as AdminIncidentFilters['status'],
    category: params['category'] as AdminIncidentFilters['category'],
    priority: params['priority'] as AdminIncidentFilters['priority'],
    dateFrom: params['dateFrom'],
    dateTo: params['dateTo'],
  });
}

function cleanFilters(filters: AdminIncidentFilters): AdminIncidentFilters {
  const clean: AdminIncidentFilters = {};

  if (filters.search?.trim()) clean.search = filters.search.trim();
  if (filters.status) clean.status = filters.status;
  if (filters.category) clean.category = filters.category;
  if (filters.priority) clean.priority = filters.priority;
  if (filters.dateFrom) clean.dateFrom = filters.dateFrom;
  if (filters.dateTo) clean.dateTo = filters.dateTo;

  return clean;
}

function countActiveFilters(filters: AdminIncidentFilters): number {
  return Object.values(filters).filter((value) => value !== undefined && value !== null && value !== '').length;
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 0 ? page : DEFAULT_PAGE;
}

function parseSize(value: string | undefined): number {
  const size = Number(value);
  return PAGE_SIZES.includes(size) ? size : DEFAULT_SIZE;
}

function parseSort(value: string | undefined): AdminIncidentSort {
  const allowed: AdminIncidentSort[] = [
    'createdAt,desc',
    'createdAt,asc',
    'title,asc',
    'title,desc',
    'category,asc',
    'category,desc',
    'priority,asc',
    'priority,desc',
    'status,asc',
    'status,desc',
  ];

  return allowed.includes(value as AdminIncidentSort) ? (value as AdminIncidentSort) : DEFAULT_SORT;
}

function normalizeApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const httpError = error as { status?: number; error?: { message?: string }; message?: string };

    return {
      status: httpError.status,
      message:
        httpError.status === 403
          ? 'You do not have permission to manage incidents.'
          : httpError.error?.message || httpError.message || 'Failed to load incidents. Please try again.',
    };
  }

  return { message: 'Failed to load incidents. Please try again.' };
}
