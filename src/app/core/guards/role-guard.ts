import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { UserRole } from '../../shared/models/user-dto.model';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  return auth.dbUser$.pipe(
    filter((user) => user !== null),
    take(1),
    map((user) => {
      const hasRoleAccess = user && (!allowedRoles?.length || allowedRoles.includes(user.role));

      return hasRoleAccess ? true : router.createUrlTree(['/unauthorized']);
    })
  );
};
