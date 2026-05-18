import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart, type ChartConfiguration, type ChartOptions, type ChartType, registerables } from 'chart.js';
import { environment } from '../../../../../environments/environment';
import type {
  IncidentSummaryResponse,
  PublicStatisticsDashboardData,
} from '../../models/public-statistics-dashboard.model';
import {
  CATEGORY_TONES,
  CHART_COLORS,
  DEFAULT_DASHBOARD_STATE,
  EMPTY_INCIDENT_SUMMARY,
  FALLBACK_STATUS_COLOR,
  INCIDENT_SUMMARY_ENDPOINT,
  STATUS_COLORS,
} from '../../models/public-statistics-dashboard.config';

Chart.register(...registerables);

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function buildDashboardData(summary: IncidentSummaryResponse): PublicStatisticsDashboardData {
  const resolvedRate = summary.totalIncidents
    ? Math.round((summary.resolvedIncidents / summary.totalIncidents) * 100)
    : 0;
  const openRate = summary.totalIncidents
    ? Math.round((summary.openIncidents / summary.totalIncidents) * 100)
    : 0;

  return {
    kpis: [
      {
        id: 'total-reports',
        label: 'Total Reports',
        value: formatNumber(summary.totalIncidents),
        badge: `${summary.trend.length} days tracked`,
        icon: 'fa-chart-line',
        tone: 'positive',
      },
      {
        id: 'issues-resolved',
        label: 'Issues Resolved',
        value: formatNumber(summary.resolvedIncidents),
        badge: `${resolvedRate}% · ${summary.averageResolutionDays}d avg`,
        icon: 'fa-circle-check',
        tone: 'positive',
      },
      {
        id: 'open-incidents',
        label: 'Open Incidents',
        value: formatNumber(summary.openIncidents),
        badge: `${openRate}% Open`,
        icon: 'fa-triangle-exclamation',
        tone: 'warning',
      },
      {
        id: 'active-planning',
        label: 'Active Planning',
        value: formatNumber(summary.plannedIncidents),
        badge: 'Projects',
        tone: 'neutral',
      },
    ],
    statusMetrics: summary.byStatus.map((status) => ({
      id: status.status.toLowerCase(),
      label: formatLabel(status.status),
      value: summary.totalIncidents ? Math.round((status.count / summary.totalIncidents) * 100) : 0,
      count: status.count,
      color: STATUS_COLORS[status.status] ?? FALLBACK_STATUS_COLOR,
    })),
    categoryMetrics: summary.byCategory
      .slice()
      .sort((a, b) => b.count - a.count)
      .map((category) => ({
        id: category.category.toLowerCase(),
        label: formatLabel(category.category),
        total: formatNumber(category.count),
        tone: CATEGORY_TONES[category.category] ?? 'neutral',
      })),
    areaMetrics: summary.byArea.map((area) => ({
      id: area.area.toLowerCase().replaceAll(' ', '-'),
      label: area.area,
      total: formatNumber(area.count),
    })),
    summary,
  };
}

