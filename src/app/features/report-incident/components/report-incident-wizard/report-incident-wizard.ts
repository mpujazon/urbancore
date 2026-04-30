import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReportIncidentForm } from '../report-incident-form/report-incident-form';
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
}
