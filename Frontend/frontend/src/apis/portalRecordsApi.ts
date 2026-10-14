import { apiGet, ApiError } from "./academyApi";
import axios from "axios";
import { API_BASE_URL, getAccessToken } from "./academyApi";

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

export async function cancelMyApplication(id: number): Promise<void> {
  const token = getAccessToken();
  try {
    await axios.put(`${API_BASE_URL}/api/applications/${id}/cancel`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data;
      throw new ApiError(status, body?.message ?? body?.detail ?? body?.title ?? "Could not cancel application.");
    }
    throw error;
  }
}
