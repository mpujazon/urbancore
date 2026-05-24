import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast-service';
import type { Toast } from '../../models/toast.model';

@Component({
  selector: 'app-toast',
  templateUrl:'./toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  protected toastRole(toast: Toast): 'alert' | 'status' {
    return toast.type === 'error' ? 'alert' : 'status';
  }

  protected closeLabel(toast: Toast): string {
    return `Close ${toast.type} message: ${toast.message}`;
  }
}
