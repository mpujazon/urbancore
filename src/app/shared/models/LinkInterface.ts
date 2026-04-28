import { UserRole } from "./UserInterface";

export interface Link{
  label: string;
  url: string;
  roles: UserRole[];
  iconClasses?: string;
}
