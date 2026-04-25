export interface Link{
  label: string;
  url: string;
  roles: UserRole[];
  iconClasses?: string;
}

type UserRole = 'unlogged' | 'citizen' | 'admin';
