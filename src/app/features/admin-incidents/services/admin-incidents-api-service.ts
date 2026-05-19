import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { PagedResponseDto } from '../../../shared/models/paged-response.model';
import type { AdminIncidentListItemDto } from '../models/admin-incident-dto.model';
import type { AdminIncidentQuery } from '../models/admin-incident-query.model';

@Injectable({ providedIn: 'root' })
export class AdminIncidentsApiService {
  private readonly http = inject(HttpClient);

  getAdminIncidents(query: AdminIncidentQuery): Observable<PagedResponseDto<AdminIncidentListItemDto>> {
    return this.http.get<PagedResponseDto<AdminIncidentListItemDto>>(
      `${environment.API_BASE_URL}/admin/incidents`,
      { params: this.buildHttpParams(query) },
    );
  }

  private buildHttpParams(query: AdminIncidentQuery): HttpParams {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('size', String(query.size))
      .set('sort', query.sort);

    Object.entries(query).forEach(([key, value]) => {
      if (key === 'page' || key === 'size' || key === 'sort') {
        return;
      }

      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params = params.set(key, String(value).trim());
      }
    });

    return params;
  }
}
