// Client for the staff / admin endpoints of the Andalusia API.
// Types mirror the DTOs in Andalusia.Shared/Dtos (StaffDtos + AdminDtos), camelCase over the wire.
// Enums travel as strings (JsonStringEnumConverter), dates as ISO strings ("2026-10-21", "09:30:00").
import { apiDelete, apiGet, apiPost, apiPut } from "./academyApi";
import type { Paginated } from "../Types/Paginated";

type Query = Record<string, string | number | boolean | null | undefined>;
const q = (params?: Query) => params;

// ============================ Instructors (/api/admin/instructors) ============================
export type AdminInstructorDto = {
  id: number; fullName: string; email: string; mobileNumber: string; jobTitle: string; avatarUrl: string;
  isActive: boolean; schedulesCount: number; createdAt: string;
};
export type AdminInstructorDetailDto = {
  id: number; firstName: string; lastName: string; fullName: string; email: string; mobileNumber: string;
  jobTitle: string; bio: string; avatarUrl: string; isActive: boolean; schedulesCount: number;
  pendingPayouts: number; createdAt: string;
};
export type CreateInstructorBody = {
  firstName: string; lastName: string; email: string; mobileNumber: string; temporaryPassword: string;
  jobTitle?: string; bio?: string; avatarUrl?: string;
};
export type UpdateInstructorBody = {
  firstName: string; lastName: string; mobileNumber: string; jobTitle?: string; bio?: string; avatarUrl?: string;
};

export const getAdminInstructors = (
  params: { search?: string; isActive?: boolean; page?: number; pageSize?: number } = {}, signal?: AbortSignal,
) => apiGet<Paginated<AdminInstructorDto>>("/api/admin/instructors", q(params), signal);
export const getAdminInstructor = (id: number, signal?: AbortSignal) =>
  apiGet<AdminInstructorDetailDto>(`/api/admin/instructors/${id}`, undefined, signal);
export const createAdminInstructor = (body: CreateInstructorBody) =>
  apiPost<AdminInstructorDetailDto>("/api/admin/instructors", body);
export const updateAdminInstructor = (id: number, body: UpdateInstructorBody) =>
  apiPut<AdminInstructorDetailDto>(`/api/admin/instructors/${id}`, body);
export const setAdminInstructorStatus = (id: number, isActive: boolean) =>
  apiPut<AdminInstructorDetailDto>(`/api/admin/instructors/${id}/status`, { isActive });
export const getAdminInstructorSchedules = (id: number, signal?: AbortSignal) =>
  apiGet<AdminScheduleDto[]>(`/api/admin/instructors/${id}/schedules`, undefined, signal);

// ============================ Schedules / batches (/api/admin/schedules) ============================
export type ScheduleStatus = "Scheduled" | "Running" | "Completed" | "Cancelled";
export type ScheduleInstructorDto = { instructorId: number; name: string; email: string };
export type AdminScheduleDto = {
  id: number; courseId: number | null; programId: number | null; type: string; title: string; batchCode: string;
  venueName: string; roomNumber: string; startDate: string; endDate: string; capacity: number;
  enrolledCount: number; sessionsCount: number; status: string; instructors: ScheduleInstructorDto[];
};
export type CreateScheduleBody = {
  courseId?: number | null; programId?: number | null; batchCode: string; venueName?: string; roomNumber?: string;
  startDate: string; endDate: string; capacity: number; status?: ScheduleStatus; instructorIds?: number[];
};
export type UpdateScheduleBody = Omit<CreateScheduleBody, "courseId" | "programId">;

export const getAdminSchedules = (
  params: { search?: string; courseId?: number; programId?: number; status?: ScheduleStatus; page?: number; pageSize?: number } = {},
  signal?: AbortSignal,
) => apiGet<Paginated<AdminScheduleDto>>("/api/admin/schedules", q(params), signal);
export const getAdminSchedule = (id: number, signal?: AbortSignal) =>
  apiGet<AdminScheduleDto>(`/api/admin/schedules/${id}`, undefined, signal);
export const createAdminSchedule = (body: CreateScheduleBody) => apiPost<AdminScheduleDto>("/api/admin/schedules", body);
export const updateAdminSchedule = (id: number, body: UpdateScheduleBody) =>
  apiPut<AdminScheduleDto>(`/api/admin/schedules/${id}`, body);
export const deleteAdminSchedule = (id: number) => apiDelete(`/api/admin/schedules/${id}`);
export const setScheduleInstructors = (scheduleId: number, instructorIds: number[]) =>
  apiPut<AdminScheduleDto>(`/api/admin/schedules/${scheduleId}/instructors`, { instructorIds });

// ============================ Learner payments (/api/admin/payments) ============================
export type PaymentStatus = "Initiated" | "Success" | "Failed" | "Refunded";
export type AdminPaymentDto = {
  id: number; userId: number; userName: string; userEmail: string; applicationId: number | null;
  enrollmentId: number | null; itemTitle: string | null; amount: number; currency: string; gatewayName: string;
  transactionRef: string; status: string; paidAt: string | null;
};
export const getAdminPayments = (
  params: { status?: PaymentStatus; search?: string; page?: number; pageSize?: number } = {}, signal?: AbortSignal,
) => apiGet<Paginated<AdminPaymentDto>>("/api/admin/payments", q(params), signal);
export const getAdminPayment = (id: number, signal?: AbortSignal) =>
  apiGet<AdminPaymentDto>(`/api/admin/payments/${id}`, undefined, signal);
