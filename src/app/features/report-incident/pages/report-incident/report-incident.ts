import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-report-incident',
  imports: [NgOptimizedImage],
  templateUrl: './report-incident.html',
  styleUrl: './report-incident.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncident {
}
