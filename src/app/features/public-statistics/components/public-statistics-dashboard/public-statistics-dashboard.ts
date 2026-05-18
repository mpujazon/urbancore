import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ResourceState } from '../../../../shared/models/resource-state.model';

export type KpiTone = 'positive' | 'warning' | 'neutral';

export interface DashboardFilter {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}

export interface KpiCard {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly badge: string;
  readonly icon?: string;
  readonly tone: KpiTone;
}

export interface StatusMetric {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly tone: 'resolved' | 'progress' | 'planned';
}

export interface CategoryMetric {
  readonly id: string;
  readonly label: string;
  readonly total: string;
  readonly tone: 'infrastructure' | 'sanitation' | 'safety' | 'parks';
}

export interface PublicStatisticsDashboardData {
  readonly filters: readonly DashboardFilter[];
  readonly kpis: readonly KpiCard[];
  readonly yAxisLabels: readonly string[];
  readonly xAxisLabels: readonly string[];
  readonly statusMetrics: readonly StatusMetric[];
  readonly categoryMetrics: readonly CategoryMetric[];
}

const DEFAULT_DASHBOARD_DATA: PublicStatisticsDashboardData = {
  filters: [
    { id: 'districts', label: 'All Districts', icon: 'fa-location-dot' },
    { id: 'period', label: 'Last 30 Days', icon: 'fa-calendar-days' },
  ],
  kpis: [
    {
      id: 'total-reports',
      label: 'Total Reports',
      value: '14,285',
      badge: '12%',
      icon: 'fa-arrow-up',
      tone: 'positive',
    },
    {
      id: 'issues-resolved',
      label: 'Issues Resolved',
      value: '9,842',
      badge: '68% Rate',
      icon: 'fa-circle-check',
      tone: 'positive',
    },
    {
      id: 'average-response-time',
      label: 'Average Response Time',
      value: '4.2',
      unit: 'hrs',
      badge: '0.5h',
      icon: 'fa-arrow-up',
      tone: 'warning',
    },
    {
      id: 'active-planning',
      label: 'Active Planning',
      value: '124',
      badge: 'Projects',
      tone: 'neutral',
    },
  ],
  yAxisLabels: ['500', '400', '300', '200', '100', '0'],
  xAxisLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  statusMetrics: [
    { id: 'resolved', label: 'Resolved', value: 68, tone: 'resolved' },
    { id: 'in-progress', label: 'In Progress', value: 22, tone: 'progress' },
    { id: 'planned', label: 'Planned', value: 10, tone: 'planned' },
  ],
  categoryMetrics: [
    { id: 'infrastructure', label: 'Infrastructure', total: '4,210', tone: 'infrastructure' },
    { id: 'sanitation', label: 'Sanitation', total: '3,892', tone: 'sanitation' },
    { id: 'public-safety', label: 'Public Safety', total: '2,150', tone: 'safety' },
    { id: 'parks-rec', label: 'Parks & Rec', total: '1,045', tone: 'parks' },
  ],
};

const DEFAULT_RESOURCE_STATE: ResourceState<PublicStatisticsDashboardData> = {
  data: DEFAULT_DASHBOARD_DATA,
  status: 'success',
  error: null,
};

@Component({
  selector: 'app-public-statistics-dashboard',
  templateUrl: './public-statistics-dashboard.html',
  styleUrl: './public-statistics-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicStatisticsDashboard {
  readonly dashboardState = input<ResourceState<PublicStatisticsDashboardData>>(DEFAULT_RESOURCE_STATE);
  readonly retryRequested = output<void>();

  protected readonly dashboardData = computed(() => this.dashboardState().data);
  protected readonly isLoading = computed(() => this.dashboardState().status === 'loading');
  protected readonly isError = computed(() => this.dashboardState().status === 'error');
  protected readonly errorMessage = computed(
    () => this.dashboardState().error ?? 'Could not load public statistics. Please try again.'
  );
  protected readonly gridLines = Array.from({ length: 5 });

  protected retry(): void {
    this.retryRequested.emit();
  }
}
