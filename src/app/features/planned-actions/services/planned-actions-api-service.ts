import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PublicPlannedActionDto, PublicPlannedActionsQuery } from '../models/planned-action-dto.model';

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
}
