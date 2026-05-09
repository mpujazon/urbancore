import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IncidentExplorerFilters,
} from '../../../../shared/models/incident-vm.model';
import { IncidentCategory, IncidentPriority, IncidentStatus } from '../../../../shared/models/incident-dto.model';
import {categoryOptions, priorityOptions, statusOptions} from '../../config/explorer-filter-options';

function isoToDate(iso?: string): string {
  return iso ? iso.substring(0, 10) : '';
}

@Component({
  selector: 'app-explorer-filter-bar',
  imports: [FormsModule],
  templateUrl: './explorer-filter-bar.html',
  styleUrl: './explorer-filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerFilterBar {
  readonly filters = input.required<IncidentExplorerFilters>();
  readonly loading = input.required<boolean>();
  readonly activeFilterCount = input.required<number>();

  readonly filtersChange = output<Partial<IncidentExplorerFilters>>();
  readonly clear = output<void>();

  protected searchText = '';


  protected selectedStatus: IncidentStatus | '' = '';
  protected selectedCategory: IncidentCategory | '' = '';
  protected selectedPriority: IncidentPriority | '' = '';
  protected fromDate = '';
  protected toDate = '';

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const f = this.filters();
      untracked(() => {
        this.searchText = f.q ?? '';
        this.selectedStatus = f.status ?? '';
        this.selectedCategory = f.category ?? '';
        this.selectedPriority = f.priority ?? '';
        this.fromDate = isoToDate(f.from);
        this.toDate = isoToDate(f.to);
      });
    });
  }

  protected onSearchChange(value: string): void {
    this.searchText = value;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.filtersChange.emit({ q: value.trim() || undefined });
    }, 300);
  }

  protected onStatusChange(value: IncidentStatus | ''): void {
    this.selectedStatus = value;
    this.filtersChange.emit({ status: (value || undefined) as IncidentStatus | undefined });
  }

  protected onCategoryChange(value: IncidentCategory | ''): void {
    this.selectedCategory = value;
    this.filtersChange.emit({ category: (value || undefined) as IncidentCategory | undefined });
  }

  protected onPriorityChange(value: IncidentPriority | ''): void {
    this.selectedPriority = value;
    this.filtersChange.emit({ priority: (value || undefined) as IncidentPriority | undefined });
  }

  protected onFromDateChange(value: string): void {
    this.fromDate = value;
    const iso = value ? new Date(value).toISOString() : undefined;
    this.filtersChange.emit({ from: iso });
  }

  protected onToDateChange(value: string): void {
    this.toDate = value;
    const iso = value ? new Date(value).toISOString() : undefined;
    this.filtersChange.emit({ to: iso });
  }

  protected onClear(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.selectedPriority = '';
    this.fromDate = '';
    this.toDate = '';
    this.clear.emit();
  }

  protected readonly statusOptions = statusOptions;
  protected readonly categoryOptions = categoryOptions;
  protected readonly priorityOptions = priorityOptions;
}
