import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  IncidentDto,
  IncidentExplorerQuery,
  IncidentListItemDto,
} from '../models/incident-dto.model';
import type { PagedResponseDto } from '../models/paged-response.model';
import type { CreateIncidentRequest } from '../../features/report-incident/models/incident-report.models';

@Injectable({
  providedIn: 'root',
})
export class IncidentsApiService {
  private readonly http = inject(HttpClient);

  createIncident(request: CreateIncidentRequest): Observable<IncidentDto> {
    return this.http.post<IncidentDto>(`${environment.API_BASE_URL}/incidents`, request);
  }

  getSignedInCitizenIncidents(): Observable<IncidentListItemDto[]> {
    return this.http.get<IncidentListItemDto[]>(`${environment.API_BASE_URL}/incidents/me`);
  }

  getPublicIncidents(query: IncidentExplorerQuery): Observable<PagedResponseDto<IncidentListItemDto>> {
    return this.http.get<PagedResponseDto<IncidentListItemDto>>(
      `${environment.API_BASE_URL}/incidents`,
      {
        params: this.buildHttpParams({
          ...query,
          q: query.q?.trim() || undefined,
        }),
      },
    );
  }

  getPublicIncidentById(id: string): Observable<IncidentDto> {
    return this.http.get<IncidentDto>(`${environment.API_BASE_URL}/incidents/${id}`);
  }

  private buildHttpParams(paramsObject: Record<string, unknown>): HttpParams {
    let params = new HttpParams();

    Object.entries(paramsObject).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
