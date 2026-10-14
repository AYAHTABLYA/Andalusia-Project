// Auth / Profile / Payments / Dashboard endpoints (all need the JWT, which the
// apiClient interceptor in academyApi.ts attaches automatically).
import { apiGet, apiPost, apiPut } from "./academyApi";
import urls from "./urls.json";

const withId = (path: string, id: string | number) =>
  path.replace(":id", encodeURIComponent(String(id)));

// ---- Auth ----
const getMe = (signal?: AbortSignal) => apiGet<unknown>(urls.auth.me, undefined, signal);
const logoutRequest = () => apiPost<unknown>(urls.auth.logout, {});

// ---- Profile ----
const getProfile = (signal?: AbortSignal) =>
  apiGet<unknown>(urls.profile.get, undefined, signal);

type UpdateProfileBody = {
  firstName: string;
  lastName: string;
  title: string;
  mobileNumber: string;
  campusId: number | null;
};
const updateProfile = (body: UpdateProfileBody) =>
  apiPut<unknown>(urls.profile.update, body);

type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
const changePassword = (body: ChangePasswordBody) =>
  apiPut<unknown>(urls.profile.changePassword, body);

// ---- Payments ----
const getPayments = (signal?: AbortSignal) =>
  apiGet<unknown>(urls.payments.getAll, undefined, signal);
const getPayment = (id: string, signal?: AbortSignal) =>
  apiGet<unknown>(withId(urls.payments.getById, id), undefined, signal);
// Start a payment (body = whatever the backend's InitiatePayment DTO expects).
const initiatePayment = (body: Record<string, unknown>) =>
  apiPost<unknown>(urls.payments.initiate, body);
// Simulation callback: marks the payment as paid.
const confirmPayment = (id: string) =>
  apiPost<unknown>(withId(urls.payments.confirm, id), {});

// ---- Dashboard ----
const getLearnerDashboard = (signal?: AbortSignal) =>
  apiGet<unknown>(urls.learner.dashboard, undefined, signal);

// ---- Campuses (for the edit-profile dropdown) ----
const getCampuses = (signal?: AbortSignal) =>
  apiGet<unknown>(urls.campuses.getAll, undefined, signal);

export {
  getMe,
  logoutRequest,
  getProfile,
  updateProfile,
  changePassword,
  getPayments,
  getPayment,
  initiatePayment,
  confirmPayment,
  getLearnerDashboard,
  getCampuses,
};
export type { UpdateProfileBody, ChangePasswordBody };
