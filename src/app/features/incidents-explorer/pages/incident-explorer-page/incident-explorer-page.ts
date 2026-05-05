import { NgOptimizedImage } from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import {IncidentService} from '../../../report-incident/services/incident-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {IncidentDto} from '../../../../shared/models/IncidentInterface';

@Component({
  selector: 'app-incident-explorer-page',
  imports: [NgOptimizedImage, FontAwesomeModule],
  templateUrl: './incident-explorer-page.html',
  styleUrl: './incident-explorer-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentExplorerPage {
  private readonly incidentService = inject(IncidentService);

  protected readonly incidents = toSignal(this.incidentService.getAllIncidents(), { initialValue: null });

}
