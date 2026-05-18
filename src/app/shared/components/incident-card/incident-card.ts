import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IncidentCardVariant, IncidentCardVm } from '../../models/incident-vm.model';
import {StatusPill} from '../status-pill/status-pill';

@Component({
  selector: 'app-incident-card',
  imports: [
    RouterLink,
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
