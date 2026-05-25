import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ImageUploadService } from './image-upload-service';

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ImageUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests upload signature, uploads to Cloudinary, and maps response', () => {
    const file = new File(['content'], 'incident.jpg', { type: 'image/jpeg' });
    let result: unknown;

    service.uploadImage(file).subscribe((value) => {
      result = value;
    });

    const signatureRequest = httpMock.expectOne(`${environment.API_BASE_URL}/uploads/signature`);
    expect(signatureRequest.request.method).toBe('POST');
    signatureRequest.flush({
      signature: 'abc',
      timestamp: 1710000000,
      folder: 'urbancore/incidents',
      apiKey: 'key123',
      cloudName: 'demo-cloud',
    });

    const uploadRequest = httpMock.expectOne('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
    expect(uploadRequest.request.method).toBe('POST');

    const formData = uploadRequest.request.body as FormData;
    expect(formData.get('file')).toBe(file);
    expect(formData.get('api_key')).toBe('key123');
    expect(formData.get('timestamp')).toBe('1710000000');
    expect(formData.get('folder')).toBe('urbancore/incidents');
    expect(formData.get('format')).toBe('webp');
    expect(formData.get('signature')).toBe('abc');

    uploadRequest.flush({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/incident.webp',
      public_id: 'urbancore/incidents/incident',
      format: 'webp',
      bytes: 4096,
      width: 1200,
      height: 900,
    });

    expect(result).toEqual({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/incident.webp',
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/w_640,h_480,c_fill,q_auto,f_auto/v1/incident.webp',
      publicId: 'urbancore/incidents/incident',
      mimeType: 'image/webp',
      sizeKb: 4,
    });
  });
});
