import { PlannedActionDto } from './PlannedActionInterface';
import { UserRole } from './UserInterface';
export interface IncidentDto{
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority?: IncidentPriorityDto;
  cityId?: string;
  reporter?: IncidentReporterDto;
  location: IncidentLocationDto;
  images: IncidentImageDto[];
  plannedActions: PlannedActionDto[];
  statusHistory: IncidentStatusHistoryDto[];
  createdAt: string;
  updatedAt: string;
}

type IncidentCategory =
  | 'POTHOLE'
  | 'LIGHTING'
  | 'STREET_FURNITURE'
  | 'CLEANLINESS'
  | 'NOISE'
  | 'GRAFFITI'
  | 'OTHER';

type IncidentStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED';

type IncidentPriorityDto = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface IncidentLocationDto {
  lat: number;
  lng: number;
  addressLabel?: string;
  area?: string;

}

interface IncidentImageDto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  publicId: string;
  mimeType?: string;
  sizeKb?: number;
}

interface IncidentReporterDto {
  id: string;
  displayName: string;
  role: UserRole;
}

interface IncidentStatusHistoryDto {
  id: string;
  fromStatus: IncidentStatus;
  toStatus: IncidentStatus;
  changedBy?: string;
  reason?: string;
  changedAt: string;
}
