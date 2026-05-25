import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppPagination } from './app-pagination';

describe('AppPagination', () => {
  let fixture: ComponentFixture<AppPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPagination, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppPagination);
  });

  function setInputs(overrides: Partial<{
    page: number; size: number; totalPages: number; totalElements: number; first: boolean; last: boolean; loading: boolean;
  }> = {}): void {
    fixture.componentRef.setInput('page', overrides.page ?? 0);
    fixture.componentRef.setInput('size', overrides.size ?? 10);
    fixture.componentRef.setInput('totalPages', overrides.totalPages ?? 5);
    fixture.componentRef.setInput('totalElements', overrides.totalElements ?? 50);
    fixture.componentRef.setInput('first', overrides.first ?? false);
    fixture.componentRef.setInput('last', overrides.last ?? false);
    fixture.componentRef.setInput('loading', overrides.loading ?? false);
    fixture.detectChanges();
  }

  it('emits previous page when not first and not loading', () => {
    const emitSpy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');
    setInputs({ page: 2 });

    const prevBtn = fixture.nativeElement.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    prevBtn?.click();

    expect(emitSpy).toHaveBeenCalledWith(1);
  });

  it('emits next page when not last and not loading', () => {
    const emitSpy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');
    setInputs({ page: 1, last: false });

    const nextBtn = fixture.nativeElement.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    nextBtn?.click();

    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('does not emit when loading is true', () => {
    const emitSpy = vi.spyOn(fixture.componentInstance.pageChange, 'emit');
    setInputs({ loading: true, first: false });

    const prevBtn = fixture.nativeElement.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    prevBtn?.click();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
