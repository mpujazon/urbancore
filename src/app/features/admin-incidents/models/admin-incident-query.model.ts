import type {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
} from '../../../shared/models/incident-dto.model';

export type ResourceStatus = 'idle' | 'loading' | 'success' | 'error';

export type AdminIncidentSortField = 'createdAt' | 'title' | 'category' | 'priority' | 'status';
export type AdminIncidentSortDirection = 'asc' | 'desc';
export type AdminIncidentSort = `${AdminIncidentSortField},${AdminIncidentSortDirection}`;

export interface AdminIncidentFilters {
  search?: string;
  status?: IncidentStatus;
  category?: IncidentCategory;
  priority?: IncidentPriority;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminIncidentQuery extends AdminIncidentFilters {
  page: number;
  size: number;
  sort: AdminIncidentSort;
}

export interface ApiError {
  message: string;
  status?: number;
}
