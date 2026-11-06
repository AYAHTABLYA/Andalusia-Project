// Auth / Profile / Payments / Dashboard endpoints (all need the JWT, which the
// apiClient interceptor in academyApi.ts attaches automatically).
import { apiGet, apiPost, apiPut, apiUpload } from "./academyApi";
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

// POST /api/profile/photo  (multipart/form-data, field name: "file")
// Returns the new photo url, e.g. { "profileImageUrl": "/uploads/profiles/xx.jpg" }
const uploadProfilePhoto = (file: File) => {
  const body = new FormData();
  body.append("file", file);
  return apiUpload<unknown>(urls.profile.photo, body);
};

// ---- Payments ----
const getPayments = (signal?: AbortSignal) =>
  apiGet<unknown>(urls.payments.getAll, undefined, signal);
const getPayment = (id: string, signal?: AbortSignal) =>
  apiGet<unknown>(withId(urls.payments.getById, id), undefined, signal);
// Applications the learner can still pay for (real course tuition / program price).
const getPayableApplications = (signal?: AbortSignal) =>
  apiGet<unknown>(urls.payments.payable, undefined, signal);
// Start a payment for an application: creates the record (or re-uses the pending one).
const initiatePayment = (body: { applicationId: number }) =>
  apiPost<unknown>(urls.payments.initiate, body);
// Simulation callback: success=true pays (and creates the enrollment), false marks it Failed.
const confirmPayment = (id: string, success = true) =>
  apiPost<unknown>(withId(urls.payments.confirm, id), { success });

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
  uploadProfilePhoto,
  getPayments,
  getPayment,
  getPayableApplications,
  initiatePayment,
  confirmPayment,
  getLearnerDashboard,
  getCampuses,
};
export type { UpdateProfileBody, ChangePasswordBody };
