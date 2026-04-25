export interface Link{
  label: string;
  url: string;
  roles: UserRole[];
  iconClasses?: string;
}

type UserRole = 'public' | 'citizen' | 'admin';;
