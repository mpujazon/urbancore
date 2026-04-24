export interface Link{
  label: string;
  url: string;
  basedRole: 'public' | 'citizen' | 'admin';
  iconClasses?: string;
}
