import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-report-incident-location',
  imports: [NgOptimizedImage],
  templateUrl: './report-incident-location.html',
  styleUrl: './report-incident-location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentLocation {
}
