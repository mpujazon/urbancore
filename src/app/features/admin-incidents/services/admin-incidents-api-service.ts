import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { PagedResponseDto } from '../../../shared/models/paged-response.model';
import { buildHttpParams } from '../../../shared/utils/http-params.util';
import type { AdminIncidentListItemDto } from '../models/admin-incident-dto.model';
import type { AdminIncidentQuery } from '../models/admin-incident-query.model';

@Injectable({ providedIn: 'root' })
export class AdminIncidentsApiService {
  private readonly http = inject(HttpClient);

  getAdminIncidents(query: AdminIncidentQuery): Observable<PagedResponseDto<AdminIncidentListItemDto>> {
    return this.http.get<PagedResponseDto<AdminIncidentListItemDto>>(
      `${environment.API_BASE_URL}/admin/incidents`,
      { params: buildHttpParams(query) },
    );
  }
}
