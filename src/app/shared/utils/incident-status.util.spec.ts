import { isIncidentUnresolved, UNRESOLVED_INCIDENT_STATUSES } from './incident-status.util';

describe('incident-status.util', () => {
  it('lists correct unresolved statuses', () => {
    expect(UNRESOLVED_INCIDENT_STATUSES).toEqual(['NEW', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS']);
  });

  it.each(['NEW', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS'] as const)(
    'returns true for unresolved status %s',
    (status) => {
      expect(isIncidentUnresolved(status)).toBe(true);
    },
  );

  it.each(['RESOLVED', 'REJECTED', 'CANCELLED'] as const)(
    'returns false for terminal status %s',
    (status) => {
      expect(isIncidentUnresolved(status)).toBe(false);
    },
  );
});
