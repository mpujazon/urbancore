import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { IncidentSuggestionResponse } from '../models/incident-suggestion.model';

@Injectable({ providedIn: 'root' })
export class IncidentSuggestionsApiService {
  private readonly http = inject(HttpClient);

  getIncidentSuggestions(image: File): Observable<IncidentSuggestionResponse> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<IncidentSuggestionResponse>(
      `${environment.API_BASE_URL}/ai/incident-suggestions`,
      formData,
    );
  }
}
