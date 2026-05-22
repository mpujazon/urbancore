import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { encode } from 'ngeohash';
import { finalize, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { CityContextService } from '../../../../core/services/city-context-service';
import { ToastService } from '../../../../core/services/toast-service';
import type { CreateIncidentRequest } from '../../models/incident-report.models';
import type { IncidentImageDto } from '../../models/upload.models';
import { ImageUploadService } from '../../services/image-upload-service';
import { IncidentsApiService } from '../../../../shared/services/incidents-api-service';
import { ReportIncidentForm, ReportIncidentFormValues } from '../report-incident-form/report-incident-form';
import { ReportIncidentLocation } from '../report-incident-location/report-incident-location';
import { ReportIncidentMedia } from '../report-incident-media/report-incident-media';
import { IncidentCoordinates } from '../../../../shared/models/incident-dto.model';

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
  private readonly incidentService = inject(IncidentsApiService);
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
          this.incidentService.createIncident(
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
}
