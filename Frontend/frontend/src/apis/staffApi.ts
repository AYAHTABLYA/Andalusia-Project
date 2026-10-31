import { apiGet, apiPut } from "./academyApi";

export type StaffDashboardDto = {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalSchedules: number;
  upcomingSessions: number;
  pendingAssignments: number;
  pendingPayouts: number;
};
export type StaffSessionDto = { id:number; title:string; date:string; startTime:string; endTime:string; roomDetails:string; scheduleId:number; courseTitle:string; batchCode:string };
export type StaffAssignmentDto = { id:number; title:string; description:string; dueDate:string; maxScore:number; scheduleId:number; courseTitle:string; submissions:number; latestSubmissionAt:string|null };
export type StaffStudentDto = { id:number; name:string; email:string; enrollmentId:number; status:string|number; enrolledAt:string; scheduleId:number|null; courseTitle:string };
export type StaffPayoutDto = { id:number; instructorId:number; instructorName:string; amount:number; currency:string; status:string|number; notes:string|null; createdAt:string; paidAt:string|null; scheduleId:number|null };

export const getStaffDashboard = (signal?:AbortSignal) => apiGet<StaffDashboardDto>("/api/staff/dashboard", undefined, signal);
export const getStaffSchedule = (params?:{from?:string;to?:string},signal?:AbortSignal) => apiGet<StaffSessionDto[]>("/api/staff/schedule",params,signal);
export const getStaffAssignments = (signal?:AbortSignal) => apiGet<StaffAssignmentDto[]>("/api/staff/assignments",undefined,signal);
export const getStaffStudents = (search?:string,signal?:AbortSignal) => apiGet<StaffStudentDto[]>("/api/staff/students",{search},signal);
export const getStaffPayouts = (signal?:AbortSignal) => apiGet<StaffPayoutDto[]>("/api/staff/payouts",undefined,signal);
export const updateStaffPayoutStatus = (id:number,status:"Pending"|"Paid"|"Cancelled") => apiPut(`/api/staff/payouts/${id}/status`,{status});
