export interface PlannedActionDto {
  id: string;
  incidentId: string;
  title: string;
  description?: string;
  status: PlannedActionStatus;
  scheduledStart: string;
  scheduledEnd?: string;
  assignedToUserId?: string;
}

export type PlannedActionStatus = 'PLANNED' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

export interface CreatePlannedActionRequest {
  incidentId: string;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd?: string;
  assignedToUserId?: number;
}

export interface PublicPlannedActionDto {
  id: string;
  incidentId: string;
  title: string;
  description?: string;
  status: PlannedActionStatus;
  scheduledStart: string;
  scheduledEnd?: string;
  cityId: string;
  incident?: {
    id: string;
    title: string;
    category: string;
    status: string;
    location?: {
      addressLabel?: string;
      area?: string;
    };
  };
}

export interface PublicPlannedActionsQuery {
  cityId?: string;
  dateFrom: string;
  dateTo: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
