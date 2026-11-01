import { apiGet, apiPut } from "./academyApi";

export type EnrollmentDto = {
  id: number; status: string; enrolledAt: string;
  courseId: number | null; courseTitle: string | null;
  programId: number | null; programTitle: string | null;
  scheduleId: number | null; applicationId: number | null;
};
export type ApplicationDto = {
  id: number; status: string; submissionDate: string;
  courseId: number | null; courseTitle: string | null;
  programId: number | null; programTitle: string | null; scheduleId: number | null;
};

export const getMyEnrollments = () => apiGet<EnrollmentDto[]>("/api/enrollments");
export const getMyEnrollment = (id: number) => apiGet<EnrollmentDto>(`/api/enrollments/${id}`);
export const getMyApplications = () => apiGet<ApplicationDto[]>("/api/applications");
export const getMyApplication = (id: number) => apiGet<ApplicationDto>(`/api/applications/${id}`);

export const cancelMyApplication = (id: number) => apiPut<void>(`/api/applications/${id}/cancel`, {});
