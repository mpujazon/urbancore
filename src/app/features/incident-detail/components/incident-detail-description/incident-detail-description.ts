import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-incident-detail-description',
  templateUrl: './incident-detail-description.html',
  styleUrl: './incident-detail-description.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailDescriptionComponent {
  readonly description = input.required<string>();
}
