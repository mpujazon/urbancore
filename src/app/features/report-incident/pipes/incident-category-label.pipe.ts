import { Pipe, PipeTransform } from '@angular/core';

import type { IncidentCategory } from '../../../shared/models/IncidentInterface';

@Pipe({
  name: 'incidentCategoryLabel',
})
export class IncidentCategoryLabelPipe implements PipeTransform {
  transform(category: IncidentCategory): string {
    return category
      .toLowerCase()
      .split('_')
      .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(' ');
  }
}
