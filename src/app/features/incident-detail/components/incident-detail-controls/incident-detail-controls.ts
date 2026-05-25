import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import type { IncidentPriority, IncidentStatus } from '../../../../shared/models/incident-dto.model';
import type { PlannedActionCreatePayload } from '../../models/planned-action-create-payload.model';

type SelectOption<TValue extends string> = { value: TValue; label: string };

type IncidentStatusFormGroup = FormGroup<{
  status: FormControl<IncidentStatus>;
}>;

type IncidentPriorityFormGroup = FormGroup<{
  priority: FormControl<IncidentPriority>;
}>;

type PlannedActionFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  scheduledStart: FormControl<string>;
  scheduledEnd: FormControl<string>;
}>;

const INITIAL_STATUS: IncidentStatus = 'UNDER_REVIEW';
const INITIAL_PRIORITY: IncidentPriority = 'MEDIUM';

const STATUS_OPTIONS: SelectOption<IncidentStatus>[] = [
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: SelectOption<IncidentPriority>[] = [
  { value: 'UNDEFINED', label: 'Undefined' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const EMPTY_PLANNED_ACTION_FORM_VALUE = {
  title: '',
  description: '',
  scheduledStart: '',
  scheduledEnd: '',
} as const;

@Component({
  selector: 'app-incident-detail-controls',
  imports: [ReactiveFormsModule],
  templateUrl: './incident-detail-controls.html',
  styleUrl: './incident-detail-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailControlsComponent {
  readonly canManage = input(false);
  readonly canDelete = input(false);
  protected readonly minScheduledStart = getCurrentLocalDateTime();

  readonly incidentDelete = output<void>();
  readonly statusUpdate = output<IncidentStatus>();
  readonly priorityUpdate = output<IncidentPriority>();
  readonly plannedActionCreate = output<PlannedActionCreatePayload>();

  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly priorityOptions = PRIORITY_OPTIONS;

  protected readonly statusForm: IncidentStatusFormGroup = new FormGroup({
    status: new FormControl<IncidentStatus>(INITIAL_STATUS, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly priorityForm: IncidentPriorityFormGroup = new FormGroup({
    priority: new FormControl<IncidentPriority>(INITIAL_PRIORITY, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly plannedActionForm: PlannedActionFormGroup = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    description: new FormControl('', { nonNullable: true }),
    scheduledStart: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    scheduledEnd: new FormControl('', { nonNullable: true }),
  }, { validators: [validatePlannedActionDateRange, validatePlannedActionStartNotPast] });

  protected onDeleteIncident(): void {
    this.incidentDelete.emit();
  }

  protected onUpdateStatus(): void {
    if (!markFormAsTouchedIfInvalid(this.statusForm)) {
      return;
    }

    this.statusUpdate.emit(this.statusForm.controls.status.getRawValue());
  }

  protected onUpdatePriority(): void {
    if (!markFormAsTouchedIfInvalid(this.priorityForm)) {
      return;
    }

    this.priorityUpdate.emit(this.priorityForm.controls.priority.getRawValue());
  }

  protected onCreatePlannedAction(): void {
    if (!markFormAsTouchedIfInvalid(this.plannedActionForm)) {
      return;
    }

    const values = this.plannedActionForm.getRawValue();
    const trimmedTitle = values.title.trim();
    if (!trimmedTitle) {
      this.plannedActionForm.controls.title.setErrors({ required: true });
      this.plannedActionForm.controls.title.markAsTouched();
      return;
    }

    this.plannedActionCreate.emit({
      title: trimmedTitle,
      description: values.description.trim() || undefined,
      scheduledStart: values.scheduledStart,
      scheduledEnd: values.scheduledEnd || undefined,
    });
    this.plannedActionForm.reset(EMPTY_PLANNED_ACTION_FORM_VALUE);
  }

  protected hasPlannedActionDateError(): boolean {
    const dateRangeError = this.plannedActionForm.hasError('invalidDateRange');
    const startTouched = this.plannedActionForm.controls.scheduledStart.touched;
    const endTouched = this.plannedActionForm.controls.scheduledEnd.touched;
    return dateRangeError && (startTouched || endTouched);
  }

  protected hasPlannedActionStartPastError(): boolean {
    const startPastError = this.plannedActionForm.hasError('startInPast');
    return startPastError && this.plannedActionForm.controls.scheduledStart.touched;
  }
}

function validatePlannedActionDateRange(control: AbstractControl): ValidationErrors | null {
  const group = control as PlannedActionFormGroup;
  const start = group.controls.scheduledStart.value;
  const end = group.controls.scheduledEnd.value;

  if (!start || !end) {
    return null;
  }

  const startDate = parseDateOrNull(start);
  const endDate = parseDateOrNull(end);

  if (!startDate || !endDate) {
    return { invalidDateRange: true };
  }

  return endDate > startDate ? null : { invalidDateRange: true };
}

function validatePlannedActionStartNotPast(control: AbstractControl): ValidationErrors | null {
  const group = control as PlannedActionFormGroup;
  const start = group.controls.scheduledStart.value;
  if (!start) {
    return null;
  }

  const startDate = parseDateOrNull(start);
  if (!startDate) {
    return { startInPast: true };
  }

  return startDate >= new Date() ? null : { startInPast: true };
}

function getCurrentLocalDateTime(): string {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60_000;
  const localNow = new Date(now.getTime() - tzOffsetMs);
  return localNow.toISOString().slice(0, 16);
}

function markFormAsTouchedIfInvalid(form: FormGroup): boolean {
  if (form.invalid) {
    form.markAllAsTouched();
    return false;
  }

  return true;
}

function parseDateOrNull(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
