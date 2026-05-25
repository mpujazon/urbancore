import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { IncidentImageDto } from '../../../../shared/models/incident-dto.model';
import { CityContextService } from '../../../../core/services/city-context-service';
import { ToastService } from '../../../../core/services/toast-service';
import { ImageUploadService } from '../../services/image-upload-service';
import { IncidentSuggestionsApiService } from '../../services/incident-suggestions-api-service';
import { ReportIncidentApiService } from '../../services/report-incident-api-service';
import { ReportIncidentWizard } from './report-incident-wizard';

describe('ReportIncidentWizard', () => {
  const imageUploadServiceMock = {
    uploadImage: vi.fn(),
  };

  const reportIncidentApiMock = {
    createIncident: vi.fn(),
  };

  const incidentSuggestionsApiMock = {
    getIncidentSuggestions: vi.fn(),
  };

  const cityContextMock = {
    loadCities: vi.fn(),
  };

  const toastServiceMock = {
    showSuccess: vi.fn(),
    showInfo: vi.fn(),
  };

  const routerMock = {
    navigateByUrl: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: ImageUploadService, useValue: imageUploadServiceMock },
        { provide: ReportIncidentApiService, useValue: reportIncidentApiMock },
        { provide: IncidentSuggestionsApiService, useValue: incidentSuggestionsApiMock },
        { provide: CityContextService, useValue: cityContextMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('submits report successfully and redirects to dashboard', () => {
    const wizard = createWizard();
    const file = new File(['image-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const uploadedImage = createUploadedImage();

    prepareValidFormState(wizard, file);

    imageUploadServiceMock.uploadImage.mockReturnValue(of(uploadedImage));
    reportIncidentApiMock.createIncident.mockReturnValue(of({ id: 'inc-1' }));

    wizard.submitReport();

    expect(imageUploadServiceMock.uploadImage).toHaveBeenCalledWith(file);
    expect(reportIncidentApiMock.createIncident).toHaveBeenCalledOnce();

    const request = reportIncidentApiMock.createIncident.mock.calls[0][0];
    expect(request.title).toBe('Broken light post');
    expect(request.description).toBe('Street light has been broken for days.');
    expect(request.category).toBe('LIGHTING');
    expect(request.citySlug).toBe('es-barcelona');
    expect(request.location.addressLabel).toBe('Passeig de Gracia 1');
    expect(request.location.city).toBe('Barcelona');
    expect(request.location.geohash).toHaveLength(9);
    expect(request.images).toEqual([uploadedImage]);

    expect(cityContextMock.loadCities).toHaveBeenCalled();
    expect(toastServiceMock.showSuccess).toHaveBeenCalledWith('Incident reported successfully.');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(wizard.submitError()).toBeNull();
    expect(wizard.isSubmitting()).toBe(false);
  });

  it('sets submit error when create incident fails', () => {
    const wizard = createWizard();
    const file = new File(['image-bytes'], 'photo.jpg', { type: 'image/jpeg' });

    prepareValidFormState(wizard, file);

    imageUploadServiceMock.uploadImage.mockReturnValue(of(createUploadedImage()));
    reportIncidentApiMock.createIncident.mockReturnValue(throwError(() => new Error('failed')));

    wizard.submitReport();

    expect(wizard.submitError()).toBe('Could not submit the incident. Please try again.');
    expect(wizard.isSubmitting()).toBe(false);
  });

  it('autocompletes form and maps invalid category to OTHER', () => {
    const wizard = createWizard();
    const file = new File(['image-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    wizard.updateSelectedFiles([file]);
    incidentSuggestionsApiMock.getIncidentSuggestions.mockReturnValue(
      of({
        title: 'Detected issue title',
        description: 'Detected issue description',
        category: 'NOT_A_REAL_CATEGORY',
      }),
    );

    wizard.requestFormAutocomplete();

    expect(incidentSuggestionsApiMock.getIncidentSuggestions).toHaveBeenCalledWith(file);
    expect(wizard.suggestedFormValues()).toEqual({
      title: 'Detected issue title',
      description: 'Detected issue description',
      category: 'OTHER',
    });
    expect(wizard.autocompleteMessage()).toBe('Suggestions applied to the form.');
    expect(toastServiceMock.showInfo).toHaveBeenCalledWith('Incident form autocompleted from image.');
    expect(wizard.isAutocompleteLoading()).toBe(false);

    confirmSpy.mockRestore();
  });
});

function createWizard(): ReportIncidentWizard {
  return TestBed.runInInjectionContext(() => new ReportIncidentWizard());
}

function createUploadedImage(): IncidentImageDto {
  return {
    url: 'https://cdn.example.com/img.webp',
    thumbnailUrl: 'https://cdn.example.com/thumb.webp',
    publicId: 'incident/image-1',
    mimeType: 'image/webp',
    sizeKb: 42,
  };
}

function prepareValidFormState(wizard: ReportIncidentWizard, file: File): void {
  wizard.updateFormValues({
    title: 'Broken light post',
    description: 'Street light has been broken for days.',
    category: 'LIGHTING',
  });
  wizard.updateFormValidityState(true);
  wizard.updateSelectedFiles([file]);
  wizard.updateCoordinates({ lat: 41.3874, lng: 2.1686 });
  wizard.updateAddressLabel('Passeig de Gracia 1');
  wizard.updateCitySlug('es-barcelona');
  wizard.updateCity('Barcelona');
}
