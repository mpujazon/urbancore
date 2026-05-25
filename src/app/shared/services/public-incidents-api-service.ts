import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { IncidentDto, IncidentExplorerQuery, IncidentListItemDto } from '../models/incident-dto.model';
import type { PagedResponseDto } from '../models/paged-response.model';
import { buildHttpParams } from '../utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class PublicIncidentsApiService {
  private readonly http = inject(HttpClient);

  getPublicIncidents(query: IncidentExplorerQuery): Observable<PagedResponseDto<IncidentListItemDto>> {
    return this.http.get<PagedResponseDto<IncidentListItemDto>>(
      `${environment.API_BASE_URL}/incidents`,
      {
        params: buildHttpParams({
          ...query,
          q: query.q?.trim() || undefined,
        }),
      },
    );
  }

  getPublicIncidentById(id: string): Observable<IncidentDto> {
    return this.http.get<IncidentDto>(`${environment.API_BASE_URL}/incidents/${id}`);
  }
}
