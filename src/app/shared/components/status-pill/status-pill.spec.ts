import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusPill } from './status-pill';

describe('StatusPill', () => {
  let fixture: ComponentFixture<StatusPill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPill],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPill);
  });

  it('renders status name and class style', () => {
    fixture.componentRef.setInput('statusName', 'Under Review');
    fixture.componentRef.setInput('classStyle', 'is-review');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Under Review');
  });
});
