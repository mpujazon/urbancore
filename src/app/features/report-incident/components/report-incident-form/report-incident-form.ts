import { ChangeDetectionStrategy, Component } from '@angular/core';

import { INCIDENT_CATEGORIES } from '../../config/incident-categories';
import { IncidentCategoryLabelPipe } from '../../pipes/incident-category-label.pipe';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { IncidentCategory } from '../../../../shared/models/IncidentInterface';

type ReportIncidentFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  category: FormControl<IncidentCategory>;
}>;

type ReportIncidentFormControlName = keyof ReportIncidentFormGroup['controls'];

@Component({
  selector: 'app-report-incident-form',
  imports: [ReactiveFormsModule, IncidentCategoryLabelPipe],
  templateUrl: './report-incident-form.html',
  styleUrl: './report-incident-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentForm {
  protected readonly incidentCategories = INCIDENT_CATEGORIES;

  protected readonly reportIncidentForm: ReportIncidentFormGroup = new FormGroup({
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

  protected hasControlError(controlName: ReportIncidentFormControlName): boolean {
    const control = this.reportIncidentForm.controls[controlName];

    return control.invalid && control.touched;
  }

  protected getControlError(controlName: ReportIncidentFormControlName): string | null {
    const control = this.reportIncidentForm.controls[controlName];

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
}
