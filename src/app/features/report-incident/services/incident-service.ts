import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { IncidentDto } from '../../../shared/models/IncidentInterface';
import type { CreateIncidentRequest } from '../models/incident-report.models';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private readonly http = inject(HttpClient);

  getAllIncidents(): Observable<IncidentDto[]> {
    return this.http.get<IncidentDto[]>(`${environment.API_BASE_URL}/incidents`);
  }

  createIncident(request: CreateIncidentRequest): Observable<IncidentDto> {
    return this.http.post<IncidentDto>(`${environment.API_BASE_URL}/incidents`, request);
  }
  getSignedInCitizenIncidents(): Observable<IncidentDto[]> {
    return this.http.get<IncidentDto[]>(`${environment.API_BASE_URL}/incidents/me`);
  }

}
