import { UserRoleLabelPipe } from './user-role-label.pipe';

describe('UserRoleLabelPipe', () => {
  const pipe = new UserRoleLabelPipe();

  it('returns Admin for ROLE_ADMIN', () => {
    expect(pipe.transform('ROLE_ADMIN')).toBe('Admin');
  });

  it('returns Citizen for ROLE_CITIZEN', () => {
    expect(pipe.transform('ROLE_CITIZEN')).toBe('Citizen');
  });

  it('returns Unlogged for null, undefined, or unlogged', () => {
    expect(pipe.transform(null)).toBe('Unlogged');
    expect(pipe.transform(undefined)).toBe('Unlogged');
    expect(pipe.transform('unlogged')).toBe('Unlogged');
  });
});
