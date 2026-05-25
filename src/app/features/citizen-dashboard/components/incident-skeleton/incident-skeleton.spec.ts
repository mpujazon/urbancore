import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidentSkeleton } from './incident-skeleton';

describe('IncidentSkeleton', () => {
  let fixture: ComponentFixture<IncidentSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentSkeleton);
    fixture.detectChanges();
  });

  it('creates the component and renders skeleton placeholders', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.skeleton-card')).toBeTruthy();
  });
});
