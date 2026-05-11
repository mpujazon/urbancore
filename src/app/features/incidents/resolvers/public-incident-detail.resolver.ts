import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, throwError } from 'rxjs';
import { mapIncidentToDetailVm } from '../../../shared/mappers/incident.mapper';
import type { IncidentDetailVm } from '../../../shared/models/incident-vm.model';
import { IncidentsApiService } from '../../../shared/services/incidents-api-service';

export const publicIncidentDetailResolver: ResolveFn<IncidentDetailVm | RedirectCommand> = (
  route: ActivatedRouteSnapshot,
) => {
  const incidentsApi = inject(IncidentsApiService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id?.trim()) {
    return new RedirectCommand(router.parseUrl('/incidents'));
  }

  return incidentsApi.getPublicIncidentById(id).pipe(
    map(mapIncidentToDetailVm),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return [new RedirectCommand(router.parseUrl('/incidents'))];
      }

      return throwError(() => error);
    }),
  );
};
