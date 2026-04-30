import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-report-incident-media',
  imports: [NgOptimizedImage],
  templateUrl: './report-incident-media.html',
  styleUrl: './report-incident-media.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentMedia {
}
