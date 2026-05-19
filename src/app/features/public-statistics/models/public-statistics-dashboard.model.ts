export type KpiTone = 'positive' | 'warning' | 'neutral';

export type CategoryTone = 'infrastructure' | 'sanitation' | 'safety' | 'parks' | 'neutral';

export interface KpiCard {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly badge: string;
  readonly icon?: string;
  readonly tone: KpiTone;
}

export interface StatusMetric {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly count: number;
  readonly color: string;
}

export interface CategoryMetric {
  readonly id: string;
  readonly label: string;
  readonly total: string;
  readonly tone: CategoryTone;
}

export interface AreaMetric {
  readonly id: string;
  readonly label: string;
  readonly total: string;
}

export interface IncidentSummaryBucket {
  readonly count: number;
}

export interface IncidentStatusSummary extends IncidentSummaryBucket {
  readonly status: string;
}

export interface IncidentCategorySummary extends IncidentSummaryBucket {
  readonly category: string;
}

export interface IncidentTrendSummary extends IncidentSummaryBucket {
  readonly date: string;
}

export interface IncidentAreaSummary extends IncidentSummaryBucket {
  readonly area: string;
}

export interface IncidentSummaryResponse {
  readonly totalIncidents: number;
  readonly openIncidents: number;
  readonly resolvedIncidents: number;
  readonly plannedIncidents: number;
  readonly averageResolutionDays: number;
  readonly byStatus: readonly IncidentStatusSummary[];
  readonly byCategory: readonly IncidentCategorySummary[];
  readonly trend: readonly IncidentTrendSummary[];
  readonly byArea: readonly IncidentAreaSummary[];
}

export interface PublicStatisticsDashboardData {
  readonly kpis: readonly KpiCard[];
  readonly statusMetrics: readonly StatusMetric[];
  readonly categoryMetrics: readonly CategoryMetric[];
  readonly areaMetrics: readonly AreaMetric[];
  readonly summary: IncidentSummaryResponse;
}
