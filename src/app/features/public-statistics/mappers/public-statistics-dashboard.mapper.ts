import {
  CATEGORY_TONES,
  FALLBACK_STATUS_COLOR,
  STATUS_COLORS,
} from '../config/public-statistics-dashboard.config';
import type {
  IncidentSummaryResponse,
  PublicStatisticsDashboardData,
} from '../models/public-statistics-dashboard.model';

export function formatPublicStatisticsNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPublicStatisticsLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatPublicStatisticsDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function getPublicStatisticsStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? FALLBACK_STATUS_COLOR;
}

export function mapIncidentSummaryToDashboardData(
  summary: IncidentSummaryResponse
): PublicStatisticsDashboardData {
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
        value: formatPublicStatisticsNumber(summary.totalIncidents),
        badge: `${summary.trend.length} days tracked`,
        icon: 'fa-chart-line',
        tone: 'positive',
      },
      {
        id: 'issues-resolved',
        label: 'Issues Resolved',
        value: formatPublicStatisticsNumber(summary.resolvedIncidents),
        badge: `${resolvedRate}% · ${summary.averageResolutionDays}d avg`,
        icon: 'fa-circle-check',
        tone: 'positive',
      },
      {
        id: 'open-incidents',
        label: 'Open Incidents',
        value: formatPublicStatisticsNumber(summary.openIncidents),
        badge: `${openRate}% Open`,
        icon: 'fa-triangle-exclamation',
        tone: 'warning',
      },
      {
        id: 'active-planning',
        label: 'Active Planning',
        value: formatPublicStatisticsNumber(summary.plannedIncidents),
        badge: 'Projects',
        tone: 'neutral',
      },
    ],
    statusMetrics: summary.byStatus.map((status) => ({
      id: status.status.toLowerCase(),
      label: formatPublicStatisticsLabel(status.status),
      value: summary.totalIncidents ? Math.round((status.count / summary.totalIncidents) * 100) : 0,
      count: status.count,
      color: getPublicStatisticsStatusColor(status.status),
    })),
    categoryMetrics: summary.byCategory
      .slice()
      .sort((a, b) => b.count - a.count)
      .map((category) => ({
        id: category.category.toLowerCase(),
        label: formatPublicStatisticsLabel(category.category),
        total: formatPublicStatisticsNumber(category.count),
        tone: CATEGORY_TONES[category.category] ?? 'neutral',
      })),
    areaMetrics: summary.byArea.map((area) => ({
      id: area.area.toLowerCase().replaceAll(' ', '-'),
      label: area.area,
      total: formatPublicStatisticsNumber(area.count),
    })),
    summary,
  };
}