export const updateAdminPaymentStatus = (id: number, status: PaymentStatus) =>
  apiPut<AdminPaymentDto>(`/api/admin/payments/${id}/status`, { status });

// ============================ Roles & permissions (/api/admin) ============================
export type PermissionDto = { id: number; code: string; description: string };
export type RolePermissionsDto = { roleId: number; role: string; permissions: string[] };
export const getPermissionCatalog = (signal?: AbortSignal) =>
  apiGet<PermissionDto[]>("/api/admin/permissions", undefined, signal);
export const getRolePermissions = (roleId: number, signal?: AbortSignal) =>
  apiGet<RolePermissionsDto>(`/api/admin/roles/${roleId}/permissions`, undefined, signal);
export const updateRolePermissions = (roleId: number, permissions: string[]) =>
  apiPut<RolePermissionsDto>(`/api/admin/roles/${roleId}/permissions`, { permissions });

// ============================ Sessions & attendance (/api/staff) ============================
export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";
export type StaffSession = {
  id: number; title: string; date: string; startTime: string; endTime: string; roomDetails: string;
  scheduleId: number; courseTitle: string; batchCode: string;
};
export type SessionBody = { title: string; date: string; startTime: string; endTime: string; roomDetails?: string };
export type AttendanceRowDto = { learnerId: number; name: string; email: string; status: string | null; markedAt: string | null };
export type SessionAttendanceDto = {
  sessionId: number; sessionTitle: string; date: string; scheduleId: number; courseTitle: string; batchCode: string;
  learners: AttendanceRowDto[];
};
export type AttendanceRecordDto = {
  id: number; sessionId: number; sessionTitle: string; sessionDate: string; scheduleId: number; courseTitle: string;
  learnerId: number; learnerName: string; status: string; markedAt: string;
};

export const getStaffSession = (id: number, signal?: AbortSignal) =>
  apiGet<StaffSession>(`/api/staff/sessions/${id}`, undefined, signal);
export const createStaffSession = (body: SessionBody & { scheduleId: number }) =>
  apiPost<StaffSession>("/api/staff/sessions", body);
export const updateStaffSession = (id: number, body: SessionBody) => apiPut<StaffSession>(`/api/staff/sessions/${id}`, body);
export const deleteStaffSession = (id: number) => apiDelete(`/api/staff/sessions/${id}`);
export const getSessionAttendance = (sessionId: number, signal?: AbortSignal) =>
  apiGet<SessionAttendanceDto>(`/api/staff/sessions/${sessionId}/attendance`, undefined, signal);
export const saveSessionAttendance = (sessionId: number, entries: { learnerId: number; status: AttendanceStatus }[]) =>
  apiPut<SessionAttendanceDto>(`/api/staff/sessions/${sessionId}/attendance`, { entries });
export const queryAttendance = (
  params: { scheduleId?: number; sessionId?: number; learnerId?: number; status?: AttendanceStatus; from?: string; to?: string; page?: number; pageSize?: number } = {},
  signal?: AbortSignal,
) => apiGet<Paginated<AttendanceRecordDto>>("/api/staff/attendance", q(params), signal);

// ============================ Course materials (/api/staff) ============================
export type MaterialType = "Slide" | "Document" | "Reference_Link";
export type StaffMaterialDto = {
  id: number; courseId: number; courseTitle: string; scheduleId: number | null; batchCode: string | null;
  title: string; fileUrl: string; resourceType: string; uploadedAt: string; canEdit: boolean;
};
export const getCourseMaterials = (courseId: number, scheduleId?: number, signal?: AbortSignal) =>
  apiGet<StaffMaterialDto[]>(`/api/staff/courses/${courseId}/materials`, q({ scheduleId }), signal);
export const getMaterial = (id: number, signal?: AbortSignal) =>
  apiGet<StaffMaterialDto>(`/api/staff/materials/${id}`, undefined, signal);
export const createMaterial = (courseId: number, body: { scheduleId?: number | null; title: string; fileUrl: string; resourceType: MaterialType }) =>
  apiPost<StaffMaterialDto>(`/api/staff/courses/${courseId}/materials`, body);
export const updateMaterial = (id: number, body: { title: string; fileUrl: string; resourceType: MaterialType }) =>
  apiPut<StaffMaterialDto>(`/api/staff/materials/${id}`, body);
export const deleteMaterial = (id: number) => apiDelete(`/api/staff/materials/${id}`);

// ============================ Assignments & grading (/api/staff) ============================
export type StaffSubmissionDto = {
  id: number; learnerId: number; learnerName: string; email: string; fileUrl: string; status: string;
  submittedAt: string; attemptNumber: number; score: number | null; feedback: string | null; gradedAt: string | null;
};
export type AssignmentBody = { title: string; description?: string; dueDate: string; maxScore: number };
export const getStaffAssignment = (id: number, signal?: AbortSignal) =>
  apiGet<import("./staffApi").StaffAssignmentDto>(`/api/staff/assignments/${id}`, undefined, signal);
