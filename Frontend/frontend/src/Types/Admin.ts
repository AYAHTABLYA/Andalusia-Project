// Mirrors Andalusia.Shared.Dtos.AdminDtos (camelCase over the wire).
type AdminUser = {
  userId: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
};

type AdminRole = {
  roleId: number;
  name: string;
  permissions: string[];
  usersCount: number;
};

type CreateStaffUserBody = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  temporaryPassword: string;
  role: string;
};

type PagedUsers = { pageIndex: number; pageSize: number; count: number; data: AdminUser[] };

export type { AdminUser, AdminRole, CreateStaffUserBody, PagedUsers };
