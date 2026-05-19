import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';
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
  protected readonly store = inject(AdminIncidentsStore);

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
