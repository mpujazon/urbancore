import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { validateImageFile } from '../../utils/image-upload.validators';

type MediaPreview = {
  id: number;
  file: File;
  url: string;
};

const MAX_FILES = 5;
const FALLBACK_IMAGE_URL = 'https://placehold.co/400x400?text=Unavailable preview';

@Component({
  selector: 'app-report-incident-media',
  templateUrl: './report-incident-media.html',
  styleUrl: './report-incident-media.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ReportIncidentMedia {
  selectedFilesChanged = output<File[]>();
  autocompleteRequested = output<void>();
  readonly isAutocompleteLoading = input(false);
  protected readonly previews = signal<MediaPreview[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly uploadStatusMessage = signal('No evidence files selected.');
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
      this.setUploadError(`You can upload up to ${MAX_FILES} files.`);
      input.value = '';
      return;
    }

    const selectedFiles = Array.from(files);
    const filesToProcess = selectedFiles.slice(0, availableSlots);
    const overflowCount = selectedFiles.length - filesToProcess.length;

    if (overflowCount > 0) {
      this.setUploadError(`Only ${MAX_FILES} files are allowed.`);
    } else {
      this.errorMessage.set(null);
    }

    const newPreviews: MediaPreview[] = [];

    for (const file of filesToProcess) {
      const validationError = validateImageFile(file);

      if (validationError) {
        this.setUploadError(`${file.name} was not uploaded. ${validationError}`);
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
      this.emitSelectedFiles();
      this.uploadStatusMessage.set(this.buildUploadStatus(newPreviews.length));
    } else if (!this.errorMessage()) {
      this.uploadStatusMessage.set('No valid evidence files were selected.');
    }

    input.value = '';
  }

  protected removePreview(previewId: number): void {
    let removedFileName: string | null = null;

    this.previews.update((current) => {
      const preview = current.find((item) => item.id === previewId);

      if (preview) {
        removedFileName = preview.file.name;
        URL.revokeObjectURL(preview.url);
      }

      return current.filter((item) => item.id !== previewId);
    });

    if (this.previews().length < MAX_FILES) {
      this.errorMessage.set(null);
    }

    this.emitSelectedFiles();
    this.uploadStatusMessage.set(
      removedFileName
        ? `${removedFileName} removed. ${this.previews().length} evidence file${this.previews().length === 1 ? '' : 's'} selected.`
        : `${this.previews().length} evidence file${this.previews().length === 1 ? '' : 's'} selected.`
    );
  }

  protected onPreviewImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    const fallbackUrl = FALLBACK_IMAGE_URL;

    if (!image || image.src === fallbackUrl) {
      return;
    }

    image.src = fallbackUrl;
  }

  protected requestAutocomplete(): void {
    this.uploadStatusMessage.set('Generating incident details from the first uploaded image.');
    this.autocompleteRequested.emit();
  }

  protected previewAltText(preview: MediaPreview): string {
    return `Uploaded evidence image: ${preview.file.name}`;
  }

  private emitSelectedFiles(): void {
    this.selectedFilesChanged.emit(this.previews().map((preview) => preview.file));
  }

  private setUploadError(message: string): void {
    this.errorMessage.set(message);
    this.uploadStatusMessage.set(message);
  }

  private buildUploadStatus(addedCount: number): string {
    const total = this.previews().length;
    return `${addedCount} evidence file${addedCount === 1 ? '' : 's'} added. ${total} of ${MAX_FILES} selected.`;
  }

  ngOnDestroy(): void {
    for (const preview of this.previews()) {
      URL.revokeObjectURL(preview.url);
    }
  }
}
