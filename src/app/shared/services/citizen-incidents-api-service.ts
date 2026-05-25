import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { IncidentListItemDto } from '../models/incident-dto.model';

@Injectable({ providedIn: 'root' })
export class CitizenIncidentsApiService {
  private readonly http = inject(HttpClient);

  getSignedInCitizenIncidents(): Observable<IncidentListItemDto[]> {
    return this.http.get<IncidentListItemDto[]>(`${environment.API_BASE_URL}/incidents/me`);
  }
}
