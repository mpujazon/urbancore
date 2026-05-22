export interface UserDto{
  id: number;
  firebaseUid: string;
  email: string;
  role: UserRole;
  cityId?: string;
}
export type UserRole = 'unlogged' | 'ROLE_CITIZEN' | 'ROLE_ADMIN';
