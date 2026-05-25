import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { IncidentDto, IncidentPriority, IncidentStatus } from '../models/incident-dto.model';

@Injectable({ providedIn: 'root' })
export class IncidentManagementApiService {
  private readonly http = inject(HttpClient);

  updateIncidentStatus(id: string, status: IncidentStatus): Observable<IncidentDto> {
    return this.http.patch<IncidentDto>(`${environment.API_BASE_URL}/incidents/${id}/status`, { status });
  }

  updateIncidentPriority(id: string, priority: IncidentPriority): Observable<IncidentDto> {
    return this.http.patch<IncidentDto>(`${environment.API_BASE_URL}/incidents/${id}/priority`, { priority });
  }

  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.API_BASE_URL}/incidents/${id}`);
  }
}
