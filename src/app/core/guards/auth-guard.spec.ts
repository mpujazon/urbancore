import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, firstValueFrom, isObservable } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { ToastService } from '../services/toast-service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  it('allows navigation when user is authenticated', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { user$: of({ uid: 'user-1' }) } },
        { provide: ToastService, useValue: { showInfo: vi.fn() } },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(),
          },
        },
      ],
    });

    const result = await TestBed.runInInjectionContext(() => resolveGuardResult(authGuard({} as never, {} as never)));
    expect(result).toBe(true);
  });

  it('redirects anonymous users and shows info toast', async () => {
    const toastServiceMock = { showInfo: vi.fn() };
    const redirectedTree = { redirectedTo: '/' };
    const routerMock = {
      createUrlTree: vi.fn().mockReturnValue(redirectedTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { user$: of(null) } },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    const result = await TestBed.runInInjectionContext(() => resolveGuardResult(authGuard({} as never, {} as never)));

    expect(result).toBe(redirectedTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(toastServiceMock.showInfo).toHaveBeenCalledWith('Please log in to access this page.');
  });
});

async function resolveGuardResult(result: unknown): Promise<unknown> {
  const awaited = await result;
  if (isObservable(awaited)) {
    return firstValueFrom(awaited);
  }

  return awaited;
}
