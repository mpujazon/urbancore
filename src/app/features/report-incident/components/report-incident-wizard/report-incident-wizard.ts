import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ReportIncidentForm, ReportIncidentFormValues } from '../report-incident-form/report-incident-form';
import { ReportIncidentLocation } from '../report-incident-location/report-incident-location';
import { ReportIncidentMedia } from '../report-incident-media/report-incident-media';

@Component({
  selector: 'app-report-incident-wizard',
  imports: [ReportIncidentForm, ReportIncidentLocation, ReportIncidentMedia],
  templateUrl: './report-incident-wizard.html',
  styleUrl: './report-incident-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentWizard {
  // Values
  formValues = signal<ReportIncidentFormValues >({title: '', description: '', category: 'OTHER'});

  // Validations
  isFormValid = signal<boolean>(false);

  canSubmit = computed(()=>{
    return this.isFormValid();
  });

  // Update Values Functions
  updateFormValues(values: ReportIncidentFormValues): void{
    this.formValues.set(values);
  }

  // Validity Functions
  updateFormValidityState(isValid: boolean): void{
    this.isFormValid.set(isValid);
  }
}
