import type { IncidentDto } from '../../../shared/models/IncidentInterface';
import type { IncidentImageDto } from './upload.models';

export interface CreateIncidentRequest {
  title: string;
  description: string;
  category: IncidentDto['category'];
  location: {
    lat: number;
    lng: number;
    geohash: string;
  };
  images: IncidentImageDto[];
}
