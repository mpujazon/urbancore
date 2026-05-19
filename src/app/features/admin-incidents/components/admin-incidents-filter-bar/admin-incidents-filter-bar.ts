import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import type { IncidentCategory, IncidentPriority, IncidentStatus } from '../../../../shared/models/incident-dto.model';
import { categoryOptions, priorityOptions, statusOptions } from '../../../incidents-explorer/config/explorer-filter-options';
import type { AdminIncidentFilters } from '../../models/admin-incident-query.model';

@Component({
  selector: 'app-admin-incidents-filter-bar',
  imports: [FormsModule],
  templateUrl: './admin-incidents-filter-bar.html',
  styleUrl: './admin-incidents-filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIncidentsFilterBar {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  readonly filters = input.required<AdminIncidentFilters>();
  readonly activeFilterCount = input.required<number>();
  readonly refreshing = input.required<boolean>();

  readonly searchChange = output<string>();
  readonly statusChange = output<IncidentStatus | null>();
  readonly categoryChange = output<IncidentCategory | null>();
  readonly priorityChange = output<IncidentPriority | null>();
  readonly dateFromChange = output<string | null>();
  readonly dateToChange = output<string | null>();
  readonly clearFilters = output<void>();

  protected searchText = '';
  protected selectedStatus: IncidentStatus | '' = '';
  protected selectedCategory: IncidentCategory | '' = '';
  protected selectedPriority: IncidentPriority | '' = '';
  protected dateFrom = '';
  protected dateTo = '';
  protected readonly statusOptions = statusOptions;
  protected readonly categoryOptions = categoryOptions;
  protected readonly priorityOptions = priorityOptions;

  constructor() {
    this.searchChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.searchChange.emit(value));

    effect(() => {
      const filters = this.filters();
      untracked(() => {
        this.searchText = filters.search ?? '';
        this.selectedStatus = filters.status ?? '';
        this.selectedCategory = filters.category ?? '';
        this.selectedPriority = filters.priority ?? '';
        this.dateFrom = filters.dateFrom ?? '';
        this.dateTo = filters.dateTo ?? '';
      });
    });
  }

  protected onSearchChange(value: string): void {
    this.searchText = value;
    this.searchChanges.next(value);
  }

  protected onStatusChange(value: IncidentStatus | ''): void {
    this.selectedStatus = value;
    this.statusChange.emit(value || null);
  }

  protected onCategoryChange(value: IncidentCategory | ''): void {
    this.selectedCategory = value;
    this.categoryChange.emit(value || null);
  }

  protected onPriorityChange(value: IncidentPriority | ''): void {
    this.selectedPriority = value;
    this.priorityChange.emit(value || null);
  }

  protected onDateFromChange(value: string): void {
    this.dateFrom = value;
    this.dateFromChange.emit(value || null);
  }

  protected onDateToChange(value: string): void {
    this.dateTo = value;
    this.dateToChange.emit(value || null);
  }

  protected onClearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.selectedPriority = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.clearFilters.emit();
  }
}
