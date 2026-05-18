import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { IncidentDetailImageVm } from '../../../../shared/models/incident-vm.model';

@Component({
  selector: 'app-incident-detail-gallery',
  templateUrl: './incident-detail-gallery.html',
  styleUrl: './incident-detail-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class IncidentDetailGalleryComponent {
  readonly images = input.required<IncidentDetailImageVm[]>();

  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(0);

  protected readonly activeImage = computed(() => {
    const idx = this.activeIndex();
    const imgs = this.images();
    return imgs[idx] ?? null;
  });

  protected open(index: number): void {
    this.activeIndex.set(index);
    this.isOpen.set(true);
  }

  protected close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
  }

  protected next(): void {
    if (!this.isOpen()) return;
    const count = this.images().length;
    if (count === 0) return;
    this.activeIndex.update((i) => (i + 1) % count);
  }

  protected prev(): void {
    if (!this.isOpen()) return;
    const count = this.images().length;
    if (count === 0) return;
    this.activeIndex.update((i) => (i - 1 + count) % count);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.prev();
        break;
    }
  }
}
