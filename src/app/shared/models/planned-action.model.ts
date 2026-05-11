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
