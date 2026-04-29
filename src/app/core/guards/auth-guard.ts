import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return auth.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }

      toastService.showInfo('Please log in to access this page.');
      return router.createUrlTree(['/']);
    })
  );
};
