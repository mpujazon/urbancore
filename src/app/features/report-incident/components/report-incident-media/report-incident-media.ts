import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { validateImageFile } from '../../utils/image-upload.validators';

type MediaPreview = {
  id: number;
  file: File;
  url: string;
};

const MAX_FILES = 5;

@Component({
  selector: 'app-report-incident-media',
  templateUrl: './report-incident-media.html',
  styleUrl: './report-incident-media.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ReportIncidentMedia {
  protected readonly previews = signal<MediaPreview[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canUploadMore = computed(
    () => this.previews().length < MAX_FILES
  );

  private nextPreviewId = 1;

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const currentCount = this.previews().length;
    const availableSlots = Math.max(0, MAX_FILES - currentCount);

    if (availableSlots === 0) {
      this.errorMessage.set(`You can upload up to ${MAX_FILES} files.`);
      input.value = '';
      return;
    }

    const selectedFiles = Array.from(files);
    const filesToProcess = selectedFiles.slice(0, availableSlots);
    const overflowCount = selectedFiles.length - filesToProcess.length;

    if (overflowCount > 0) {
      this.errorMessage.set(`Only ${MAX_FILES} files are allowed.`);
    } else {
      this.errorMessage.set(null);
    }

    const newPreviews: MediaPreview[] = [];

    for (const file of filesToProcess) {
      const validationError = validateImageFile(file);

      if (validationError) {
        this.errorMessage.set(validationError);
        continue;
      }

      newPreviews.push({
        id: this.nextPreviewId++,
        file,
        url: URL.createObjectURL(file),
      });
    }

    if (newPreviews.length > 0) {
      this.previews.update((current) => [...current, ...newPreviews]);
    }

    input.value = '';
  }

  protected removePreview(previewId: number): void {
    this.previews.update((current) => {
      const preview = current.find((item) => item.id === previewId);

      if (preview) {
        URL.revokeObjectURL(preview.url);
      }

      return current.filter((item) => item.id !== previewId);
    });

    if (this.previews().length < MAX_FILES) {
      this.errorMessage.set(null);
    }
  }

  ngOnDestroy(): void {
    for (const preview of this.previews()) {
      URL.revokeObjectURL(preview.url);
    }
  }
}
