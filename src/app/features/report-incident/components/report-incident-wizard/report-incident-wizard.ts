import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReportIncidentForm } from '../report-incident-form/report-incident-form';

@Component({
  selector: 'app-report-incident-wizard',
  imports: [NgOptimizedImage, ReportIncidentForm],
  templateUrl: './report-incident-wizard.html',
  styleUrl: './report-incident-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentWizard {
}
