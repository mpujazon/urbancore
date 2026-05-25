import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import type { UserDto } from '../../shared/models/user-dto.model';
import { AuthService } from '../services/auth-service';
import { roleGuard } from './role-guard';

describe('roleGuard', () => {
  const adminUser: UserDto = {
    id: 1,
    firebaseUid: 'admin-uid',
    email: 'admin@example.com',
    role: 'ROLE_ADMIN',
    cityId: 'city-1',
  };

  it('allows navigation when user role is included in route roles', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { dbUser$: of(adminUser) } },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn() },
        },
      ],
    });

    const route = { data: { roles: ['ROLE_ADMIN'] } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => resolveGuardResult(roleGuard(route, {} as never)));
    expect(result).toBe(true);
  });

  it('redirects when user role is not allowed', async () => {
    const redirectedTree = { redirectedTo: '/unauthorized' };
    const routerMock = {
      createUrlTree: vi.fn().mockReturnValue(redirectedTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { dbUser$: of(adminUser) } },
        { provide: Router, useValue: routerMock },
      ],
    });

    const route = { data: { roles: ['ROLE_CITIZEN'] } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => resolveGuardResult(roleGuard(route, {} as never)));
    expect(result).toBe(redirectedTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('allows navigation when route has no role restrictions', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { dbUser$: of(adminUser) } },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn() },
        },
      ],
    });

    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => resolveGuardResult(roleGuard(route, {} as never)));
    expect(result).toBe(true);
  });
});

async function resolveGuardResult(result: unknown): Promise<unknown> {
  const awaited = await result;
  if (isObservable(awaited)) {
    return firstValueFrom(awaited);
  }

  return awaited;
}