export const createStaffAssignment = (body: AssignmentBody & { scheduleId: number }) =>
  apiPost<import("./staffApi").StaffAssignmentDto>("/api/staff/assignments", body);
export const updateStaffAssignment = (id: number, body: AssignmentBody) =>
  apiPut<import("./staffApi").StaffAssignmentDto>(`/api/staff/assignments/${id}`, body);
export const deleteStaffAssignment = (id: number) => apiDelete(`/api/staff/assignments/${id}`);
export const getAssignmentSubmissions = (id: number, signal?: AbortSignal) =>
  apiGet<StaffSubmissionDto[]>(`/api/staff/assignments/${id}/submissions`, undefined, signal);
export const gradeSubmission = (id: number, body: { score: number; feedback?: string }) =>
  apiPut<StaffSubmissionDto>(`/api/staff/submissions/${id}/grade`, body);

// ============================ Student detail & progress ============================
export type StaffStudentEnrollmentDto = {
  enrollmentId: number; status: string; enrolledAt: string; courseId: number | null; programId: number | null;
  scheduleId: number | null; title: string; batchCode: string | null;
};
export type StaffStudentDetailDto = {
  id: number; name: string; email: string; mobileNumber: string | null; country: string; isActive: boolean;
  joinedAt: string; enrollments: StaffStudentEnrollmentDto[];
};
export type StudentProgressDto = {
  enrollmentId: number; scheduleId: number | null; courseTitle: string; batchCode: string | null;
  enrollmentStatus: string; totalSessions: number; heldSessions: number; presentCount: number; lateCount: number;
  absentCount: number; excusedCount: number; attendanceRate: number; totalAssignments: number;
  submittedAssignments: number; gradedAssignments: number; averageScorePercent: number | null; overallPercentage: number;
};
export type ScheduleProgressDto = {
  scheduleId: number; courseTitle: string; batchCode: string; totalSessions: number; heldSessions: number;
  totalAssignments: number; learners: { learnerId: number; name: string; email: string; progress: StudentProgressDto }[];
};
// Instructors use /api/staff/students/{id}... (limited to their own schedules); Admin/Manager can also use
// /api/admin/students/{id}... (same data, plus the enrollments list below which only exists under /admin).
export const getStaffStudentDetail = (id: number, signal?: AbortSignal) =>
  apiGet<StaffStudentDetailDto>(`/api/staff/students/${id}`, undefined, signal);
export const getStaffStudentAttendance = (id: number, scheduleId?: number, signal?: AbortSignal) =>
  apiGet<AttendanceRecordDto[]>(`/api/staff/students/${id}/attendance`, q({ scheduleId }), signal);
export const getAdminStudentEnrollments = (id: number, signal?: AbortSignal) =>
  apiGet<StaffStudentEnrollmentDto[]>(`/api/admin/students/${id}/enrollments`, undefined, signal);
export const getStaffStudentProgress = (id: number, signal?: AbortSignal) =>
  apiGet<StudentProgressDto[]>(`/api/staff/students/${id}/progress`, undefined, signal);
export const getScheduleProgress = (scheduleId: number, signal?: AbortSignal) =>
  apiGet<ScheduleProgressDto>(`/api/staff/schedules/${scheduleId}/progress`, undefined, signal);

// ============================ Course management (Admin only) ============================
export type AdminCourseMentorDto = { id: number; name: string; title: string };
export type AdminCourseDto = {
  courseId: number; slug: string; title: string; description: string; category: string;
  deliveryMode: string; hall: string; durationLabel: string; level: string; accreditation: string;
  tuition: number; tuitionNote: string; isFeatured: boolean; mentorId: number; mentorName: string;
  programId: number | null; careerPathId: number | null;
};
export type AdminCourseBody = {
  title: string; description: string; category: string; deliveryMode: string; hall: string;
  durationLabel: string; level: string; accreditation: string; tuition: number; tuitionNote: string;
  isFeatured: boolean; mentorId: number; programId: number | null; careerPathId: number | null;
};
export const getAdminCourses = (signal?: AbortSignal) =>
  apiGet<AdminCourseDto[]>('/api/admin/courses', undefined, signal);
export const getAdminCourse = (id: number, signal?: AbortSignal) =>
  apiGet<AdminCourseDto>(`/api/admin/courses/${id}`, undefined, signal);
export const getAdminCourseMentors = (signal?: AbortSignal) =>
  apiGet<AdminCourseMentorDto[]>('/api/admin/courses/mentors', undefined, signal);
export const createAdminCourse = (body: AdminCourseBody) =>
  apiPost<AdminCourseDto>('/api/admin/courses', body);
export const updateAdminCourse = (id: number, body: AdminCourseBody) =>
  apiPut<AdminCourseDto>(`/api/admin/courses/${id}`, body);
export const deleteAdminCourse = (id: number) => apiDelete(`/api/admin/courses/${id}`);
