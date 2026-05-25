import { PermissionsService } from './permissions-service';
import type { CurrentUser, IncidentPermissionContext } from './permissions.model';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(() => {
    service = new PermissionsService();
  });

  it('allows admin management when admin and incident share city', () => {
    const user: CurrentUser = { id: '1', role: 'ROLE_ADMIN', cityId: 'city-1' };
    const incident: IncidentPermissionContext = {
      id: 'inc-1',
      cityId: 'city-1',
      status: 'UNDER_REVIEW',
    };

    expect(service.canManageIncident(user, incident)).toBe(true);
  });

  it('blocks admin management when admin and incident cities differ', () => {
    const user: CurrentUser = { id: '1', role: 'ROLE_ADMIN', cityId: 'city-1' };
    const incident: IncidentPermissionContext = {
      id: 'inc-1',
      cityId: 'city-2',
      status: 'UNDER_REVIEW',
    };

    expect(service.canManageIncident(user, incident)).toBe(false);
  });

  it('blocks admin management when incident city is missing', () => {
    const user: CurrentUser = { id: '1', role: 'ROLE_ADMIN', cityId: 'city-1' };
    const incident: IncidentPermissionContext = {
      id: 'inc-1',
      status: 'UNDER_REVIEW',
    };

    expect(service.canManageIncident(user, incident)).toBe(false);
  });

  it('allows admin deletion for NEW incidents in the same city', () => {
    const user: CurrentUser = { id: '1', role: 'ROLE_ADMIN', cityId: 'city-1' };
    const incident: IncidentPermissionContext = {
      id: 'inc-1',
      cityId: 'city-1',
      status: 'NEW',
    };

    expect(service.canDeleteIncident(user, incident)).toBe(true);
  });

  it('blocks admin deletion for NEW incidents in a different city', () => {
    const user: CurrentUser = { id: '1', role: 'ROLE_ADMIN', cityId: 'city-1' };
    const incident: IncidentPermissionContext = {
      id: 'inc-1',
      cityId: 'city-2',
      status: 'NEW',
    };

    expect(service.canDeleteIncident(user, incident)).toBe(false);
  });
});
