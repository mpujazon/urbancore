import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap } from 'rxjs';
import { CityContextService } from '../../../core/services/city-context-service';
import {
  IncidentListItemDto,
} from '../../../shared/models/incident-dto.model';
import { IncidentExplorerFilters } from '../../../shared/models/incident-vm.model';
import { PublicIncidentsApiService } from '../../../shared/services/public-incidents-api-service';
import { PagedResponseDto } from '../../../shared/models/paged-response.model';
import {
  buildIncidentsExplorerQuery,
  buildIncidentsExplorerQueryParams,
  hydrateIncidentsExplorerState,
  INCIDENTS_EXPLORER_DEFAULT_SIZE,
  INCIDENTS_EXPLORER_DEFAULT_SORT,
} from '../helpers/incidents-explorer-query.helper';

@Injectable()
export class IncidentsExplorerStore {
  private readonly incidentService = inject(PublicIncidentsApiService);
  private readonly cityContext = inject(CityContextService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filters = signal<IncidentExplorerFilters>({});
  readonly page = signal<number>(0);
  readonly size = signal<number>(INCIDENTS_EXPLORER_DEFAULT_SIZE);
  readonly sort = signal<string>(INCIDENTS_EXPLORER_DEFAULT_SORT);

  private readonly response = signal<PagedResponseDto<IncidentListItemDto> | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);
  private readonly hasHydrated = signal(false);
  private incidentsContainer: HTMLElement | null = null;
  private lastCityId: string | undefined;
  private hasLoadedForCityContext = false;

  readonly incidents = computed(() => this.response()?.content ?? []);
  readonly totalPages = computed(() => this.response()?.totalPages ?? 0);
  readonly totalElements = computed(() => this.response()?.totalElements ?? 0);
  readonly resultCountLabel = computed(() => {
    if (this.isLoading()) {
      return this.isRefreshing() ? 'Refreshing incident results.' : 'Loading incident results.';
    }

    if (this.error()) {
      return 'Incident results could not be loaded.';
    }

    const total = this.totalElements();
    return `${total} incident result${total === 1 ? '' : 's'} found.`;
  });
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
    if (f.from) count++;
    if (f.to) count++;
    return count;
  });

  private readonly querySubject = new Subject<ReturnType<typeof buildIncidentsExplorerQuery>>();

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

    effect(() => {
      if (!this.hasHydrated() || !this.cityContext.citiesLoaded()) {
        return;
      }

      const cityId = this.cityContext.selectedCityId();

      if (this.hasLoadedForCityContext && this.lastCityId !== cityId) {
        this.page.set(0);
        this.scrollIncidentsContainerToTop();
      }

      this.lastCityId = cityId;
      this.hasLoadedForCityContext = true;

      untracked(() => this.emitQuery(cityId));
    });
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
    const hydratedState = hydrateIncidentsExplorerState(params);

    this.filters.set(hydratedState.filters);
    this.page.set(hydratedState.page);
    this.size.set(hydratedState.size);
    this.sort.set(hydratedState.sort);
    this.hasHydrated.set(true);
  }

  buildQueryParams(): Record<string, string | undefined> {
    return buildIncidentsExplorerQueryParams({
      filters: this.filters(),
      page: this.page(),
      size: this.size(),
      sort: this.sort(),
    });
  }

  private emitQuery(cityId = this.cityContext.selectedCityId()): void {
    if (!this.hasHydrated() || !this.cityContext.citiesLoaded()) {
      return;
    }

    const query = buildIncidentsExplorerQuery({
      filters: this.filters(),
      page: this.page(),
      size: this.size(),
      sort: this.sort(),
      cityId,
    });

    this.querySubject.next(query);
  }
}
