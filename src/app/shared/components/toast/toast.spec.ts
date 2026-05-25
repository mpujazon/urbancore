import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast';
import { ToastService } from '../../../core/services/toast-service';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('renders toasts from the service', () => {
    toastService.showSuccess('Operation completed');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Operation completed');
  });

  it('removes toast on close button click', () => {
    toastService.showError('Something failed');
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('button');
    closeButton?.click();
    fixture.detectChanges();

    expect(toastService.toasts()).toHaveLength(0);
  });
});