@Component({
  selector: 'app-public-statistics-dashboard',
  templateUrl: './public-statistics-dashboard.html',
  styleUrl: './public-statistics-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicStatisticsDashboard {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly trendChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('trendChart');
  private readonly statusChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('statusChart');
  private readonly categoryChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');

  protected readonly dashboardState = signal(DEFAULT_DASHBOARD_STATE);

  protected readonly dashboardData = computed(() => buildDashboardData(this.dashboardState().data));
  protected readonly isLoading = computed(() => this.dashboardState().status === 'loading');
  protected readonly isError = computed(() => this.dashboardState().status === 'error');
  protected readonly errorMessage = computed(
    () => this.dashboardState().error ?? 'Could not load public statistics. Please try again.'
  );

  private trendChart: Chart<'line'> | null = null;
  private statusChart: Chart<'doughnut'> | null = null;
  private categoryChart: Chart<'bar'> | null = null;

  constructor() {
    this.loadSummary();

    effect(() => {
      const data = this.dashboardData();
      const trendCanvas = this.trendChartCanvas();
      const statusCanvas = this.statusChartCanvas();
      const categoryCanvas = this.categoryChartCanvas();

      if (this.isLoading() || this.isError() || !trendCanvas || !statusCanvas || !categoryCanvas) {
        return;
      }

      this.renderCharts(data, trendCanvas.nativeElement, statusCanvas.nativeElement, categoryCanvas.nativeElement);
    });

    this.destroyRef.onDestroy(() => this.destroyCharts());
  }

  protected retry(): void {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.dashboardState.set({ data: this.dashboardState().data, status: 'loading', error: null });

    this.http
      .get<IncidentSummaryResponse>(`${environment.API_BASE_URL}${INCIDENT_SUMMARY_ENDPOINT}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => this.dashboardState.set({ data: summary, status: 'success', error: null }),
        error: () =>
          this.dashboardState.set({
            data: EMPTY_INCIDENT_SUMMARY,
            status: 'error',
            error: 'Could not load public statistics from the incidents summary endpoint.',
          }),
      });
  }

  private renderCharts(
    data: PublicStatisticsDashboardData,
    trendCanvas: HTMLCanvasElement,
    statusCanvas: HTMLCanvasElement,
    categoryCanvas: HTMLCanvasElement
  ): void {
    const summary = data.summary;

    this.trendChart = this.upsertChart(this.trendChart, trendCanvas, {
      type: 'line',
      data: {
        labels: summary.trend.map((point) => formatDate(point.date)),
        datasets: [
          {
            label: 'Reports',
            data: summary.trend.map((point) => point.count),
            borderColor: CHART_COLORS.trendBorder,
            backgroundColor: CHART_COLORS.trendArea,
            fill: true,
            pointBackgroundColor: CHART_COLORS.trendBorder,
            pointBorderColor: CHART_COLORS.trendPointBorder,
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.38,
          },
        ],
      },
      options: this.chartOptions<'line'>('Incidents reported by day'),
    });

    this.statusChart = this.upsertChart(this.statusChart, statusCanvas, {
      type: 'doughnut',
      data: {
        labels: summary.byStatus.map((status) => formatLabel(status.status)),
        datasets: [
          {
            data: summary.byStatus.map((status) => status.count),
            backgroundColor: summary.byStatus.map((status) => STATUS_COLORS[status.status] ?? FALLBACK_STATUS_COLOR),
            borderColor: CHART_COLORS.statusBorder,
            borderWidth: 5,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        ...this.chartOptions<'doughnut'>('Incidents grouped by status'),
        cutout: '62%',
      },
    });

    this.categoryChart = this.upsertChart(this.categoryChart, categoryCanvas, {
      type: 'bar',
      data: {
        labels: summary.byCategory.map((category) => formatLabel(category.category)),
        datasets: [
          {
            label: 'Reports',
            data: summary.byCategory.map((category) => category.count),
            backgroundColor: CHART_COLORS.categoryBar,
            borderRadius: 10,
            maxBarThickness: 34,
          },
        ],
      },
      options: {
        ...this.chartOptions<'bar'>('Incidents grouped by category'),
        indexAxis: 'y',
      },
    });
  }

  private upsertChart<TType extends ChartType>(
    existingChart: Chart<TType> | null,
    canvas: HTMLCanvasElement,
    configuration: ChartConfiguration<TType>
  ): Chart<TType> {
    existingChart?.destroy();
    return new Chart(canvas, configuration);
  }

  private chartOptions<TType extends ChartType>(title: string): ChartOptions<TType> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 900,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: CHART_COLORS.tooltipBackground,
          padding: 12,
          titleFont: { weight: 'bold' },
        },
        title: {
          display: false,
          text: title,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: CHART_COLORS.tick, font: { weight: 'bold' } },
        },
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.grid },
          ticks: { precision: 0, color: CHART_COLORS.tick, font: { weight: 'bold' } },
        },
      },
    } as ChartOptions<TType>;
  }

  private destroyCharts(): void {
    this.trendChart?.destroy();
    this.statusChart?.destroy();
    this.categoryChart?.destroy();
  }
}
