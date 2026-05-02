import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, map, Observable, switchMap } from 'rxjs';
import {
  CloudinaryUploadResponse,
  IncidentImageDto,
  UploadSignatureResponse,
} from '../models/upload.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private readonly http = inject(HttpClient);

  uploadImage(file: File): Observable<IncidentImageDto> {
    return this.getUploadSignature().pipe(
      switchMap((signature) => this.uploadToCloudinary(file, signature)),
      map((response) => this.mapToIncidentImage(response, file))
    );
  }

  private getUploadSignature(): Observable<UploadSignatureResponse> {
    return this.http.post<UploadSignatureResponse>(`${environment.API_BASE_URL}/uploads/signature`, {});
  }

  private uploadToCloudinary(
    file: File,
    signature: UploadSignatureResponse
  ): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('folder', signature.folder);
    formData.append('signature', signature.signature);

    return this.http.post<CloudinaryUploadResponse>(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      formData
    );
  }

  private mapToIncidentImage(
    response: CloudinaryUploadResponse,
    file: File
  ): IncidentImageDto {
    return {
      url: response.secure_url,
      thumbnailUrl: this.buildThumbnailUrl(response.secure_url),
      publicId: response.public_id,
      mimeType: file.type,
      sizeKb: Math.round(response.bytes / 1024),
    };
  }

  private buildThumbnailUrl(url: string): string {
    return url.replace(
      '/upload/',
      '/upload/w_320,h_240,c_fill,q_auto,f_auto/'
    );
  }
}
