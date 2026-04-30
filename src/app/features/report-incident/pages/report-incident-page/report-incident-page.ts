import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReportIncidentHeader } from '../../components/report-incident-header/report-incident-header';
import { ReportIncidentWizard } from '../../components/report-incident-wizard/report-incident-wizard';

@Component({
  selector: 'app-report-incident-page',
  imports: [ReportIncidentHeader, ReportIncidentWizard],
  templateUrl: './report-incident-page.html',
  styleUrl: './report-incident-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentPage {
}
