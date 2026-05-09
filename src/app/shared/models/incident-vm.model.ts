import type { IncidentCategory, IncidentPriority, IncidentStatus } from './incident-dto.model';

export interface IncidentCardVm {
  id: string;
  category: string;
  categoryIconClass: string;
  date: string;
  title: string;
  imageUrl: string;
  addressLabel: string;
  city: string;
  status: string;
  statusStyleClass: string;
}

export type IncidentCardVariant = 'DETAILED' | 'COMPACT';

export interface IncidentExplorerFilters {
  q?: string;
  status?: IncidentStatus;
  category?: IncidentCategory;
  priority?: IncidentPriority;
  cityId?: string;
  from?: string;
  to?: string;
}
