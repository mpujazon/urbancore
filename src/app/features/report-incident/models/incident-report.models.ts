import type { IncidentDto } from '../../../shared/models/incident-dto.model';
import type { IncidentImageDto } from './upload.models';

export interface CreateIncidentRequest {
  title: string;
  description: string;
  category: IncidentDto['category'];
  citySlug: string;
  location: {
    lat: number;
    lng: number;
    addressLabel: string;
    city: string;
    geohash: string;
  };
  images: IncidentImageDto[];
}
