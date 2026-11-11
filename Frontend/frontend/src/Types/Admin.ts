// Mirrors Andalusia.Shared.Dtos.AdminDtos / ContentDtos (camelCase over the wire).
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

// Content management (FAQs + testimonials shown on the landing page). Guarded by content.manage.
type AdminFaq = {
  faqId: number;
  categoryId?: number | null;
  categoryName?: string | null;
  question: string;
  answer: string;
  orderIndex: number;
  isActive: boolean;
};

type FaqBody = {
  question: string;
  answer: string;
  // null = let the API decide (end of its category on create, kept on update).
  orderIndex: number | null;
  categoryId: number | null;
  isActive: boolean;
};

type AdminTestimonial = {
  testimonialId: number;
  clientName: string;
  titleOrRole: string;
  quoteText: string;
  avatarUrl?: string | null;
  initials?: string | null; // computed by the API from clientName (read-only)
  rating: number;
  isFeatured: boolean;
  courseId?: number | null;
  courseTitle?: string | null;
};

type TestimonialBody = {
  clientName: string;
  titleOrRole: string;
  quoteText: string;
  avatarUrl: string | null;
  rating: number;
  isFeatured: boolean;
  courseId: number | null;
};

export type {
  AdminUser,
  AdminRole,
  CreateStaffUserBody,
  PagedUsers,
  AdminFaq,
  FaqBody,
  AdminTestimonial,
  TestimonialBody,
};
