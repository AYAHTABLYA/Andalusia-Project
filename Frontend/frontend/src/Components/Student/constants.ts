import { ROLES } from "../../utils/roles";
import type { StaffTab } from "../Staff/constants";

// Sidebar of the student dashboard. Same shape as the staff tabs so the shared StaffSearch can list them.
// section "learning" = the day-to-day workspace, "account" = the records that used to live in the portal tab bar.
type StudentTab = StaffTab & { section: "learning" | "account" };

const learner = [ROLES.learner];
const STUDENT_TABS: StudentTab[] = [
  { to: "/workspace", label: "Overview", icon: "grid_view", roles: learner, section: "learning" },
  { to: "/workspace/courses", label: "My courses", icon: "menu_book", roles: learner, section: "learning" },
  { to: "/workspace/schedule", label: "My schedule", icon: "calendar_month", roles: learner, section: "learning" },
  { to: "/workspace/assignments", label: "Assignments", icon: "assignment_turned_in", roles: learner, section: "learning" },
  { to: "/workspace/materials", label: "Materials", icon: "folder_open", roles: learner, section: "learning" },
  { to: "/workspace/messages", label: "Messages", icon: "forum", roles: learner, section: "learning" },
  { to: "/enrollments", label: "My enrollments", icon: "school", roles: learner, section: "account" },
  { to: "/applications", label: "My applications", icon: "description", roles: learner, section: "account" },
  { to: "/payments", label: "Payments", icon: "account_balance_wallet", roles: learner, section: "account" },
  { to: "/profile", label: "Profile & settings", icon: "account_circle", roles: learner, section: "account" },
];

export type { StudentTab };
export { STUDENT_TABS };
