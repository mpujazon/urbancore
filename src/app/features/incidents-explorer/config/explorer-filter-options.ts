import {IncidentCategory, IncidentPriority, IncidentStatus} from '../../../shared/models/incident-dto.model';

export const statusOptions: { value: IncidentStatus| ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const categoryOptions: { value: IncidentCategory | ''; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'POTHOLE', label: 'Pothole' },
  { value: 'LIGHTING', label: 'Lighting' },
  { value: 'STREET_FURNITURE', label: 'Street Furniture' },
  { value: 'CLEANLINESS', label: 'Cleanliness' },
  { value: 'NOISE', label: 'Noise' },
  { value: 'GRAFFITI', label: 'Graffiti' },
  { value: 'OTHER', label: 'Other' },
];

export const priorityOptions: { value: IncidentPriority | ''; label: string }[] = [
  { value: '', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];
