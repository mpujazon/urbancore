import { ChangeDetectionStrategy, Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
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

  private readonly previewDialog = viewChild<ElementRef<HTMLElement>>('previewDialog');
  private readonly previewCloseButton = viewChild<ElementRef<HTMLButtonElement>>('previewCloseButton');
  private opener: HTMLElement | null = null;

  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(0);

  protected readonly activeImage = computed(() => {
    const idx = this.activeIndex();
    const imgs = this.images();
    return imgs[idx] ?? null;
  });

  protected open(index: number, event?: Event): void {
    this.opener = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.activeIndex.set(index);
    this.isOpen.set(true);

    requestAnimationFrame(() => this.previewCloseButton()?.nativeElement.focus());
  }

  protected close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);

    requestAnimationFrame(() => {
      this.opener?.focus();
      this.opener = null;
    });
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
      case 'Tab':
        this.trapDialogFocus(event);
        break;
    }
  }

  private trapDialogFocus(event: KeyboardEvent): void {
    const focusable = this.getDialogFocusableElements();
    const first = focusable.at(0);
    const last = focusable.at(-1);

    if (!first || !last) {
      event.preventDefault();
      return;
    }

    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getDialogFocusableElements(): HTMLElement[] {
    const dialog = this.previewDialog()?.nativeElement;
    if (!dialog) return [];

    return Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
  }
}
