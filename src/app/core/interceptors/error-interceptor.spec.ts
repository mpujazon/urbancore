import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { errorInterceptor } from './error-interceptor';

describe('errorInterceptor', () => {
  const createRequest = () => new HttpRequest('GET', '/any');

  it.each([
    [401, 'Your session has expired or you are not authorized.'],
    [403, 'You do not have Administrator permissions to perform this action.'],
    [404, 'The requested resource was not found.'],
    [500, 'The server is currently unavailable. Please try again later.'],
    [418, 'An unexpected error occurred.'],
  ])('shows mapped toast for HTTP %s', (statusCode, expectedMessage) => {
    const toastServiceMock = { showError: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: ToastService, useValue: toastServiceMock }],
    });

    const httpError = new HttpErrorResponse({ status: statusCode, statusText: 'Error' });
    const next = vi.fn(() => throwError(() => httpError));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(createRequest(), next).subscribe({
        next: () => {
          throw new Error('Expected error path only');
        },
        error: (received) => {
          expect(received).toBe(httpError);
        },
      });
    });

    expect(toastServiceMock.showError).toHaveBeenCalledWith(expectedMessage);
  });

  it('passes successful responses through unchanged', () => {
    const toastServiceMock = { showError: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: ToastService, useValue: toastServiceMock }],
    });

    const response = new HttpResponse({ status: 200, body: { ok: true } });
    const next = vi.fn(() => of(response));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(createRequest(), next).subscribe((value) => {
        expect(value).toBe(response);
      });
    });

    expect(toastServiceMock.showError).not.toHaveBeenCalled();
  });
});
