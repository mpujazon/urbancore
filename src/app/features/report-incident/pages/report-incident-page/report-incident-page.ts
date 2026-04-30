import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-report-incident-page',
  imports: [NgOptimizedImage],
  templateUrl: './report-incident-page.html',
  styleUrl: './report-incident-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentPage {
}
