import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  IncidentDto,
  IncidentExplorerQuery,
  IncidentListItemDto,
  IncidentPriority,
  IncidentStatus,
} from '../models/incident-dto.model';
import type { PagedResponseDto } from '../models/paged-response.model';
import type { CreateIncidentRequest } from '../../features/report-incident/models/incident-report.models';
import type { IncidentSuggestionResponse } from '../../features/report-incident/models/incident-suggestion.model';
import {CreatePlannedActionRequest} from '../models/planned-action.model';


@Injectable({
  providedIn: 'root',
})
export class IncidentsApiService {
  private readonly http = inject(HttpClient);

  createIncident(request: CreateIncidentRequest): Observable<IncidentDto> {
    return this.http.post<IncidentDto>(`${environment.API_BASE_URL}/incidents`, request);
  }

  getIncidentSuggestions(image: File): Observable<IncidentSuggestionResponse> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<IncidentSuggestionResponse>(
      `${environment.API_BASE_URL}/ai/incident-suggestions`,
      formData
    );
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

  updateIncidentStatus(id: string, status: IncidentStatus): Observable<IncidentDto> {
    return this.http.patch<IncidentDto>(`${environment.API_BASE_URL}/incidents/${id}/status`, { status });
  }

  updateIncidentPriority(id: string, priority: IncidentPriority): Observable<IncidentDto> {
    return this.http.patch<IncidentDto>(`${environment.API_BASE_URL}/incidents/${id}/priority`, { priority });
  }

  createPlannedAction(request: CreatePlannedActionRequest): Observable<IncidentDto> {
    return this.http.post<IncidentDto>(`${environment.API_BASE_URL}/planned-actions`, request);
  }

  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.API_BASE_URL}/incidents/${id}`);
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
