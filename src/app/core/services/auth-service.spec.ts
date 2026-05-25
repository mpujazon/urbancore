import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { UserDto } from '../../shared/models/user-dto.model';
import { ToastService } from './toast-service';
import { AuthService } from './auth-service';

const authState$ = new BehaviorSubject<unknown>(null);
const signInWithPopupMock = vi.fn();
const signOutMock = vi.fn();
const getIdTokenMock = vi.fn();

vi.mock('@angular/fire/auth', async () => {
  return {
    Auth: class {},
    GoogleAuthProvider: class {},
    authState: () => authState$.asObservable(),
    signInWithPopup: (...args: unknown[]) => signInWithPopupMock(...args),
    signOut: (...args: unknown[]) => signOutMock(...args),
    getIdToken: (...args: unknown[]) => getIdTokenMock(...args),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let toastServiceMock: { showSuccess: ReturnType<typeof vi.fn>; showInfo: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };
  let routerMock: { navigateByUrl: ReturnType<typeof vi.fn> };
  let authMock: { currentUser: unknown };

  const dbCitizen: UserDto = {
    id: 1,
    firebaseUid: 'citizen-uid',
    email: 'citizen@example.com',
    role: 'ROLE_CITIZEN',
    cityId: 'city-1',
  };

  const dbAdmin: UserDto = {
    id: 2,
    firebaseUid: 'admin-uid',
    email: 'admin@example.com',
    role: 'ROLE_ADMIN',
    cityId: 'city-1',
  };

  beforeEach(() => {
    authState$.next(null);
    signInWithPopupMock.mockReset();
    signOutMock.mockReset();
    getIdTokenMock.mockReset();

    toastServiceMock = {
      showSuccess: vi.fn(),
      showInfo: vi.fn(),
      showError: vi.fn(),
    };

    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    authMock = { currentUser: null };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Auth, useValue: authMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('syncs firebase user with backend and redirects citizen after login', async () => {
    signInWithPopupMock.mockResolvedValue({});

    authState$.next({ uid: 'firebase-user' });

    const loginPromise = service.loginWithGoogle();

    const syncRequest = httpMock.expectOne(`${environment.API_BASE_URL}/auth/sync`);
    expect(syncRequest.request.method).toBe('POST');
    syncRequest.flush(dbCitizen);

    await loginPromise;

    expect(toastServiceMock.showSuccess).toHaveBeenCalledWith('Successfully logged in! Welcome.');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects admin users to admin incidents after login', async () => {
    signInWithPopupMock.mockResolvedValue({});
    authState$.next({ uid: 'firebase-admin' });

    const loginPromise = service.loginWithGoogle();

    const syncRequest = httpMock.expectOne(`${environment.API_BASE_URL}/auth/sync`);
    syncRequest.flush(dbAdmin);

    await loginPromise;

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/admin/incidents');
  });

  it('shows error and rethrows when Google login fails', async () => {
    const error = new Error('popup closed');
    signInWithPopupMock.mockRejectedValue(error);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(service.loginWithGoogle()).rejects.toThrow('popup closed');

    expect(toastServiceMock.showError).toHaveBeenCalledWith('Authentication failed or was cancelled.');
    consoleErrorSpy.mockRestore();
  });

  it('gets token from current Firebase user', async () => {
    const user = { uid: 'firebase-user' };
    authMock.currentUser = user;
    getIdTokenMock.mockResolvedValue('jwt-token');

    await expect(service.getToken()).resolves.toBe('jwt-token');
    expect(getIdTokenMock).toHaveBeenCalledWith(user);
  });

  it('returns null token when no current user exists', async () => {
    authMock.currentUser = null;

    await expect(service.getToken()).resolves.toBeNull();
    expect(getIdTokenMock).not.toHaveBeenCalled();
  });

  it('logs out successfully and shows info toast', async () => {
    signOutMock.mockResolvedValue(undefined);

    await service.logout();

    expect(signOutMock).toHaveBeenCalled();
    expect(toastServiceMock.showInfo).toHaveBeenCalledWith('You have been logged out.');
  });
});
