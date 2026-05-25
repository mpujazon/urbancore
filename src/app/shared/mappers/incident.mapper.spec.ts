import type { IncidentDto, IncidentListItemDto } from '../models/incident-dto.model';
import type { PlannedActionDto } from '../models/planned-action.model';
import {
  formatCategory,
  formatDate,
  formatStatus,
  getCategoryIcon,
  getStatusStyleClass,
  mapIncidentListItemToCard,
  mapIncidentToDetailVm,
} from './incident.mapper';

describe('incident.mapper', () => {
  it('maps list item to card with thumbnail fallback', () => {
    const dto: IncidentListItemDto = {
      id: 'inc-1',
      title: 'Broken light',
      category: 'LIGHTING',
      status: 'UNDER_REVIEW',
      priority: 'MEDIUM',
      location: { lat: 41.38, lng: 2.17, geohash: 'sp3e3u', addressLabel: 'Main St', city: 'Barcelona' },
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    };

    const card = mapIncidentListItemToCard(dto);

    expect(card.id).toBe('inc-1');
    expect(card.title).toBe('Broken light');
    expect(card.category).toBe('Lighting');
    expect(card.categoryIconClass).toBe('fa-lightbulb');
    expect(card.status).toBe('Under Review');
    expect(card.statusStyleClass).toBe('is-review');
    expect(card.imageUrl).toBe('https://placehold.co/600x400?text=Incident');
    expect(card.addressLabel).toBe('Main St');
    expect(card.city).toBe('Barcelona');
    expect(card.date).toBe('Jan 01, 2026');
  });

  it('maps DTO to incident detail VM with all nested sections', () => {
    const dto: IncidentDto = {
      id: 'inc-1',
      title: 'Broken light',
      description: 'Street light is broken',
      category: 'LIGHTING',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      cityId: 'city-1',
      reporter: { id: 'reporter-1', displayName: 'Citizen', role: 'ROLE_CITIZEN' },
      location: { lat: 41.38, lng: 2.17, geohash: 'sp3e3u', addressLabel: 'Main St', city: 'Barcelona' },
      images: [
        { url: 'https://img.example.com/1.webp', thumbnailUrl: 'https://img.example.com/thumb1.webp', publicId: 'pub-1', mimeType: 'image/webp', sizeKb: 10 },
        { url: 'https://img.example.com/2.webp', thumbnailUrl: 'https://img.example.com/thumb2.webp', publicId: '', mimeType: 'image/webp', sizeKb: 20 },
      ],
      plannedActions: [
        { id: 'pa-1', incidentId: 'inc-1', title: 'Replace lamp', description: 'Electric task', status: 'PLANNED', scheduledStart: '2026-01-10T09:00:00.000Z' },
      ],
      statusHistory: [
        { id: 'sh-1', fromStatus: 'NEW', toStatus: 'UNDER_REVIEW', changedBy: 'admin', changedAt: '2026-01-02T10:00:00.000Z' },
      ],
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
    };

    const vm = mapIncidentToDetailVm(dto);

    expect(vm.id).toBe('INC-inc-1');
    expect(vm.rawId).toBe('inc-1');
    expect(vm.cityId).toBe('city-1');
    expect(vm.status).toBe('UNDER_REVIEW');
    expect(vm.reporterId).toBe('reporter-1');
    expect(vm.header.title).toBe('Broken light');
    expect(vm.header.categoryLabel).toBe('Lighting');
    expect(vm.header.statusLabel).toBe('Under Review');
    expect(vm.header.statusTone).toBe('is-review');
    expect(vm.header.createdAtLabel).toBe('Jan 01, 2026');
    expect(vm.header.updatedAtLabel).toBe('Jan 02, 2026');
    expect(vm.summary.priorityLabel).toBe('High');
    expect(vm.summary.cityLabel).toBe('Barcelona');
    expect(vm.description).toBe('Street light is broken');
    expect(vm.location.coordinatesLabel).toBe('41.3800° N, 2.1700° E');
    expect(vm.images).toHaveLength(2);
    expect(vm.images[0].alt).toContain('Public evidence image 1');
    expect(vm.images[1].alt).toContain('Public evidence image 2');
    expect(vm.statusHistory).toHaveLength(1);
    expect(vm.statusHistory[0].fromStatusLabel).toBe('New');
    expect(vm.statusHistory[0].toStatusLabel).toBe('Under Review');
    expect(vm.plannedActions).toHaveLength(1);
    expect(vm.plannedActions[0].statusLabel).toBe('Planned');
  });

  it('hides updatedAt label when same as createdAt', () => {
    const dto: IncidentDto = {
      id: 'inc-2',
      title: 'Pothole',
      description: 'Big pothole',
      category: 'POTHOLE',
      status: 'NEW',
      location: { lat: 41.38, lng: 2.17, geohash: 'sp3e3u' },
      images: [],
      plannedActions: [],
      statusHistory: [],
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    };

    const vm = mapIncidentToDetailVm(dto);

    expect(vm.header.updatedAtLabel).toBeUndefined();
  });

  it('handles undefined priority as no priority label', () => {
    const dto: IncidentDto = {
      id: 'inc-3',
      title: 'Graffiti',
      description: 'Wall graffiti',
      category: 'GRAFFITI',
      status: 'NEW',
      priority: 'UNDEFINED',
      location: { lat: 41.38, lng: 2.17, geohash: 'sp3e3u' },
      images: [],
      plannedActions: [],
      statusHistory: [],
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    };

    const vm = mapIncidentToDetailVm(dto);

    expect(vm.summary.priorityLabel).toBeUndefined();
  });

  it('formats category from SCREAMING_SNAKE_CASE to Title Case', () => {
    expect(formatCategory('STREET_FURNITURE')).toBe('Street Furniture');
    expect(formatCategory('POTHOLE')).toBe('Pothole');
  });

  it('returns icon class for every category', () => {
    expect(getCategoryIcon('POTHOLE')).toBe('fa-road');
    expect(getCategoryIcon('LIGHTING')).toBe('fa-lightbulb');
    expect(getCategoryIcon('STREET_FURNITURE')).toBe('fa-city');
    expect(getCategoryIcon('CLEANLINESS')).toBe('fa-trash-can');
    expect(getCategoryIcon('NOISE')).toBe('fa-volume-high');
    expect(getCategoryIcon('GRAFFITI')).toBe('fa-spray-can');
    expect(getCategoryIcon('OTHER')).toBe('fa-circle-question');
  });

  it('returns style class for every status', () => {
    expect(getStatusStyleClass('NEW')).toBe('is-new');
    expect(getStatusStyleClass('UNDER_REVIEW')).toBe('is-review');
    expect(getStatusStyleClass('PLANNED')).toBe('is-scheduled');
    expect(getStatusStyleClass('IN_PROGRESS')).toBe('is-progress');
    expect(getStatusStyleClass('RESOLVED')).toBe('is-resolved');
    expect(getStatusStyleClass('REJECTED')).toBe('is-rejected');
    expect(getStatusStyleClass('CANCELLED')).toBe('is-cancelled');
  });

  it('formats status from ENUM to Title Case', () => {
    expect(formatStatus('UNDER_REVIEW')).toBe('Under Review');
    expect(formatStatus('IN_PROGRESS')).toBe('In Progress');
  });

  it('falls back to raw string on invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});
