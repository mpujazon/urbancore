import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-report-incident-form',
  templateUrl: './report-incident-form.html',
  styleUrl: './report-incident-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentForm {
}
