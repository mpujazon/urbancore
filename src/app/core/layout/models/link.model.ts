import { UserRole } from "../../../shared/models/user-dto.model";

export interface Link{
  label: string;
  url: string;
  roles: UserRole[];
  iconClasses?: string;
}
