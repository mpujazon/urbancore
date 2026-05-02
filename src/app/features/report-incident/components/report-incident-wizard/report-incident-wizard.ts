import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { IncidentImageDto } from '../../models/upload.models';
import { ImageUploadService } from '../../services/image-upload-service';
import { ReportIncidentForm, ReportIncidentFormValues } from '../report-incident-form/report-incident-form';
import { ReportIncidentLocation } from '../report-incident-location/report-incident-location';
import { ReportIncidentMedia } from '../report-incident-media/report-incident-media';

@Component({
  selector: 'app-report-incident-wizard',
  imports: [ReportIncidentForm, ReportIncidentLocation, ReportIncidentMedia],
  templateUrl: './report-incident-wizard.html',
  styleUrl: './report-incident-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentWizard {
  // Services
  private readonly imageUploadService = inject(ImageUploadService);

  // Values
  formValues = signal<ReportIncidentFormValues >({title: '', description: '', category: 'OTHER'});
  selectedFiles = signal<File[]>([]);
  uploadedImages = signal<IncidentImageDto[]>([]);

  // Validations
  isFormValid = signal<boolean>(false);

  isSubmitting = signal<boolean>(false);


  submitError = signal<string | null>(null);
  submitSuccess = signal<string | null>(null);

  canSubmit = computed(()=>{
    return this.isFormValid() && !this.isSubmitting();
  });

// Functions
  updateFormValues(values: ReportIncidentFormValues): void{
    this.formValues.set(values);
  }
  updateFormValidityState(isValid: boolean): void{
    this.isFormValid.set(isValid);
  }

  updateSelectedFiles(files: File[]): void {
    this.selectedFiles.set(files);
  }

  submitReport(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(null);

    const files = this.selectedFiles();

    if (files.length === 0) {
      this.uploadedImages.set([]);
      this.submitSuccess.set('Report is valid. Ready to connect with backend submit.');
      this.isSubmitting.set(false);
      return;
    }

    const uploads = files.map((file) => this.imageUploadService.uploadImage(file));

    forkJoin(uploads).subscribe({
      next: (uploadedImages) => {
        this.uploadedImages.set(uploadedImages);
        this.submitSuccess.set(
          `Report is valid and ${uploadedImages.length} image(s) uploaded. Ready to send final payload.`
        );
        this.isSubmitting.set(false);
      },
      error: () => {
        this.submitError.set('Could not upload one or more images. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }
}
