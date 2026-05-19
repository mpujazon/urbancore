import type {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
} from '../../../shared/models/incident-dto.model';

export type AdminIncidentStatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';
export type AdminIncidentPriorityTone = 'neutral' | 'low' | 'medium' | 'high' | 'critical';

export interface AdminIncidentRowVm {
  id: string;
  shortId: string;
  title: string;
  category: {
    value: IncidentCategory;
    label: string;
  };
  status: {
    value: IncidentStatus;
    label: string;
    tone: AdminIncidentStatusTone;
  };
  priority: {
    value: IncidentPriority | null;
    label: string;
    tone: AdminIncidentPriorityTone;
  };
  reporterLabel: string;
  createdAtLabel: string;
  linkedPlannedActionsCount: number;
}
