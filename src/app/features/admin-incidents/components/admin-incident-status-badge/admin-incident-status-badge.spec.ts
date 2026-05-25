import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminIncidentStatusBadge } from './admin-incident-status-badge';

describe('AdminIncidentStatusBadge', () => {
  let fixture: ComponentFixture<AdminIncidentStatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIncidentStatusBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIncidentStatusBadge);
  });

  it('renders label and applies tone class', () => {
    fixture.componentRef.setInput('label', 'Under Review');
    fixture.componentRef.setInput('tone', 'warning');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Under Review');
    expect(fixture.nativeElement.querySelector('.status-badge--warning')).toBeTruthy();
  });
});
