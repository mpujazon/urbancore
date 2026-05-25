import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { IncidentSuggestionsApiService } from './incident-suggestions-api-service';

describe('IncidentSuggestionsApiService', () => {
  let service: IncidentSuggestionsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(IncidentSuggestionsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts image as FormData to AI suggestions endpoint', () => {
    const file = new File(['fake'], 'incident.jpg', { type: 'image/jpeg' });

    service.getIncidentSuggestions(file).subscribe();

    const request = httpMock.expectOne(`${environment.API_BASE_URL}/ai/incident-suggestions`);
    expect(request.request.method).toBe('POST');

    const formData = request.request.body as FormData;
    expect(formData.get('image')).toBe(file);

    request.flush({
      title: 'Broken road sign',
      description: 'Road sign is tilted and hard to read.',
      category: 'OTHER',
    });
  });
});
