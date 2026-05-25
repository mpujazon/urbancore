import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IncidentCard } from './incident-card';

describe('IncidentCard', () => {
  let fixture: ComponentFixture<IncidentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentCard);
  });

  it('renders incident title and category with detailed variant', () => {
    fixture.componentRef.setInput('incident', {
      id: 'inc-1',
      title: 'Broken light',
      category: 'Lighting',
      categoryIconClass: 'fa-lightbulb',
      date: 'Jan 01, 2026',
      imageUrl: 'https://example.com/img.webp',
      addressLabel: 'Main St',
      city: 'Barcelona',
      status: 'Under Review',
      statusStyleClass: 'is-review',
    });
    fixture.componentRef.setInput('variant', 'DETAILED');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Broken light');
    expect(fixture.nativeElement.textContent).toContain('Lighting');
    expect((fixture.nativeElement as HTMLElement).classList.contains('incident-card--detailed')).toBe(true);
  });

  it('applies compact class for compact variant', () => {
    fixture.componentRef.setInput('incident', {
      id: 'inc-2',
      title: 'Pothole',
      category: 'Pothole',
      categoryIconClass: 'fa-road',
      date: 'Jan 02, 2026',
      imageUrl: 'https://example.com/img.webp',
      addressLabel: 'Second St',
      city: 'Barcelona',
      status: 'New',
      statusStyleClass: 'is-new',
    });
    fixture.componentRef.setInput('variant', 'COMPACT');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('incident-card--compact')).toBe(true);
  });
});
