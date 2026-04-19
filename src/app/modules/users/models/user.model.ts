export type UserRole = 'admin' | 'user' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  status: string;
}

export interface UsersQuery {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | '';
  name?: string;
  role?: string;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export interface UserPayload {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface ProfilePayload {
  name: string;
  email: string;
}

export interface PasswordPayload {
  currentPassword: string;
  newPassword: string;
}
