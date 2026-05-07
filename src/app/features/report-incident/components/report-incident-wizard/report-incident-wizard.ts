import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { encode } from 'ngeohash';
import { finalize, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { ToastService } from '../../../../core/services/toast-service';
import type { CreateIncidentRequest } from '../../models/incident-report.models';
import type { IncidentImageDto } from '../../models/upload.models';
import { ImageUploadService } from '../../services/image-upload-service';
import { IncidentsApiService } from '../../../../shared/services/incidents-api-service';
import { ReportIncidentForm, ReportIncidentFormValues } from '../report-incident-form/report-incident-form';
import { ReportIncidentLocation } from '../report-incident-location/report-incident-location';
import { ReportIncidentMedia } from '../report-incident-media/report-incident-media';
import { IncidentCoordinates } from '../../../../shared/models/IncidentInterface';

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
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  formValues = signal<ReportIncidentFormValues >({title: '', description: '', category: 'OTHER'});
  isFormValid = signal<boolean>(false);

  selectedFiles = signal<File[]>([]);
  uploadedImages = signal<IncidentImageDto[]>([]);

  selectedCoordinates = signal<IncidentCoordinates | null>(null);

  isSubmitting = signal<boolean>(false);
  submitError = signal<string | null>(null);

  canSubmit = computed(()=>{
    return  this.isFormValid()    &&
            !this.isSubmitting()  &&
            this.selectedCoordinates() !== null &&
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

  submitReport(): void {
    if (!this.canSubmit()) {
      return;
    }

    const coordinates = this.selectedCoordinates();
    const files = this.selectedFiles();

    if (!coordinates) {
      this.submitError.set('Please select an incident location.');
      return;
    }

    if (files.length === 0) {
      this.submitError.set('Please upload at least one image.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.uploadImages(files)
      .pipe(
        tap((uploadedImages) => this.uploadedImages.set(uploadedImages)),
        switchMap((uploadedImages) =>
          this.incidentService.createIncident(
            this.buildCreateIncidentRequest(coordinates, uploadedImages)
          )
        ),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
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
    images: IncidentImageDto[]
  ): CreateIncidentRequest {
    return {
      ...this.formValues(),
      location: {
        ...coordinates,
        geohash: encode(coordinates.lat, coordinates.lng, GEOHASH_PRECISION),
      },
      images,
    };
  }
}
