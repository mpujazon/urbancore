import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';
import { CityContextService } from '../../../../core/services/city-context-service';
import { AppPagination } from '../../../../shared/components/app-pagination/app-pagination';
import { AdminIncidentsEmptyState } from '../../components/admin-incidents-empty-state/admin-incidents-empty-state';
import { AdminIncidentsFilterBar } from '../../components/admin-incidents-filter-bar/admin-incidents-filter-bar';
import { AdminIncidentsTable } from '../../components/admin-incidents-table/admin-incidents-table';
import { AdminIncidentsStore } from '../../store/admin-incidents.store';

@Component({
  selector: 'app-manage-incidents',
  imports: [
    AdminIncidentsEmptyState,
    AdminIncidentsFilterBar,
    AdminIncidentsTable,
    AppPagination,
    RouterLink,
  ],
  templateUrl: './manage-incidents.html',
  styleUrl: './manage-incidents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminIncidentsStore],
})
export class ManageIncidents implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly cityContext = inject(CityContextService);
  protected readonly store = inject(AdminIncidentsStore);
  protected readonly adminCityLabel = computed(() => {
    const adminCityId = this.auth.dbUser()?.cityId;

    if (!adminCityId) {
      return 'No assigned city';
    }

    if (!this.cityContext.citiesLoaded()) {
      return 'Loading assigned city...';
    }

    const adminCity = this.cityContext.availableCities().find((city) => city.id === adminCityId);
    return adminCity?.name ?? `City ID: ${adminCityId}`;
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      this.store.hydrateFromQueryParams({
        search: params.get('search') ?? undefined,
        status: params.get('status') ?? undefined,
        category: params.get('category') ?? undefined,
        priority: params.get('priority') ?? undefined,
        dateFrom: params.get('dateFrom') ?? undefined,
        dateTo: params.get('dateTo') ?? undefined,
        page: params.get('page') ?? undefined,
        size: params.get('size') ?? undefined,
        sort: params.get('sort') ?? undefined,
      });
    });
  }
}
