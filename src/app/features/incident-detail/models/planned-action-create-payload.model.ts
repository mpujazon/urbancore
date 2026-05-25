export interface PlannedActionCreatePayload {
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd?: string;
}
