import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminIncidentPriorityBadge } from './admin-incident-priority-badge';

describe('AdminIncidentPriorityBadge', () => {
  let fixture: ComponentFixture<AdminIncidentPriorityBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIncidentPriorityBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIncidentPriorityBadge);
  });

  it('renders label and applies tone class', () => {
    fixture.componentRef.setInput('label', 'High');
    fixture.componentRef.setInput('tone', 'high');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('High');
    expect(fixture.nativeElement.querySelector('.priority-badge--high')).toBeTruthy();
  });
});
