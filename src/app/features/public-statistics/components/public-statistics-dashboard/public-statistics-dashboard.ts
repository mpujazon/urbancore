import { HttpClient, HttpParams } from '@angular/common/http';
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
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart, type ChartConfiguration, type ChartOptions, type ChartType, registerables } from 'chart.js';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { CityContextService } from '../../../../core/services/city-context-service';
import { environment } from '../../../../../environments/environment';
import type {
  IncidentSummaryResponse,
  PublicStatisticsDashboardData,
} from '../../models/public-statistics-dashboard.model';
import {
  CHART_COLORS,
  DEFAULT_DASHBOARD_STATE,
  EMPTY_INCIDENT_SUMMARY,
  INCIDENT_SUMMARY_ENDPOINT,
} from '../../config/public-statistics-dashboard.config';
import {
  formatPublicStatisticsDate,
  formatPublicStatisticsLabel,
  getPublicStatisticsStatusColor,
  mapIncidentSummaryToDashboardData,
} from '../../mappers/public-statistics-dashboard.mapper';

Chart.register(...registerables);

type SummaryLoadResult =
  | { summary: IncidentSummaryResponse; error: null }
  | { summary: IncidentSummaryResponse; error: string };

@Component({
  selector: 'app-public-statistics-dashboard',
  templateUrl: './public-statistics-dashboard.html',
  styleUrl: './public-statistics-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicStatisticsDashboard {
  private readonly http = inject(HttpClient);
  private readonly cityContext = inject(CityContextService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly trendChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('trendChart');
  private readonly statusChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('statusChart');
  private readonly categoryChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');

  protected readonly dashboardState = signal(DEFAULT_DASHBOARD_STATE);

  protected readonly dashboardData = computed(() => mapIncidentSummaryToDashboardData(this.dashboardState().data));
  protected readonly isLoading = computed(() => this.dashboardState().status === 'loading');
  protected readonly isError = computed(() => this.dashboardState().status === 'error');
  protected readonly errorMessage = computed(
    () => this.dashboardState().error ?? 'Could not load public statistics. Please try again.'
  );

  private trendChart: Chart<'line'> | null = null;
  private statusChart: Chart<'doughnut'> | null = null;
  private categoryChart: Chart<'bar'> | null = null;
  private readonly summaryRequest = new Subject<string | undefined>();

  constructor() {
    this.summaryRequest
      .pipe(
        tap(() => {
          this.destroyCharts();
          this.dashboardState.set({ data: this.dashboardState().data, status: 'loading', error: null });
        }),
        switchMap((cityId) =>
          this.http
            .get<IncidentSummaryResponse>(`${environment.API_BASE_URL}${INCIDENT_SUMMARY_ENDPOINT}`, {
              params: this.buildSummaryParams(cityId),
            })
            .pipe(
              map<IncidentSummaryResponse, SummaryLoadResult>((summary) => ({ summary, error: null })),
              catchError(() =>
                of<SummaryLoadResult>({
                  summary: EMPTY_INCIDENT_SUMMARY,
                  error: 'Could not load public statistics from the incidents summary endpoint.',
                }),
              ),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.dashboardState.set({
          data: result.summary,
          status: result.error ? 'error' : 'success',
          error: result.error,
        });
      });

    effect(() => {
      if (!this.cityContext.citiesLoaded()) {
        return;
      }

      const cityId = this.cityContext.selectedCityId();

      untracked(() => this.loadSummary(cityId));
    });

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

  private loadSummary(cityId = this.cityContext.selectedCityId()): void {
    this.summaryRequest.next(cityId);
  }

  private buildSummaryParams(cityId: string | undefined): HttpParams | undefined {
    return cityId ? new HttpParams().set('cityId', cityId) : undefined;
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
        labels: summary.trend.map((point) => formatPublicStatisticsDate(point.date)),
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
        labels: summary.byStatus.map((status) => formatPublicStatisticsLabel(status.status)),
        datasets: [
          {
            data: summary.byStatus.map((status) => status.count),
            backgroundColor: summary.byStatus.map((status) => getPublicStatisticsStatusColor(status.status)),
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
        labels: summary.byCategory.map((category) => formatPublicStatisticsLabel(category.category)),
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
    this.trendChart = null;
    this.statusChart = null;
    this.categoryChart = null;
  }
}
