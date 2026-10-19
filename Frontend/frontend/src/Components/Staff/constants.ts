import { ROLES } from "../../utils/roles";

type StaffTab = { to: string; label: string; icon: string; roles: string[]; permission?: string };
const admins = [ROLES.admin, ROLES.manager, ROLES.contentManager];
const STAFF_TABS: StaffTab[] = [
  { to: "/admin", label: "Overview", icon: "grid_view", roles: admins },
  { to: "/admin/instructors", label: "Instructors", icon: "school", roles: admins },
  { to: "/admin/students", label: "Students", icon: "groups", roles: admins },
  { to: "/admin/courses", label: "Courses", icon: "menu_book", roles: admins },
  { to: "/admin/schedule", label: "Schedule", icon: "calendar_month", roles: admins },
  { to: "/admin/compensation", label: "Compensation", icon: "payments", roles: [ROLES.admin] },
  { to: "/admin/reports", label: "Reports", icon: "analytics", roles: admins },
  { to: "/admin/permissions", label: "Roles & permissions", icon: "admin_panel_settings", roles: [ROLES.admin] },
  { to: "/admin/users", label: "Users & roles", icon: "manage_accounts", roles: [ROLES.admin], permission: "users.manage" },
  { to: "/instructor", label: "Overview", icon: "grid_view", roles: [ROLES.instructor] },
  { to: "/instructor/schedule", label: "My schedule", icon: "calendar_month", roles: [ROLES.instructor] },
  { to: "/instructor/assignments", label: "Assignments & grading", icon: "assignment", roles: [ROLES.instructor] },
  { to: "/instructor/messages", label: "Student messages", icon: "forum", roles: [ROLES.instructor] },
  { to: "/instructor/earnings", label: "My earnings", icon: "payments", roles: [ROLES.instructor] },
  { to: "/instructor/availability", label: "My availability", icon: "event_available", roles: [ROLES.instructor] },
];
export type { StaffTab };
export { STAFF_TABS };
