import type { IncidentImageDto } from '../../features/report-incident/models/upload.models';
import type { PlannedActionDto } from './planned-action.model';
import type { UserRole } from './user-dto.model';

export interface IncidentDto{
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority?: IncidentPriority;
  cityId?: string;
  reporter?: IncidentReporterDto;
  location: IncidentLocationDto;
  images: IncidentImageDto[];
  plannedActions: PlannedActionDto[];
  statusHistory: IncidentStatusHistoryDto[];
  createdAt: string;
  updatedAt: string;
}

export type IncidentCategory =
  | 'POTHOLE'
  | 'LIGHTING'
  | 'STREET_FURNITURE'
  | 'CLEANLINESS'
  | 'NOISE'
  | 'GRAFFITI'
  | 'OTHER';

export type IncidentStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED';

export type IncidentPriority = 'UNDEFINED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IncidentLocationDto {
  lat: number;
  lng: number;
  addressLabel?: string;
  area?: string;
  city?: string;
  geohash: string;
}

export interface IncidentReporterDto {
  id: string;
  displayName: string;
  role: UserRole;
}

export interface IncidentStatusHistoryDto {
  id: string;
  fromStatus: IncidentStatus;
  toStatus: IncidentStatus;
  changedBy?: string;
  reason?: string;
  changedAt: string;
}

export interface IncidentCoordinates{
  lat: number;
  lng: number;
}

export interface IncidentListItemDto {
  id: string;
  title: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: IncidentPriority;
  cityId?: string;
  thumbnailUrl?: string;
  location: IncidentLocationDto;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentExplorerQuery {
  q?: string;
  status?: IncidentStatus;
  category?: IncidentCategory;
  priority?: IncidentPriority;
  cityId?: string;
  from?: string;
  to?: string;
  page: number;
  size: number;
  sort: string;
}
