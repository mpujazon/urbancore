import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-report-incident-header',
  templateUrl: './report-incident-header.html',
  styleUrl: './report-incident-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentHeader {
}
