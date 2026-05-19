import type {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
} from '../../../shared/models/incident-dto.model';

export interface AdminIncidentListItemDto {
  id: string;
  title: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: IncidentPriority | null;
  cityId: string;
  reporterId?: string;
  reporterDisplayName?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  linkedPlannedActionsCount?: number;
}
