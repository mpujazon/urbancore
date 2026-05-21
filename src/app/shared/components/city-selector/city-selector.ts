import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CityContextService } from '../../../core/services/city-context-service';
import type { CityDto } from '../../models/city-dto.model';

@Component({
  selector: 'app-city-selector',
  templateUrl: './city-selector.html',
  styleUrl: './city-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'close()',
  },
})
export class CitySelector {
  protected readonly cityContext = inject(CityContextService);
  protected readonly isOpen = signal(false);
  protected readonly query = signal('');
  protected readonly selectedCity = this.cityContext.selectedCity;
  protected readonly filteredCities = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const cities = this.cityContext.availableCities();

    if (!query) {
      return cities;
    }

    return cities.filter((city) => city.name.toLocaleLowerCase().includes(query));
  });

  protected toggle(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected updateQuery(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.query.set(input.value);
  }

  protected selectCity(city: CityDto): void {
    this.cityContext.selectCity(city);
    this.query.set('');
    this.close();
  }
}
