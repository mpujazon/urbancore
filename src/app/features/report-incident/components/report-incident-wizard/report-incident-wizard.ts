import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReportIncidentForm } from '../report-incident-form/report-incident-form';
import { ReportIncidentMedia } from '../report-incident-media/report-incident-media';

@Component({
  selector: 'app-report-incident-wizard',
  imports: [NgOptimizedImage, ReportIncidentForm, ReportIncidentMedia],
  templateUrl: './report-incident-wizard.html',
  styleUrl: './report-incident-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentWizard {
}
