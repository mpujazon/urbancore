import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred.';

      if (error.status === 401) {
        errorMessage = 'Your session has expired or you are not authorized.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have Administrator permissions to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 500) {
        errorMessage = 'The server is currently unavailable. Please try again later.';
      }

      toastService.showError(errorMessage);

      return throwError(() => error);
    })
  );
};
