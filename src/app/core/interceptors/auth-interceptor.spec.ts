import { HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth-service';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  it('adds bearer token for UrbanCore API requests', async () => {
    const next = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200, url: req.url })));
    const authServiceMock = {
      getToken: vi.fn().mockResolvedValue('token-123'),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });

    const request = new HttpRequest('GET', `${environment.API_BASE_URL}/incidents`);

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        authInterceptor(request, next).subscribe(() => {
          const forwardedRequest = next.mock.calls[0][0] as HttpRequest<unknown>;
          expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer token-123');
          resolve();
        });
      });
    });

    expect(authServiceMock.getToken).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
  });

  it('does not attach token for non-UrbanCore requests', () => {
    const next = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200, url: req.url })));
    const authServiceMock = {
      getToken: vi.fn().mockResolvedValue('token-123'),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });

    const request = new HttpRequest('GET', 'https://third-party.example.com/data');

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next).subscribe();
    });

    const forwardedRequest = next.mock.calls[0][0] as HttpRequest<unknown>;
    expect(forwardedRequest.headers.has('Authorization')).toBe(false);
    expect(authServiceMock.getToken).not.toHaveBeenCalled();
  });

  it('forwards original UrbanCore request when token is missing', async () => {
    const next = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200, url: req.url })));
    const authServiceMock = {
      getToken: vi.fn().mockResolvedValue(null),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });

    const request = new HttpRequest('GET', `${environment.API_BASE_URL}/incidents`);

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        authInterceptor(request, next).subscribe(() => {
          const forwardedRequest = next.mock.calls[0][0] as HttpRequest<unknown>;
          expect(forwardedRequest.headers.has('Authorization')).toBe(false);
          resolve();
        });
      });
    });

    expect(authServiceMock.getToken).toHaveBeenCalledOnce();
  });
});
