import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { IncidentDto } from '../models/incident-dto.model';
import type {
  CreatePlannedActionRequest,
  PublicPlannedActionDto,
  PublicPlannedActionsQuery,
} from '../models/planned-action.model';

@Injectable({ providedIn: 'root' })
export class PlannedActionsApiService {
  private readonly http = inject(HttpClient);

  getPublicPlannedActions(query: PublicPlannedActionsQuery): Observable<PublicPlannedActionDto[]> {
    let params = new HttpParams()
      .set('dateFrom', query.dateFrom)
      .set('dateTo', query.dateTo);

    if (query.cityId) {
      params = params.set('cityId', query.cityId);
    }

    return this.http.get<PublicPlannedActionDto[]>(`${environment.API_BASE_URL}/planned-actions`, {
      params,
    });
  }

  createPlannedAction(request: CreatePlannedActionRequest): Observable<IncidentDto> {
    return this.http.post<IncidentDto>(`${environment.API_BASE_URL}/planned-actions`, request);
  }
}
