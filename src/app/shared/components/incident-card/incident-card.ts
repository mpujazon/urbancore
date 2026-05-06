import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {IncidentCardVariant, IncidentCardVm} from '../../models/IncidentInterface';
import {StatusPill} from '../status-pill/status-pill';

@Component({
  selector: 'app-incident-card',
  imports: [
    StatusPill
  ],
  templateUrl: './incident-card.html',
  styleUrl: './incident-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:{
    '[class.incident-card--detailed]': 'variant() === "DETAILED"',
    '[class.incident-card--compact]': 'variant() === "COMPACT"'
  }
})
export class IncidentCard {
  incident = input.required<IncidentCardVm>();
  variant = input.required<IncidentCardVariant>();
}
