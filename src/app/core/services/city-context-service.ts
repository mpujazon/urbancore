import { HttpClient } from '@angular/common/http';
import { DestroyRef, computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CityDto } from '../../shared/models/city-dto.model';
import {ToastService} from './toast-service';

const STORAGE_KEY = 'urbancore:selected-city';

@Injectable({
  providedIn: 'root',
})
export class CityContextService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly availableCitiesState = signal<readonly CityDto[]>([]);
  private readonly selectedCityState = signal<CityDto | undefined>(undefined);

  readonly availableCities = this.availableCitiesState.asReadonly();
  readonly selectedCity = this.selectedCityState.asReadonly();
  readonly selectedCityId = computed(() => this.selectedCity()?.id);

  constructor() {
    this.loadCities();
  }

  loadCities(): void {
    this.http
      .get<CityDto[]>(`${environment.API_BASE_URL}/cities`)
      .pipe(
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cities) => {
        console.log(cities);
        this.availableCitiesState.set(cities);
        this.restoreOrValidateSelectedCity(cities);
      });
  }

  selectCity(city: CityDto): void {
    this.selectedCityState.set(city);
    this.persistCityId(city.id);
  }

  selectCityById(cityId: string | undefined): void {
    if (!cityId) {
      this.clearSelectedCity();
      return;
    }

    const city = this.availableCities().find((availableCity) => availableCity.id === cityId);

    if (city) {
      this.selectCity(city);
    }
  }

  clearSelectedCity(): void {
    this.selectedCityState.set(undefined);
    this.clearPersistedCity();
  }

  private restoreOrValidateSelectedCity(cities: readonly CityDto[]): void {
    const selectedCity = this.selectedCity();

    if (selectedCity) {
      if (!cities.some((city) => city.id === selectedCity.id)) {
        this.clearSelectedCity();
      }
      return;
    }

    const persistedCityId = this.readPersistedCityId();

    if (!persistedCityId) {
      return;
    }

    const persistedCity = cities.find((city) => city.id === persistedCityId);

    if (persistedCity) {
      this.selectedCityState.set(persistedCity);
      return;
    }

    this.clearPersistedCity();
  }

  private readPersistedCityId(): string | undefined {
    try {
      return globalThis.localStorage?.getItem(STORAGE_KEY) ?? undefined;
    } catch (error: unknown){
      const message = error instanceof Error
        ? error.message
        : 'Error reading the persisted city in the local storage.'

      this.toastService.showError(message);
      return undefined;
    }
  }

  private persistCityId(cityId: string): void {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, cityId);
    } catch(error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Error persisting the city in the local storage.'

      this.toastService.showError(message);
    }
  }

  private clearPersistedCity(): void {
    try {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
    } catch(error: unknown){
      const message = error instanceof Error
        ? error.message
        : 'Error clearing the persisted city in the local storage.'

      this.toastService.showError(message);
    }
  }
}
