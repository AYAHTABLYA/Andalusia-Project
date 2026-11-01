// Admin endpoints. Every call needs the JWT (attached by apiClient) and the matching permission.
import { apiGet, apiPost, apiPut } from "./academyApi";
import urls from "./urls.json";
import type { AdminRole, AdminUser, CreateStaffUserBody, PagedUsers } from "../Types/Admin";

const withId = (path: string, id: number) => path.replace(":id", String(id));

type UserFilters = { search?: string; role?: string; page?: number; pageSize?: number };

const getUsers = (filters: UserFilters, signal?: AbortSignal) =>
  apiGet<PagedUsers>(urls.admin.users, filters, signal);

const getRoles = (signal?: AbortSignal) => apiGet<AdminRole[]>(urls.admin.roles, undefined, signal);

const createStaffUser = (body: CreateStaffUserBody) => apiPost<AdminUser>(urls.admin.users, body);

const changeUserRole = (id: number, role: string) =>
  apiPut<AdminUser>(withId(urls.admin.userRole, id), { role });

const setUserStatus = (id: number, isActive: boolean) =>
  apiPut<AdminUser>(withId(urls.admin.userStatus, id), { isActive });

export { getUsers, getRoles, createStaffUser, changeUserRole, setUserStatus };
