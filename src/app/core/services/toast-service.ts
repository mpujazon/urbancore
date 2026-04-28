import { Injectable, signal } from '@angular/core';
import { Toast } from '../../shared/models/ToastInterface';
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  showError(message: string) {
    this.addToast(message, 'error');
  }

  showSuccess(message: string) {
    this.addToast(message, 'success');
  }

  showInfo(message: string) {
    this.addToast(message, 'info');
  }

  private addToast(message: string, type: 'success' | 'error' | 'info') {
    const id = this.nextId++;
    const newToast: Toast = { id, message, type };

    this.toasts.update(currentToasts => [...currentToasts, newToast]);

    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: number) {
    this.toasts.update(currentToasts => currentToasts.filter(t => t.id !== id));
  }
}
