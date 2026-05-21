import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment.development';
import {ReverseGeocodingDto} from '../models/reverse-geocoding-dto.models';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ReverseGeocodingService {
  private http = inject(HttpClient);

  getAddressInfo (lat: number, lng: number): Observable<ReverseGeocodingDto>{
    return this.http.get<ReverseGeocodingDto>(`${environment.API_BASE_URL}/geocoding/reverse?lat=${lat}&lng=${lng}`);
  }
}
