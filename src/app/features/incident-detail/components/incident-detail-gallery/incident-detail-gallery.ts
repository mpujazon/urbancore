import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { IncidentDetailImageVm } from '../../../../shared/models/incident-vm.model';

@Component({
  selector: 'app-incident-detail-gallery',
  templateUrl: './incident-detail-gallery.html',
  styleUrl: './incident-detail-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailGalleryComponent {
  readonly images = input.required<IncidentDetailImageVm[]>();
}
