import { IncidentCategory, IncidentDto, IncidentListItemDto, IncidentStatus } from '../models/incident-dto.model';
import { IncidentCardVm } from '../models/incident-vm.model';

export const mapIncidentListItemToCard = (dto: IncidentListItemDto): IncidentCardVm => ({
  id: dto.id,
  category: formatCategory(dto.category),
  categoryIconClass: getCategoryIcon(dto.category),
  date: formatDate(dto.createdAt),
  title: dto.title,
  imageUrl:
    dto.thumbnailUrl ||
    'https://placehold.co/600x400?text=Incident',
  addressLabel: dto.location?.addressLabel || '',
  city: dto.location?.city || '',
  status: formatStatus(dto.status),
  statusStyleClass: getStatusStyleClass(dto.status),
});

export const formatCategory = (category: IncidentCategory): string =>
  category
    .toLowerCase()
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');

export const getCategoryIcon = (category: IncidentCategory): string => {
  switch (category) {
    case 'POTHOLE':
      return 'fa-road';
    case 'LIGHTING':
      return 'fa-lightbulb';
    case 'STREET_FURNITURE':
      return 'fa-city';
    case 'CLEANLINESS':
      return 'fa-trash-can';
    case 'NOISE':
      return 'fa-volume-high';
    case 'GRAFFITI':
      return 'fa-spray-can';
    case 'OTHER':
    default:
      return 'fa-circle-question';
  }
};

export const getStatusStyleClass = (status: IncidentStatus): string => {
  switch (status) {
    case 'NEW':
      return 'is-new';
    case 'REJECTED':
      return 'is-rejected';
    case 'IN_PROGRESS':
      return 'is-progress';
    case 'UNDER_REVIEW':
      return 'is-review';
    case 'PLANNED':
      return 'is-scheduled';
    case 'RESOLVED':
      return 'is-resolved';
    case 'CANCELLED':
      return 'is-cancelled';
    default:
      return 'is-resolved';
  }
};

export const formatDate = (dateValue: string): string => {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
};

export const formatStatus = (status: IncidentStatus): string =>
  status
    .toLowerCase()
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
