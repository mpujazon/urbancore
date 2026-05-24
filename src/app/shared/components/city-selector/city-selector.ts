import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CityContextService } from '../../../core/services/city-context-service';
import type { CityDto } from '../../models/city-dto.model';

@Component({
  selector: 'app-city-selector',
  templateUrl: './city-selector.html',
  styleUrl: './city-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'close(true)',
  },
})
export class CitySelector {
  private readonly globalCityLabel = 'Worldwide';
  protected readonly cityContext = inject(CityContextService);
  protected readonly isOpen = signal(false);
  protected readonly query = signal('');
  protected readonly selectedCity = this.cityContext.selectedCity;
  private readonly citySearch = viewChild<ElementRef<HTMLInputElement>>('citySearch');
  private readonly citySelectorTrigger = viewChild<ElementRef<HTMLButtonElement>>('citySelectorTrigger');
  protected readonly showGlobalOption = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();

    return !query || this.globalCityLabel.toLocaleLowerCase().includes(query);
  });
  protected readonly filteredCities = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const cities = this.cityContext.availableCities();

    if (!query) {
      return cities;
    }

    return cities.filter((city) => city.name.toLocaleLowerCase().includes(query));
  });
  protected readonly hasNoResults = computed(() => !this.showGlobalOption() && this.filteredCities().length === 0);

  protected toggle(): void {
    const nextOpen = !this.isOpen();
    this.isOpen.set(nextOpen);

    if (nextOpen) {
      requestAnimationFrame(() => this.citySearch()?.nativeElement.focus());
    }
  }

  protected close(restoreFocus = false): void {
    this.isOpen.set(false);

    if (restoreFocus) {
      requestAnimationFrame(() => this.citySelectorTrigger()?.nativeElement.focus());
    }
  }

  protected updateQuery(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.query.set(input.value);
  }

  protected selectCity(city: CityDto): void {
    this.cityContext.selectCity(city);
    this.query.set('');
    this.close(true);
  }

  protected selectGlobalCity(): void {
    this.cityContext.clearSelectedCity();
    this.query.set('');
    this.close(true);
  }
}
