import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ReportIncidentHeader } from '../../components/report-incident-header/report-incident-header';

@Component({
  selector: 'app-report-incident-page',
  imports: [NgOptimizedImage, ReportIncidentHeader],
  templateUrl: './report-incident-page.html',
  styleUrl: './report-incident-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentPage {
}
