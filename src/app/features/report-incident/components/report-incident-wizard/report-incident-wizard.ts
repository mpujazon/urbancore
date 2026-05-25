import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { encode } from 'ngeohash';
import { finalize, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { CityContextService } from '../../../../core/services/city-context-service';
import { ToastService } from '../../../../core/services/toast-service';
import type { CreateIncidentRequest } from '../../models/incident-report.models';
import type { IncidentSuggestionFormValues, IncidentSuggestionResponse } from '../../models/incident-suggestion.model';
import type { IncidentImageDto } from '../../../../shared/models/incident-dto.model';
import { ImageUploadService } from '../../services/image-upload-service';
import { IncidentSuggestionsApiService } from '../../services/incident-suggestions-api-service';
import { ReportIncidentApiService } from '../../services/report-incident-api-service';
import { ReportIncidentForm, ReportIncidentFormValues } from '../report-incident-form/report-incident-form';
import { ReportIncidentLocation } from '../report-incident-location/report-incident-location';
import { ReportIncidentMedia } from '../report-incident-media/report-incident-media';
import { IncidentCategory, IncidentCoordinates } from '../../../../shared/models/incident-dto.model';
import { INCIDENT_CATEGORIES } from '../../config/incident-categories';

const GEOHASH_PRECISION = 9;

@Component({
  selector: 'app-report-incident-wizard',
  imports: [ReportIncidentForm, ReportIncidentLocation, ReportIncidentMedia],
  templateUrl: './report-incident-wizard.html',
  styleUrl: './report-incident-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentWizard {
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly reportIncidentApi = inject(ReportIncidentApiService);
  private readonly incidentSuggestionsApi = inject(IncidentSuggestionsApiService);
  private readonly cityContext = inject(CityContextService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  formValues = signal<ReportIncidentFormValues >({title: '', description: '', category: 'OTHER'});
  isFormValid = signal<boolean>(false);

  selectedFiles = signal<File[]>([]);
  uploadedImages = signal<IncidentImageDto[]>([]);

  selectedCoordinates = signal<IncidentCoordinates | null>(null);
  selectedAddressLabel = signal<string | null>(null);
  selectedCitySlug = signal<string | null>(null);
  selectedCity = signal<string | null>(null);

  isSubmitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  isAutocompleteLoading = signal<boolean>(false);
  autocompleteMessage = signal<string | null>(null);
  suggestedFormValues = signal<IncidentSuggestionFormValues | null>(null);

  private readonly validCategories = new Set<IncidentCategory>(INCIDENT_CATEGORIES);

  canSubmit = computed(()=>{
    return  this.isFormValid()    &&
            !this.isSubmitting()  &&
            this.selectedCoordinates() !== null &&
            this.selectedAddressLabel() !== null &&
            this.selectedCitySlug() !== null &&
            this.selectedCity() !== null &&
            this.selectedFiles().length > 0
  });

  updateFormValues(values: ReportIncidentFormValues): void{
    this.formValues.set(values);
  }
  updateFormValidityState(isValid: boolean): void{
    this.isFormValid.set(isValid);
  }

  updateSelectedFiles(files: File[]): void {
    this.selectedFiles.set(files);
  }

  updateCoordinates(coordinates: IncidentCoordinates): void{
    this.selectedCoordinates.set(coordinates);
  }

  updateAddressLabel(addressLabel: string | null): void {
    this.selectedAddressLabel.set(addressLabel);
  }

  updateCitySlug(citySlug: string | null): void {
    this.selectedCitySlug.set(citySlug);
  }

  updateCity(city: string | null): void {
    this.selectedCity.set(city);
  }

  submitReport(): void {
    if (!this.canSubmit()) {
      return;
    }

    const coordinates = this.selectedCoordinates();
    const addressLabel = this.selectedAddressLabel();
    const citySlug = this.selectedCitySlug();
    const city = this.selectedCity();
    const files = this.selectedFiles();

    if (!coordinates) {
      this.submitError.set('Please select an incident location.');
      return;
    }

    if (files.length === 0) {
      this.submitError.set('Please upload at least one image.');
      return;
    }

    if (!addressLabel || !citySlug || !city) {
      this.submitError.set('Please select a valid city for this incident.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.uploadImages(files)
      .pipe(
        tap((uploadedImages) => this.uploadedImages.set(uploadedImages)),
        switchMap((uploadedImages) =>
          this.reportIncidentApi.createIncident(
            this.buildCreateIncidentRequest(coordinates, addressLabel, citySlug, city, uploadedImages)
          )
        ),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          this.cityContext.loadCities();
          this.toastService.showSuccess('Incident reported successfully.');
          void this.router.navigateByUrl('/dashboard');
        },
        error: () => {
          this.submitError.set('Could not submit the incident. Please try again.');
        },
      });
  }

  requestFormAutocomplete(): void {
    const files = this.selectedFiles();

    if (files.length === 0 || this.isAutocompleteLoading()) {
      return;
    }

    const confirmed = window.confirm(
      'This will replace the current title, description, and category with AI suggestions. Continue?'
    );

    if (!confirmed) {
      return;
    }

    this.isAutocompleteLoading.set(true);
    this.autocompleteMessage.set('Generating suggestions from the first image...');

    this.incidentSuggestionsApi
      .getIncidentSuggestions(files[0])
      .pipe(finalize(() => this.isAutocompleteLoading.set(false)))
      .subscribe({
        next: (suggestion) => {
          this.suggestedFormValues.set(this.mapSuggestionToFormValues(suggestion));
          this.autocompleteMessage.set('Suggestions applied to the form.');
          this.toastService.showInfo('Incident form autocompleted from image.');
        },
        error: () => {
          this.autocompleteMessage.set('Could not generate suggestions. Please try again.');
        },
      });
  }

  private uploadImages(files: File[]): Observable<IncidentImageDto[]> {
    if (files.length === 0) {
      return of<IncidentImageDto[]>([]);
    }

    return forkJoin(files.map((file) => this.imageUploadService.uploadImage(file)));
  }

  private buildCreateIncidentRequest(
    coordinates: IncidentCoordinates,
    addressLabel: string,
    citySlug: string,
    city: string,
    images: IncidentImageDto[]
  ): CreateIncidentRequest {
    return {
      ...this.formValues(),
      citySlug,
      location: {
        ...coordinates,
        addressLabel,
        city,
        geohash: encode(coordinates.lat, coordinates.lng, GEOHASH_PRECISION),
      },
      images,
    };
  }

  private mapSuggestionToFormValues(suggestion: IncidentSuggestionResponse): IncidentSuggestionFormValues {
    const category = this.validCategories.has(suggestion.category as IncidentCategory)
      ? (suggestion.category as IncidentCategory)
      : 'OTHER';

    return {
      title: suggestion.title,
      description: suggestion.description,
      category,
    };
  }
}
