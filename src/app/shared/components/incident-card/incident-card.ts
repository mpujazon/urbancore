import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {IncidentCardVm} from '../../models/IncidentInterface';
import {StatusPill} from '../status-pill/status-pill';


@Component({
  selector: 'app-incident-card',
  imports: [
    StatusPill
  ],
  templateUrl: './incident-card.html',
  styleUrl: './incident-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentCard {
  incident = input.required<IncidentCardVm>();
}
