import type { IncidentCategory } from '../../../shared/models/incident-dto.model';

export interface IncidentSuggestionResponse {
  title: string;
  description: string;
  category: IncidentCategory | string;
}

export interface IncidentSuggestionFormValues {
  title: string;
  description: string;
  category: IncidentCategory;
}
