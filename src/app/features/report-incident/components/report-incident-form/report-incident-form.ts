import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { INCIDENT_CATEGORIES } from '../../config/incident-categories';
import { IncidentCategoryLabelPipe } from '../../pipes/incident-category-label.pipe';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { IncidentCategory } from '../../../../shared/models/IncidentInterface';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';

type ReportIncidentFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  category: FormControl<IncidentCategory>;
}>;

type ReportIncidentFormControlName = keyof ReportIncidentFormGroup['controls'];

export interface ReportIncidentFormValues{
  title: string;
  description: string;
  category: IncidentCategory;
}

@Component({
  selector: 'app-report-incident-form',
  imports: [ReactiveFormsModule, IncidentCategoryLabelPipe],
  templateUrl: './report-incident-form.html',
  styleUrl: './report-incident-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentForm {
  protected readonly incidentCategories = INCIDENT_CATEGORIES;
  formValuesChanged = output<ReportIncidentFormValues>();
  formValidityChanged = output<boolean>();

  protected readonly incidentForm: ReportIncidentFormGroup = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20)],
    }),
    category: new FormControl<IncidentCategory>('OTHER', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.incidentForm.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(
          (prev, curr) =>
            prev.title === curr.title &&
            prev.description === curr.description &&
            prev.category === curr.category
        ),
        tap(() => this.incidentForm.valid? this.emitValidFormData() : this.emitFormValidity(false)),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  protected hasControlError(controlName: ReportIncidentFormControlName): boolean {
    const control = this.incidentForm.controls[controlName];
    return control.invalid && control.touched;
  }

  protected getControlError(controlName: ReportIncidentFormControlName): string | null {
    const control = this.incidentForm.controls[controlName];

    if (!this.hasControlError(controlName)) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Must be at least ${requiredLength} characters.`;
    }

    return null;
  }

  getFormValues(): ReportIncidentFormValues {
    return this.incidentForm.getRawValue();
  }

  emitValidFormData(): void{
    this.formValuesChanged.emit(this.getFormValues());
    this.emitFormValidity(true);
  }

  emitFormValidity(isValid: boolean): void{
    this.formValidityChanged.emit(isValid);
  }
}
