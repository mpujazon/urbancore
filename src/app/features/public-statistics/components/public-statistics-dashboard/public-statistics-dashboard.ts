import { ChangeDetectionStrategy, Component } from '@angular/core';

type KpiTone = 'positive' | 'warning' | 'neutral';

interface DashboardFilter {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}

interface KpiCard {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly badge: string;
  readonly icon?: string;
  readonly tone: KpiTone;
}

interface StatusMetric {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly tone: 'resolved' | 'progress' | 'planned';
}

interface CategoryMetric {
  readonly id: string;
  readonly label: string;
  readonly total: string;
  readonly tone: 'infrastructure' | 'sanitation' | 'safety' | 'parks';
}

@Component({
  selector: 'app-public-statistics-dashboard',
  templateUrl: './public-statistics-dashboard.html',
  styleUrl: './public-statistics-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicStatisticsDashboard {
  protected readonly filters: readonly DashboardFilter[] = [
    { id: 'districts', label: 'All Districts', icon: 'fa-location-dot' },
    { id: 'period', label: 'Last 30 Days', icon: 'fa-calendar-days' },
  ];

  protected readonly kpis: readonly KpiCard[] = [
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
  ];

  protected readonly yAxisLabels: readonly string[] = ['500', '400', '300', '200', '100', '0'];
  protected readonly xAxisLabels: readonly string[] = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  protected readonly gridLines = Array.from({ length: 5 });

  protected readonly statusMetrics: readonly StatusMetric[] = [
    { id: 'resolved', label: 'Resolved', value: 68, tone: 'resolved' },
    { id: 'in-progress', label: 'In Progress', value: 22, tone: 'progress' },
    { id: 'planned', label: 'Planned', value: 10, tone: 'planned' },
  ];

  protected readonly categoryMetrics: readonly CategoryMetric[] = [
    { id: 'infrastructure', label: 'Infrastructure', total: '4,210', tone: 'infrastructure' },
    { id: 'sanitation', label: 'Sanitation', total: '3,892', tone: 'sanitation' },
    { id: 'public-safety', label: 'Public Safety', total: '2,150', tone: 'safety' },
    { id: 'parks-rec', label: 'Parks & Rec', total: '1,045', tone: 'parks' },
  ];
}
