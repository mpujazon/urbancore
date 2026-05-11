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

export interface IncidentDetailVm {
  id: string;
  header: IncidentDetailHeaderVm;
  summary: IncidentDetailSummaryVm;
  description: string;
  location: IncidentDetailLocationVm;
  images: IncidentDetailImageVm[];
  statusHistory: IncidentDetailStatusHistoryVm[];
  plannedActions: IncidentDetailPlannedActionVm[];
}

export interface IncidentDetailHeaderVm {
  title: string;
  categoryLabel: string;
  statusLabel: string;
  statusTone: string;
  createdAtLabel: string;
  updatedAtLabel?: string;
}

export interface IncidentDetailSummaryVm {
  categoryLabel: string;
  statusLabel: string;
  statusTone: string;
  priorityLabel?: string;
  cityLabel?: string;
  areaLabel?: string;
  createdAtLabel: string;
  updatedAtLabel?: string;
}

export interface IncidentDetailImageVm {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
}

export interface IncidentDetailLocationVm {
  lat: number;
  lng: number;
  coordinatesLabel: string;
  addressLabel?: string;
  area?: string;
  city?: string;
}

export interface IncidentDetailStatusHistoryVm {
  id: string;
  fromStatusLabel?: string;
  toStatusLabel: string;
  statusTone: string;
  changedAtLabel: string;
  reason?: string;
}

export interface IncidentDetailPlannedActionVm {
  id: string;
  title: string;
  description?: string;
  statusLabel: string;
  statusTone?: string;
  scheduledStartLabel: string;
  scheduledEndLabel?: string;
}
