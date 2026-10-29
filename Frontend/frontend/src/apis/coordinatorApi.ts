// Coordinator-only endpoints.
// Matches CoordinatorEnrollmentsController in the backend (Coordinator role + enrollments.manage permission).
import { apiDelete, apiGet, apiPost } from "./academyApi";

export type EligibleLearnerDto = { id: number; name: string; email: string };
export type EnrollBody = { scheduleId: number; learnerId: number; reason?: string };
export type EnrollmentResultDto = {
  enrollmentId: number; scheduleId: number; learnerId: number; status: string;
  performedByName: string; performedAt: string; // audit: who added the student and when
};

// GET /api/coordinator/learners?search=&scheduleId=  -> learners who can still be added to that schedule
export const searchEligibleLearners = (params: { search?: string; scheduleId?: number }, signal?: AbortSignal) =>
  apiGet<EligibleLearnerDto[]>("/api/coordinator/learners", params, signal);

// POST /api/coordinator/enrollments  { scheduleId, learnerId }  -> 201 + audit info (who / when)
export const enrollLearner = (body: EnrollBody) =>
  apiPost<EnrollmentResultDto>("/api/coordinator/enrollments", body);

// DELETE /api/coordinator/enrollments/{id}  -> enrollment becomes Cancelled, audit row records who/when
export const removeEnrollment = (enrollmentId: number) =>
  apiDelete<EnrollmentResultDto>(`/api/coordinator/enrollments/${enrollmentId}`);
