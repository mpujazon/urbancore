import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

@Component({
  selector: 'app-pagination',
  imports: [FormsModule],
  templateUrl: './app-pagination.html',
  styleUrl: './app-pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPagination {
  readonly page = input.required<number>();
  readonly size = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalElements = input.required<number>();
  readonly first = input.required<boolean>();
  readonly last = input.required<boolean>();
  readonly loading = input.required<boolean>();

  readonly pageChange = output<number>();
  readonly sizeChange = output<number>();

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  protected onPrevious(): void {
    if (!this.first() && !this.loading()) {
      this.pageChange.emit(this.page() - 1);
    }
  }

  protected onNext(): void {
    if (!this.last() && !this.loading()) {
      this.pageChange.emit(this.page() + 1);
    }
  }

  protected onSizeChange(value: number): void {
    if (value !== this.size()) {
      this.sizeChange.emit(value);
    }
  }
}
