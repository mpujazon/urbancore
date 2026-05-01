import { ChangeDetectionStrategy, Component } from '@angular/core';

import { INCIDENT_CATEGORIES } from '../../config/incident-categories';
import { IncidentCategoryLabelPipe } from '../../pipes/incident-category-label.pipe';

@Component({
  selector: 'app-report-incident-form',
  imports: [IncidentCategoryLabelPipe],
  templateUrl: './report-incident-form.html',
  styleUrl: './report-incident-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIncidentForm {
  protected readonly incidentCategories = INCIDENT_CATEGORIES;
}
