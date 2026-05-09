import { Pipe, PipeTransform } from '@angular/core';

import type { UserRole } from '../../../shared/models/user-dto.model';

@Pipe({
  name: 'userRoleLabel',
})
export class UserRoleLabelPipe implements PipeTransform {
  transform(role: UserRole | null | undefined): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Admin';
      case 'ROLE_CITIZEN':
        return 'Citizen';
      default:
        return 'Unlogged';
    }
  }
}
