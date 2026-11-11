// Admin endpoints. Every call needs the JWT (attached by apiClient) and the matching permission.
import { apiDelete, apiGet, apiPost, apiPut } from "./academyApi";
import urls from "./urls.json";
import type {
  AdminFaq,
  AdminRole,
  AdminTestimonial,
  AdminUser,
  CreateStaffUserBody,
  FaqBody,
  PagedUsers,
  TestimonialBody,
} from "../Types/Admin";

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

// The list endpoints may answer with a plain array or a paged { data: [] } envelope: accept both.
const asList = <T,>(body: T[] | { data?: T[] } | null | undefined): T[] =>
  Array.isArray(body) ? body : (body?.data ?? []);

// ---- FAQs (content.manage) ----
const getAdminFaqs = async (signal?: AbortSignal) =>
  asList(await apiGet<AdminFaq[] | { data: AdminFaq[] }>(urls.admin.faqs, undefined, signal));

const createFaq = (body: FaqBody) => apiPost<AdminFaq>(urls.admin.faqs, body);

const updateFaq = (id: number, body: FaqBody) => apiPut<AdminFaq>(withId(urls.admin.faq, id), body);

const deleteFaq = (id: number) => apiDelete(withId(urls.admin.faq, id));

// ---- Testimonials (content.manage) ----
const getAdminTestimonials = async (signal?: AbortSignal) =>
  asList(
    await apiGet<AdminTestimonial[] | { data: AdminTestimonial[] }>(urls.admin.testimonials, undefined, signal),
  );

const createTestimonial = (body: TestimonialBody) => apiPost<AdminTestimonial>(urls.admin.testimonials, body);

const updateTestimonial = (id: number, body: TestimonialBody) =>
  apiPut<AdminTestimonial>(withId(urls.admin.testimonial, id), body);

const deleteTestimonial = (id: number) => apiDelete(withId(urls.admin.testimonial, id));

export {
  getUsers,
  getRoles,
  createStaffUser,
  changeUserRole,
  setUserStatus,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
