import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast-service';

describe('ToastService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds an error toast to the signal', () => {
    const service = TestBed.inject(ToastService);
    service.showError('Something went wrong');

    const toasts = service.toasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ message: 'Something went wrong', type: 'error' });
  });

  it('adds success and info toasts', () => {
    const service = TestBed.inject(ToastService);
    service.showSuccess('Saved');
    service.showInfo('Note');

    const toasts = service.toasts();
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toMatchObject({ message: 'Saved', type: 'success' });
    expect(toasts[1]).toMatchObject({ message: 'Note', type: 'info' });
  });

  it('auto-removes toast after 4 seconds', () => {
    const service = TestBed.inject(ToastService);
    service.showError('Temporary');

    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(4000);

    expect(service.toasts()).toHaveLength(0);
  });

  it('removes toast explicitly', () => {
    const service = TestBed.inject(ToastService);
    service.showError('One');
    service.showError('Two');

    const firstId = service.toasts()[0].id;
    service.removeToast(firstId);

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Two');
  });
});
