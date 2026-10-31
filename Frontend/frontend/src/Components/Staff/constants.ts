import { ROLES } from "../../utils/roles";

// permission: a single code, or a list where ANY one of them is enough to show the tab.
type StaffTab = { to: string; label: string; icon: string; roles: string[]; permission?: string | string[] };
// Content_Manager only manages course content: it gets the Courses tab and nothing else,
// because every other /api/admin/* endpoint answers 403 for that role.
const admins = [ROLES.admin, ROLES.manager];
const STAFF_TABS: StaffTab[] = [
  { to: "/admin", label: "Overview", icon: "grid_view", roles: admins },
  { to: "/admin/instructors", label: "Instructors", icon: "school", roles: admins },
  { to: "/admin/students", label: "Students", icon: "groups", roles: admins },
  { to: "/admin/courses", label: "Courses", icon: "menu_book", roles: [...admins, ROLES.contentManager] },
  { to: "/admin/schedule", label: "Schedule", icon: "calendar_month", roles: admins },
  { to: "/admin/compensation", label: "Compensation", icon: "payments", roles: [ROLES.admin] },
  { to: "/admin/reports", label: "Reports", icon: "analytics", roles: admins },
  { to: "/admin/permissions", label: "Roles & permissions", icon: "admin_panel_settings", roles: [ROLES.admin] },
  { to: "/admin/users", label: "Users & roles", icon: "manage_accounts", roles: [ROLES.admin], permission: "users.manage" },
  { to: "/coordinator", label: "Overview", icon: "grid_view", roles: [ROLES.coordinator] },
  { to: "/coordinator/instructors", label: "Instructors", icon: "school", roles: [ROLES.coordinator], permission: "instructors.manage" },
  { to: "/coordinator/students", label: "Students", icon: "groups", roles: [ROLES.coordinator], permission: "students.view" },
  // The Courses page is the enrollment page: it opens for enrollments.* (what the API checks) or schedules.manage.
  { to: "/coordinator/courses", label: "Courses", icon: "menu_book", roles: [ROLES.coordinator], permission: ["enrollments.view", "enrollments.manage", "schedules.manage"] },
  { to: "/coordinator/schedule", label: "Schedule", icon: "calendar_month", roles: [ROLES.coordinator], permission: "schedules.manage" },
  { to: "/coordinator/attendance", label: "Attendance", icon: "fact_check", roles: [ROLES.coordinator], permission: "attendance.manage" },
  { to: "/coordinator/reports", label: "Reports", icon: "analytics", roles: [ROLES.coordinator], permission: "reports.view" },
  { to: "/instructor", label: "Overview", icon: "grid_view", roles: [ROLES.instructor] },
  { to: "/instructor/courses", label: "My courses", icon: "menu_book", roles: [ROLES.instructor] },
  { to: "/instructor/students", label: "My students", icon: "groups", roles: [ROLES.instructor] },
  { to: "/instructor/schedule", label: "My schedule", icon: "calendar_month", roles: [ROLES.instructor] },
  { to: "/instructor/attendance", label: "Attendance", icon: "fact_check", roles: [ROLES.instructor] },
  { to: "/instructor/assignments", label: "Assignments", icon: "assignment", roles: [ROLES.instructor] },
  { to: "/instructor/messages", label: "Messages", icon: "forum", roles: [ROLES.instructor] },
  { to: "/instructor/earnings", label: "Earnings", icon: "payments", roles: [ROLES.instructor] },
];
export type { StaffTab };
export { STAFF_TABS };
