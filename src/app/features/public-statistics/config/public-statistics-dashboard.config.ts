import type { ResourceState } from '../../../shared/models/resource-state.model';
import type { CategoryTone, IncidentSummaryResponse } from '../models/public-statistics-dashboard.model';

export const INCIDENT_SUMMARY_ENDPOINT = '/stats/incidents/summary';

export const EMPTY_INCIDENT_SUMMARY: IncidentSummaryResponse = {
  totalIncidents: 0,
  openIncidents: 0,
  resolvedIncidents: 0,
  plannedIncidents: 0,
  averageResolutionDays: 0,
  byStatus: [],
  byCategory: [],
  trend: [],
  byArea: [],
};

export const DEFAULT_DASHBOARD_STATE: ResourceState<IncidentSummaryResponse> = {
  data: EMPTY_INCIDENT_SUMMARY,
  status: 'loading',
  error: null,
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  IN_PROGRESS: '#8b5cf6',
  PLANNED: '#06b6d4',
  RESOLVED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#94a3b8',
};

export const FALLBACK_STATUS_COLOR = '#cbd5e1';

export const CATEGORY_TONES: Record<string, CategoryTone> = {
  POTHOLE: 'infrastructure',
  LIGHTING: 'infrastructure',
  STREET_FURNITURE: 'parks',
  CLEANLINESS: 'sanitation',
  GRAFFITI: 'safety',
  NOISE: 'neutral',
};

export const CHART_COLORS = {
  categoryBar: '#0052cc',
  grid: 'rgba(225, 226, 236, 0.82)',
  statusBorder: '#001430',
  tick: 'rgba(67, 71, 79, 0.72)',
  tooltipBackground: '#001430',
  trendArea: 'rgba(0, 82, 204, 0.12)',
  trendBorder: '#002855',
  trendPointBorder: '#fffefb',
} as const;
