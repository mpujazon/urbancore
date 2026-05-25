import type { AdminIncidentListItemDto } from '../models/admin-incident-dto.model';
import { mapAdminIncidentDtoToVm } from './admin-incident.mapper';

describe('admin-incident.mapper', () => {
  it('maps DTO to row VM with labels and tones', () => {
    const dto: AdminIncidentListItemDto = {
      id: 'abc-def-1234-5678',
      title: 'Broken pavement',
      category: 'POTHOLE',
      status: 'UNDER_REVIEW',
      priority: 'HIGH',
      cityId: 'city-1',
      reporterDisplayName: '  Jane Doe  ',
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-01T10:00:00.000Z',
      linkedPlannedActionsCount: 3,
    };

    const vm = mapAdminIncidentDtoToVm(dto);

    expect(vm.id).toBe('abc-def-1234-5678');
    expect(vm.shortId).toBe('#ABCDEF12');
    expect(vm.title).toBe('Broken pavement');
    expect(vm.category).toEqual({ value: 'POTHOLE', label: 'Pothole' });
    expect(vm.status).toEqual({ value: 'UNDER_REVIEW', label: 'Under Review', tone: 'warning' });
    expect(vm.priority).toEqual({ value: 'HIGH', label: 'High', tone: 'high' });
    expect(vm.reporterLabel).toBe('Jane Doe');
    expect(vm.createdAtLabel).toBe('Jun 01, 2026');
    expect(vm.linkedPlannedActionsCount).toBe(3);
  });

  it('handles null priority with fallback labels', () => {
    const dto: AdminIncidentListItemDto = {
      id: 'inc-null',
      title: 'Unknown priority',
      category: 'OTHER',
      status: 'NEW',
      priority: null,
      cityId: 'city-1',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    };

    const vm = mapAdminIncidentDtoToVm(dto);

    expect(vm.priority).toEqual({ value: null, label: 'Unassigned', tone: 'neutral' });
  });

  it('falls back to Unknown reporter when display name is missing', () => {
    const dto: AdminIncidentListItemDto = {
      id: 'inc-no-reporter',
      title: 'Unknown reporter',
      category: 'OTHER',
      status: 'NEW',
      priority: null,
      cityId: 'city-1',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    };

    const vm = mapAdminIncidentDtoToVm(dto);

    expect(vm.reporterLabel).toBe('Unknown reporter');
  });

  it('generates short ID from uuid', () => {
    const dto: AdminIncidentListItemDto = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      title: 'Uuid test',
      category: 'LIGHTING',
      status: 'RESOLVED',
      priority: 'LOW',
      cityId: 'city-1',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    };

    const vm = mapAdminIncidentDtoToVm(dto);

    expect(vm.shortId).toBe('#F47AC10B');
  });

  it('returns Unknown date for invalid date strings', () => {
    const dto: AdminIncidentListItemDto = {
      id: 'inc-bad-date',
      title: 'Bad date',
      category: 'NOISE',
      status: 'CANCELLED',
      priority: null,
      cityId: 'city-1',
      createdAt: 'invalid-date',
      updatedAt: 'invalid-date',
    };

    const vm = mapAdminIncidentDtoToVm(dto);

    expect(vm.createdAtLabel).toBe('Unknown date');
  });
});
