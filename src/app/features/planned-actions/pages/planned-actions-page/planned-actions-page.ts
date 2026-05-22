import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlannedActionDetailPanel } from '../../components/planned-action-detail-panel/planned-action-detail-panel';
import { PlannedActionsCalendar } from '../../components/planned-actions-calendar/planned-actions-calendar';
import { PlannedActionsToolbar } from '../../components/planned-actions-toolbar/planned-actions-toolbar';
import { PlannedActionsViewMode } from '../../models/planned-action-vm.model';
import { PlannedActionsStore } from '../../store/planned-actions.store';

@Component({
  selector: 'app-planned-actions-page',
  imports: [
    PlannedActionsToolbar,
    PlannedActionsCalendar,
    PlannedActionDetailPanel,
  ],
  templateUrl: './planned-actions-page.html',
  styleUrl: './planned-actions-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlannedActionsStore],
})
export class PlannedActionsPage {
  protected readonly store = inject(PlannedActionsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.hydrateFromUrl();
    this.syncUrl();
  }

  protected onViewModeChanged(viewMode: PlannedActionsViewMode): void {
    this.store.setViewMode(viewMode);
  }

  private hydrateFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const record: Record<string, string | undefined> = {};

    params.keys.forEach((key) => {
      record[key] = params.get(key) ?? undefined;
    });

    this.store.hydrateFromQueryParams(record);
  }

  private syncUrl(): void {
    effect(() => {
      void this.router.navigate([], {
        queryParams: { ...this.store.buildQueryParams(), cityId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }
}
