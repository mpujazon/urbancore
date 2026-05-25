import type { IncidentExplorerQuery } from '../../../shared/models/incident-dto.model';
import type { IncidentExplorerFilters } from '../../../shared/models/incident-vm.model';

export interface IncidentExplorerHydratedState {
  filters: IncidentExplorerFilters;
  page: number;
  size: number;
  sort: string;
}

export const INCIDENTS_EXPLORER_DEFAULT_PAGE = 0;
export const INCIDENTS_EXPLORER_DEFAULT_SIZE = 10;
export const INCIDENTS_EXPLORER_DEFAULT_SORT = 'createdAt,desc';

export function hydrateIncidentsExplorerState(
  params: Record<string, string | undefined>,
): IncidentExplorerHydratedState {
  const filters: IncidentExplorerFilters = {};

  if (params['q']) filters.q = params['q'];
  if (params['status']) filters.status = params['status'] as IncidentExplorerFilters['status'];
  if (params['category']) filters.category = params['category'] as IncidentExplorerFilters['category'];
  if (params['priority']) filters.priority = params['priority'] as IncidentExplorerFilters['priority'];
  if (params['from']) filters.from = params['from'];
  if (params['to']) filters.to = params['to'];

  const page = params['page'] ? Number(params['page']) : INCIDENTS_EXPLORER_DEFAULT_PAGE;
  const size = params['size'] ? Number(params['size']) : INCIDENTS_EXPLORER_DEFAULT_SIZE;
  const sort = params['sort'] || INCIDENTS_EXPLORER_DEFAULT_SORT;

  return {
    filters,
    page: Number.isNaN(page) ? INCIDENTS_EXPLORER_DEFAULT_PAGE : page,
    size:
      Number.isNaN(size) || size < 1 || size > 50
        ? INCIDENTS_EXPLORER_DEFAULT_SIZE
        : size,
    sort,
  };
}

export function buildIncidentsExplorerQueryParams(state: {
  filters: IncidentExplorerFilters;
  page: number;
  size: number;
  sort: string;
}): Record<string, string | undefined> {
  const f = state.filters;
  const params: Record<string, string | undefined> = {};

  if (f.q?.trim()) params['q'] = f.q.trim();
  if (f.status) params['status'] = f.status;
  if (f.category) params['category'] = f.category;
  if (f.priority) params['priority'] = f.priority;
  if (f.from) params['from'] = f.from;
  if (f.to) params['to'] = f.to;

  params['page'] = state.page > INCIDENTS_EXPLORER_DEFAULT_PAGE ? String(state.page) : undefined;
  params['size'] = state.size !== INCIDENTS_EXPLORER_DEFAULT_SIZE ? String(state.size) : undefined;
  params['sort'] = state.sort !== INCIDENTS_EXPLORER_DEFAULT_SORT ? state.sort : undefined;

  return params;
}

export function buildIncidentsExplorerQuery(state: {
  filters: IncidentExplorerFilters;
  page: number;
  size: number;
  sort: string;
  cityId?: string;
}): IncidentExplorerQuery {
  const f = state.filters;
  const query: IncidentExplorerQuery = {
    page: state.page,
    size: state.size,
    sort: state.sort,
  };

  if (f.q?.trim()) query.q = f.q.trim();
  if (f.status) query.status = f.status;
  if (f.category) query.category = f.category;
  if (f.priority) query.priority = f.priority;
  if (state.cityId) query.cityId = state.cityId;
  if (f.from) query.from = f.from;
  if (f.to) query.to = f.to;

  return query;
}
