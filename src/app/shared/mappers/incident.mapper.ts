import {
  IncidentCategory,
  IncidentDto,
  IncidentListItemDto,
  IncidentPriority,
  IncidentStatus,
} from '../models/incident-dto.model';
import { PlannedActionDto } from '../models/planned-action.model';
import { IncidentCardVm, IncidentDetailPlannedActionVm, IncidentDetailVm } from '../models/incident-vm.model';

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

export const mapIncidentToDetailVm = (dto: IncidentDto): IncidentDetailVm => {
  const statusLabel = formatStatus(dto.status);
  const statusTone = getStatusStyleClass(dto.status);
  const createdAtLabel = formatDate(dto.createdAt);
  const updatedAtLabel = dto.updatedAt && dto.updatedAt !== dto.createdAt ? formatDate(dto.updatedAt) : undefined;
  const categoryLabel = formatCategory(dto.category);

  return {
    id: dto.id,
    header: {
      title: dto.title,
      categoryLabel,
      statusLabel,
      statusTone,
      createdAtLabel,
      updatedAtLabel,
    },
    summary: {
      categoryLabel,
      statusLabel,
      statusTone,
      priorityLabel: formatPriority(dto.priority),
      cityLabel: dto.location?.city,
      areaLabel: dto.location?.area,
      createdAtLabel,
      updatedAtLabel,
    },
    description: dto.description,
    location: {
      lat: dto.location.lat,
      lng: dto.location.lng,
      coordinatesLabel: formatCoordinates(dto.location.lat, dto.location.lng),
      addressLabel: dto.location.addressLabel,
      area: dto.location.area,
      city: dto.location.city,
    },
    images: (dto.images ?? []).map((image, index) => ({
      id: image.publicId || `${dto.id}-image-${index}`,
      url: image.url,
      thumbnailUrl: image.thumbnailUrl,
      alt: `Public evidence image ${index + 1} for ${dto.title}`,
    })),
    statusHistory: (dto.statusHistory ?? []).map((item) => ({
      id: item.id,
      fromStatusLabel: item.fromStatus ? formatStatus(item.fromStatus) : undefined,
      toStatusLabel: formatStatus(item.toStatus),
      statusTone: getStatusStyleClass(item.toStatus),
      changedAtLabel: formatDate(item.changedAt),
      reason: item.reason,
    })),
    plannedActions: (dto.plannedActions ?? []).map(mapPlannedActionToVm),
  };
};

const formatPriority = (priority?: IncidentPriority): string | undefined => {
  if (!priority || priority === 'UNDEFINED') {
    return undefined;
  }

  return priority
    .toLowerCase()
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
};

const formatCoordinates = (lat: number, lng: number): string => `${lat.toFixed(4)}° N, ${Math.abs(lng).toFixed(4)}° ${lng < 0 ? 'W' : 'E'}`;

const mapPlannedActionToVm = (dto: PlannedActionDto): IncidentDetailPlannedActionVm => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  statusLabel: formatPlannedActionStatus(dto.status),
  statusTone: getPlannedActionTone(dto.status),
  scheduledStartLabel: formatDate(dto.scheduledStart),
  scheduledEndLabel: dto.scheduledEnd ? formatDate(dto.scheduledEnd) : undefined,
});

const formatPlannedActionStatus = (status: PlannedActionDto['status']): string =>
  status
    .toLowerCase()
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');

const getPlannedActionTone = (status: PlannedActionDto['status']): string => {
  switch (status) {
    case 'DONE':
      return 'is-resolved';
    case 'CONFIRMED':
      return 'is-progress';
    case 'CANCELLED':
      return 'is-rejected';
    case 'PLANNED':
    default:
      return 'is-scheduled';
  }
};
