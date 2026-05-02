export interface UploadSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  resource_type: string;
  original_filename: string;
}

export interface IncidentImageDto {
  url: string;
  thumbnailUrl: string;
  publicId: string;
  mimeType: string;
  sizeKb: number;
}
