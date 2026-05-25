import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CityContextService } from '../../../core/services/city-context-service';
import { CitySelector } from './city-selector';

describe('CitySelector', () => {
  let fixture: ComponentFixture<CitySelector>;

  const cityContextMock = {
    selectedCity: vi.fn(() => null),
    availableCities: vi.fn(() => [
      { id: 'city-1', name: 'Barcelona', slug: 'es-barcelona' },
      { id: 'city-2', name: 'Santa Coloma', slug: 'es-santa-coloma' },
    ]),
    selectCity: vi.fn(),
    clearSelectedCity: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CitySelector],
      providers: [{ provide: CityContextService, useValue: cityContextMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CitySelector);
    fixture.detectChanges();
  });

  it('shows available cities when dropdown is open', () => {
    (fixture.componentInstance as unknown as { toggle: () => void }).toggle();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Barcelona');
    expect(fixture.nativeElement.textContent).toContain('Santa Coloma');
  });

  it('selects a city and closes dropdown', () => {
    (fixture.componentInstance as unknown as { toggle: () => void }).toggle();
    fixture.detectChanges();

    const cityButton = fixture.nativeElement.querySelector('.city-selector-option:not(.city-selector-option-global)') as HTMLButtonElement;
    cityButton?.click();

    expect(cityContextMock.selectCity).toHaveBeenCalledWith({
      id: 'city-1',
      name: 'Barcelona',
      slug: 'es-barcelona',
    });
  });

  it('selects global city option', () => {
    (fixture.componentInstance as unknown as { toggle: () => void }).toggle();
    fixture.detectChanges();

    const globalButton = fixture.nativeElement.querySelector('.city-selector-option-global') as HTMLButtonElement;
    globalButton?.click();

    expect(cityContextMock.clearSelectedCity).toHaveBeenCalled();
  });
});
