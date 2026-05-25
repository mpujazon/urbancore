import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminIncidentsEmptyState } from './admin-incidents-empty-state';

describe('AdminIncidentsEmptyState', () => {
  let fixture: ComponentFixture<AdminIncidentsEmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIncidentsEmptyState],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIncidentsEmptyState);
  });

  it('emits clearFilters when clear button is clicked', () => {
    const emitSpy = vi.spyOn(fixture.componentInstance.clearFilters, 'emit');
    fixture.componentRef.setInput('activeFilterCount', 2);
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('button');
    clearButton?.click();

    expect(emitSpy).toHaveBeenCalled();
  });
});
