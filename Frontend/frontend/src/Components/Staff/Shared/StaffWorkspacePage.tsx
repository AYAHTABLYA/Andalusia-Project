import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../style.css";
import { getRoles } from "../../../apis/adminApi";
import type { AdminRole } from "../../../Types/Admin";
import {
  getStaffDashboard,
  getStaffSchedule,
  getStaffAssignments,
  getStaffPayouts,
  getStaffStudents,
  updateStaffPayoutStatus,
} from "../../../apis/staffApi";
import type {
  StaffPayoutDto,
  StaffAssignmentDto,
} from "../../../apis/staffApi";
import {
  getAdminInstructors,
  getAdminSchedules,
  getAdminReports,
} from "../../../apis/staffAdminApi";
import type { AdminScheduleDto } from "../../../apis/staffAdminApi";
import {
  AddPersonDialog,
  ScheduleSessionDialog,
  ReviewRolesDialog,
  CreateAssignmentDialog,
  ReviewSubmissionsDialog,
} from "./StaffActionDialogs";
import { downloadCsv } from "../../../utils/csv";
import AdminCoursesManager from "../Admin/Courses/AdminCoursesManager";
import { initials } from "../../../utils/format";
import Select from "../../Shared/Select/Select";

type PageConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: string;
  stats: { label: string; value: string; icon: string }[];
  columns: string[];
  rows: string[][];
  actions: { id: string; label: string }[];
  note: string;
};
const configs: Record<string, PageConfig> = {
  "/admin/instructors": {
    eyebrow: "ACADEMY OPERATIONS",
    title: "Instructor management",
    subtitle:
      "Manage teaching profiles, specializations, workload and compensation rates.",
    icon: "school",
    stats: [
      { label: "Total instructors", value: "—", icon: "groups" },
      { label: "Active", value: "—", icon: "verified_user" },
      { label: "Teaching load", value: "—", icon: "calendar_month" },
    ],
    columns: [
      "Instructor",
      "Specialization",
      "Teaching load",
      "Rate",
      "Status",
    ],
    rows: [],
    actions: [{ id: "add-instructor", label: "Add instructor" }, { id: "export-list", label: "Export list" }],
    note: "Instructor records will appear when the instructor-management API is connected.",
  },
  "/admin/students": {
    eyebrow: "ACADEMY OPERATIONS",
    title: "Student management",
    subtitle:
      "Review student accounts, enrollments, learning progress and account status.",
    icon: "groups",
    stats: [
      { label: "Students", value: "—", icon: "groups" },
      { label: "Active enrollments", value: "—", icon: "school" },
      { label: "Needs attention", value: "—", icon: "flag" },
    ],
    columns: ["Student", "Course", "Progress", "Last activity", "Status"],
    rows: [],
    actions: [{ id: "add-student", label: "Add student" }, { id: "export-list", label: "Export list" }],
    note: "Student records and progress will appear when the relevant APIs are connected.",
  },
  "/admin/courses": {
    eyebrow: "ACADEMY OPERATIONS",
    title: "Course management",
    subtitle:
      "Manage the course register, instructors, enrollment capacity, pricing and status.",
    icon: "menu_book",
    stats: [
      { label: "Courses", value: "—", icon: "menu_book" },
      { label: "Running", value: "—", icon: "play_circle" },
      { label: "Enrollments", value: "—", icon: "groups" },
    ],
    columns: ["Course", "Code", "Instructor", "Capacity", "Price", "Status"],
    rows: [],
    actions: [{ id: "create-course", label: "Create course" }, { id: "export-list", label: "Export list" }],
    note: "Course records will appear when the course-management API is connected.",
  },
  "/admin/schedule": {
    eyebrow: "ACADEMY OPERATIONS",
    title: "Academy schedule",
    subtitle:
      "Coordinate sessions across courses, instructors and students. Check times and classroom access in one place.",
    icon: "calendar_month",
    stats: [
      { label: "Sessions today", value: "—", icon: "today" },
      { label: "Upcoming", value: "—", icon: "event_upcoming" },
      { label: "Live now", value: "—", icon: "videocam" },
    ],
    columns: [
      "Session",
      "Course",
      "Instructor",
      "Date & time",
      "Students",
      "Status",
    ],
    rows: [],
    actions: [{ id: "schedule-session", label: "Schedule session" }, { id: "calendar-view", label: "Calendar view" }],
    note: "The calendar will show authoritative session data, timezone and Zoom links when the schedule API is connected.",
  },
  "/admin/compensation": {
    eyebrow: "FINANCE",
    title: "Instructor compensation",
    subtitle:
      "Review pending instructor payouts and approved financial transactions before payout.",
    icon: "payments",
    stats: [
      { label: "Pending payout", value: "—", icon: "pending_actions" },
      { label: "Paid this month", value: "—", icon: "task_alt" },
      { label: "Recent transactions", value: "—", icon: "receipt_long" },
    ],
    columns: ["Instructor", "Period", "Sessions", "Amount", "Approval status"],
    rows: [],
    actions: [{ id: "review-pending", label: "Review pending" }, { id: "export-transactions", label: "Export transactions" }],
    note: "Compensation data is intentionally separate from student payments and academy revenue.",
  },
  "/admin/reports": {
    eyebrow: "INSIGHTS",
    title: "Reports & analytics",
    subtitle:
      "Monitor academy growth, teaching delivery and financial performance over time.",
    icon: "analytics",
    stats: [
      { label: "Student growth", value: "—", icon: "trending_up" },
      { label: "Sessions delivered", value: "—", icon: "event_available" },
      { label: "Revenue", value: "—", icon: "payments" },
    ],
    columns: ["Report", "Period", "Updated", "Status"],
    rows: [],
    actions: [{ id: "operational-report", label: "Operational report" }, { id: "financial-report", label: "Financial report" }, { id: "export-report", label: "Export report" }],
    note: "Reports are calculated from enrollments, completed sessions and successful payments for the selected period.",
  },
  "/admin/permissions": {
    eyebrow: "SECURITY",
    title: "Roles & permissions",
    subtitle:
      "Review role access and keep sensitive finance and administration actions restricted.",
    icon: "admin_panel_settings",
    stats: [
      { label: "Roles", value: "—", icon: "badge" },
      { label: "Permissions", value: "—", icon: "verified_user" },
      { label: "Pending reviews", value: "—", icon: "fact_check" },
    ],
    columns: [
      "Role",
      "Workspace access",
      "Finance access",
      "User management",
      "Status",
    ],
    rows: [],
    actions: [{ id: "review-roles", label: "Review roles" }, { id: "audit-permissions", label: "Audit permissions" }],
    note: "The API remains the authority for permission enforcement; this workspace does not grant permissions by itself.",
  },
  "/instructor/courses": {
    eyebrow: "TEACHING WORKSPACE",
    title: "My courses",
    subtitle: "The courses and batches assigned to you.",
    icon: "menu_book",
    stats: [
      { label: "Courses", value: "—", icon: "menu_book" },
      { label: "Batches", value: "—", icon: "layers" },
      { label: "Students", value: "—", icon: "groups" },
    ],
    columns: ["Course", "Batch", "Students", "Next session", "Status"],
    rows: [],
    actions: [{ id: "export-courses", label: "Export courses" }],
    note: "Only courses assigned to your instructor account are shown here.",
  },
  "/instructor/students": {
    eyebrow: "TEACHING WORKSPACE",
    title: "My students",
    subtitle: "Learners with an approved enrollment in your courses.",
    icon: "groups",
    stats: [
      { label: "Students", value: "—", icon: "groups" },
      { label: "Active enrollments", value: "—", icon: "task_alt" },
      { label: "Courses", value: "—", icon: "menu_book" },
    ],
    columns: ["Student", "Course", "Batch", "Enrolled", "Status"],
    rows: [],
    actions: [{ id: "export-students", label: "Export students" }],
    note: "You only see learners assigned to you through an approved enrollment.",
  },
  "/instructor/attendance": {
    eyebrow: "TEACHING WORKSPACE",
    title: "Attendance",
    subtitle: "Mark who attended each of your sessions.",
    icon: "fact_check",
    stats: [
      { label: "Sessions", value: "—", icon: "event" },
      { label: "Attendance rate", value: "—", icon: "percent" },
      { label: "Absences", value: "—", icon: "person_off" },
    ],
    columns: ["Session", "Course", "Date", "Present", "Absent"],
    rows: [],
    actions: [{ id: "export-attendance", label: "Export attendance" }],
    note: "Attendance tracking will load once the attendance API is connected.",
  },
  "/instructor/schedule": {
    eyebrow: "TEACHING WORKSPACE",
    title: "My schedule",
    subtitle:
      "See only your assigned sessions, with class time, course details and classroom access.",
    icon: "calendar_month",
    stats: [
      { label: "Today", value: "—", icon: "today" },
      { label: "This week", value: "—", icon: "date_range" },
      { label: "Completed", value: "—", icon: "task_alt" },
    ],
    columns: ["Time", "Course", "Students", "Duration", "Classroom"],
    rows: [],
    actions: [{ id: "today", label: "Today" }, { id: "week", label: "Week" }, { id: "month", label: "Month" }],
    note: "Only sessions assigned to your instructor account should be displayed here.",
  },
  "/instructor/assignments": {
    eyebrow: "TEACHING WORKSPACE",
    title: "Assignments & grading",
    subtitle:
      "Create course work, track submissions and provide feedback to enrolled students.",
    icon: "assignment",
    stats: [
      { label: "Assignments", value: "—", icon: "assignment" },
      { label: "To grade", value: "—", icon: "rate_review" },
      { label: "Graded", value: "—", icon: "task_alt" },
    ],
    columns: ["Assignment", "Course", "Due date", "Submissions", "Status"],
    rows: [],
    actions: [{ id: "create-assignment", label: "Create assignment" }, { id: "review-submissions", label: "Review submissions" }],
    note: "Student eligibility should come from coordinator-approved enrollments. Submission and grading data will load from the assignment APIs.",
  },
  "/instructor/messages": {
    eyebrow: "TEACHING WORKSPACE",
    title: "Student messages",
    subtitle:
      "Keep course-related questions and responses together in one place.",
    icon: "forum",
    stats: [
      { label: "Conversations", value: "—", icon: "forum" },
      { label: "Unread", value: "—", icon: "mark_chat_unread" },
      { label: "Awaiting reply", value: "—", icon: "schedule" },
    ],
    columns: ["Student", "Course", "Last message", "Updated", "Status"],
    rows: [],
    actions: [{ id: "unread", label: "Unread" }, { id: "all-conversations", label: "All conversations" }],
    note: "Messages will be scoped to your assigned students and courses when the messaging API is connected.",
  },
  "/instructor/earnings": {
    eyebrow: "MY FINANCES",
    title: "My earnings",
    subtitle:
      "Review your personal earnings and approved items without academy-wide financial data.",
    icon: "payments",
    stats: [
      { label: "This month", value: "—", icon: "calendar_month" },
      { label: "Pending", value: "—", icon: "pending_actions" },
      { label: "Paid", value: "—", icon: "task_alt" },
    ],
    columns: ["Date", "Course / session", "Pay model", "Amount", "Status"],
    rows: [],
    actions: [{ id: "current-month", label: "Current month" }, { id: "earnings-history", label: "Earnings history" }],
    note: "Only your own earnings and approved transactions belong in this view.",
  },
  "/instructor/availability": {
    eyebrow: "TEACHING WORKSPACE",
    title: "My availability",
    subtitle:
      "Set the teaching windows coordinators can use when arranging sessions.",
    icon: "event_available",
    stats: [
      { label: "Available windows", value: "—", icon: "event_available" },
      { label: "Booked windows", value: "—", icon: "event_busy" },
      { label: "Upcoming sessions", value: "—", icon: "calendar_month" },
    ],
    columns: ["Day", "Available from", "Available to", "Timezone", "Status"],
    rows: [],
    actions: [{ id: "add-availability", label: "Add availability" }, { id: "save-changes", label: "Save changes" }],
    note: "Availability is provided by the instructor; coordinators schedule sessions within these windows. Changes will be saved once the availability API is available.",
  },
};
// Display-only headings for the admin pages (AHA design). config.* keeps driving data/CSV logic.
const ADMIN_HEADINGS: Record<string, { eyebrow: string; title: string; sub: string }> = {
  "/admin/instructors": { eyebrow: "ACADEMY MANAGEMENT", title: "Instructors", sub: "Manage, review, and keep every record up to date." },
  "/admin/students": { eyebrow: "ACADEMY MANAGEMENT", title: "Students", sub: "Manage, review, and keep every record up to date." },
  "/admin/schedule": { eyebrow: "CLASSES & MEETINGS", title: "Schedule", sub: "Everything you need for the academy's learning sessions." },
  "/admin/compensation": { eyebrow: "AHA ACADEMY", title: "Compensation & payouts", sub: "Review instructor earnings, approvals, and payout history." },
  "/admin/reports": { eyebrow: "AHA ACADEMY", title: "Academy reports", sub: "Operational, learning, and financial performance in one place." },
  "/admin/permissions": { eyebrow: "SECURITY & ACCESS", title: "Roles & permissions", sub: "Control exactly what every role can see and change." },
};
// Pages whose first column is a person (shown with an avatar).
const PEOPLE_PAGES = ["/admin/instructors", "/admin/students", "/instructor/students"];
const POSITIVE = /^(active|approved|paid|configured|yes|completed|live|graded|running)$/i;

const iso = (d: Date) => d.toLocaleDateString("en-CA");
function rangeFor(period: string): { from: string; to: string } | undefined {
  const n = new Date(),
    y = n.getFullYear(),
    m = n.getMonth();
  if (period === "Today") return { from: iso(n), to: iso(n) };
  if (period === "This week") {
    const mon = new Date(y, m, n.getDate() - ((n.getDay() + 6) % 7));
    const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
    return { from: iso(mon), to: iso(sun) };
  }
  if (period === "This month")
    return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) };
  if (period === "This year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  if (period === "All time") return { from: "2000-01-01", to: iso(n) };
  return undefined;
}
export default function StaffWorkspacePage() {
  const { pathname: rawPathname } = useLocation();
  // Coordinator pages share the Admin page logic (same endpoints, same columns); only the URL prefix differs.
  const isCoordinator = rawPathname.startsWith("/coordinator");
  const pathname = isCoordinator ? rawPathname.replace("/coordinator", "/admin") : rawPathname;
  const baseConfig = configs[pathname] ?? configs["/admin/reports"];
  // A Coordinator manages people/courses/schedules, but never creates accounts and never sees revenue
  // (the API enforces the same limits; this just keeps the screen honest).
  const COORDINATOR_HIDDEN_ACTION_IDS = new Set(["add-instructor", "add-student", "financial-report"]);
  const config = isCoordinator
    ? {
        ...baseConfig,
        actions: baseConfig.actions.filter((action) => !COORDINATOR_HIDDEN_ACTION_IDS.has(action.id)),
        stats: baseConfig.stats.filter((s) => s.label !== "Revenue"),
      }
    : baseConfig;
  const [query, setQuery] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [period, setPeriod] = useState("This month");
  const [notice, setNotice] = useState("");
  const [liveRows, setLiveRows] = useState<string[][]>(config.rows);
  const [liveStats, setLiveStats] = useState(config.stats);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyPayout, setBusyPayout] = useState<number | null>(null);
  const payoutByRow = useRef(new WeakMap<string[], StaffPayoutDto>());
  const [dialog, setDialog] = useState<
    | null
    | "instructor"
    | "student"
    | "session"
    | "roles"
    | "assignment"
    | "submissions"
  >(null);
  const [monthOnly, setMonthOnly] = useState(false);
  const [assignmentsList, setAssignmentsList] = useState<StaffAssignmentDto[]>(
    [],
  );
  const [scheduleOptions, setScheduleOptions] = useState<
    { id: number; label: string }[]
  >([]);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [schedules, setSchedules] = useState<AdminScheduleDto[]>([]);
  const [roleMatrix, setRoleMatrix] = useState<AdminRole[]>([]);
  useEffect(() => {
    setPendingOnly(false);
    setMonthOnly(false);
    setDialog(null);
  }, [pathname]);
  useEffect(() => {
    const timer = window.setTimeout(() => setReportSearch(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  function dialogDone(message: string) {
    setDialog(null);
    setNotice(message);
    setReloadKey((k) => k + 1);
  }
  const canReviewPayouts = pathname === "/admin/compensation";
  async function changePayout(
    payout: StaffPayoutDto,
    status: "Pending" | "Paid" | "Cancelled",
  ) {
    setBusyPayout(payout.id);
    setNotice("");
    try {
      await updateStaffPayoutStatus(payout.id, status);
      setNotice(`Payout #${payout.id} marked ${status.toLowerCase()}.`);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Could not update this payout.",
      );
    } finally {
      setBusyPayout(null);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setLiveRows(config.rows);
    setLiveStats(config.stats);
    setRoleMatrix([]);
    setLoadError("");
    const setCount = (label: string, value: string) =>
      setLiveStats((prev) =>
        prev.map((item) => (item.label === label ? { ...item, value } : item)),
      );
    const load = async () => {
      if (pathname === "/admin/reports") {
        // Reports are loaded in a separate effect so typing in the report search
        // does not reload unrelated admin/instructor workspaces.
      } else if (pathname === "/admin/instructors") {
        setLoading(true);
        try {
          const result = await getAdminInstructors(
            { page: 1, pageSize: 100 },
            signal,
          );
          if (signal.aborted) return;
          setLiveRows(
            result.data.map((i) => [
              i.fullName,
              i.jobTitle || "—",
              `${i.schedulesCount} ${i.schedulesCount === 1 ? "schedule" : "schedules"}`,
              "—",
              i.isActive ? "Active" : "Inactive",
            ]),
          );
          setCount("Total instructors", String(result.count));
          setCount(
            "Active",
            String(result.data.filter((i) => i.isActive).length),
          );
          setCount(
            "Teaching load",
            String(result.data.reduce((sum, i) => sum + i.schedulesCount, 0)),
          );
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load instructors.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      } else if (pathname === "/admin/students") {
        setLoading(true);
        try {
          const rows = await getStaffStudents(undefined, signal);
          if (signal.aborted) return;
          setLiveRows(
            rows.map((r) => [
              `${r.name} (${r.email})`,
              r.courseTitle || "—",
              "—",
              new Date(r.enrolledAt).toLocaleDateString(),
              String(r.status).replaceAll("_", " "),
            ]),
          );
          setCount("Students", String(new Set(rows.map((r) => r.id)).size));
          setCount(
            "Active enrollments",
            String(
              rows.filter((r) =>
                ["active", "enrolled"].includes(String(r.status).toLowerCase()),
              ).length,
            ),
          );
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load students.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      } else if (pathname === "/admin/schedule") {
        setLoading(true);
        try {
          const result = await getAdminSchedules(
            { page: 1, pageSize: 100 },
            signal,
          );
          if (signal.aborted) return;
          const rows = result.data;
          setLiveRows(
            rows.map((r) => [
              r.title || r.batchCode || `Schedule #${r.id}`,
              r.courseId
                ? `Course #${r.courseId}`
                : r.programId
                  ? `Program #${r.programId}`
                  : "—",
              r.instructors.map((i) => i.name).join(", ") || "Unassigned",
              `${r.startDate} – ${r.endDate}`,
              `${r.enrolledCount}/${r.capacity}`,
              r.status,
            ]),
          );
          setSchedules(rows);
          const t = new Date().toLocaleDateString("en-CA");
          const [todays, dash] = await Promise.all([
            getStaffSchedule({ from: t, to: t }, signal),
            getStaffDashboard(signal),
          ]);
          if (signal.aborted) return;
          const now = new Date().toTimeString().slice(0, 8);
          setCount("Sessions today", String(todays.length));
          setCount("Upcoming", String(dash.upcomingSessions));
          setCount(
            "Live now",
            String(
              todays.filter((x) => x.startTime <= now && now < x.endTime)
                .length,
            ),
          );
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load schedules.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      } else if (pathname === "/instructor/schedule") {
        setLoading(true);
        try {
          const [rows, weekRows] = await Promise.all([
            getStaffSchedule(rangeFor(period), signal),
            getStaffSchedule(rangeFor("This week"), signal),
          ]);
          if (signal.aborted) return;
          const dur = (a: string, b: string) => {
            const [h1, m1] = a.split(":").map(Number),
              [h2, m2] = b.split(":").map(Number);
            const mins = h2 * 60 + m2 - (h1 * 60 + m1);
            return mins > 0 ? `${mins} min` : "—";
          };
          setLiveRows(
            rows.map((r) => [
              `${r.date} ${r.startTime.slice(0, 5)}–${r.endTime.slice(0, 5)}`,
              r.courseTitle,
              "—",
              dur(r.startTime, r.endTime),
              r.roomDetails || "—",
            ]),
          );
          const t = iso(new Date()),
            nowT = new Date().toTimeString().slice(0, 8);
          setCount(
            "Today",
            String(weekRows.filter((r) => r.date === t).length),
          );
          setCount("This week", String(weekRows.length));
          setCount(
            "Completed",
            String(
              rows.filter(
                (r) => r.date < t || (r.date === t && r.endTime <= nowT),
              ).length,
            ),
          );
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load schedule.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      } else if (
        pathname === "/instructor/students" ||
        pathname === "/instructor/courses"
      ) {
        setLoading(true);
        try {
          const [students, sessions] = await Promise.all([
            getStaffStudents(undefined, signal),
            getStaffSchedule(undefined, signal).catch(() => []),
          ]);
          if (signal.aborted) return;
          const t = iso(new Date());
          if (pathname === "/instructor/students") {
            const sched = new Map(
              sessions.map((x) => [x.scheduleId, x.batchCode]),
            );
            setLiveRows(
              students.map((r) => [
                `${r.name} (${r.email})`,
                r.courseTitle || "—",
                (r.scheduleId != null && sched.get(r.scheduleId)) || "—",
                new Date(r.enrolledAt).toLocaleDateString(),
                String(r.status).replaceAll("_", " "),
              ]),
            );
            setCount(
              "Students",
              String(new Set(students.map((r) => r.id)).size),
            );
            setCount(
              "Active enrollments",
              String(
                students.filter((r) =>
                  ["active", "enrolled"].includes(
                    String(r.status).toLowerCase(),
                  ),
                ).length,
              ),
            );
            setCount(
              "Courses",
              String(new Set(students.map((r) => r.courseTitle)).size),
            );
          } else {
            const groups = new Map<
              string,
              {
                course: string;
                batch: string;
                students: Set<number>;
                next: string;
              }
            >();
            sessions.forEach((x) => {
              const g = groups.get(String(x.scheduleId)) ?? {
                course: x.courseTitle,
                batch: x.batchCode || "—",
                students: new Set<number>(),
                next: "",
              };
              if (x.date >= t && (!g.next || x.date < g.next)) g.next = x.date;
              groups.set(String(x.scheduleId), g);
            });
            students.forEach((x) => {
              if (x.scheduleId == null) return;
              const g = groups.get(String(x.scheduleId)) ?? {
                course: x.courseTitle,
                batch: "—",
                students: new Set<number>(),
                next: "",
              };
              g.students.add(x.id);
              groups.set(String(x.scheduleId), g);
            });
            const list = Array.from(groups.values());
            setLiveRows(
              list.map((g) => [
                g.course,
                g.batch,
                String(g.students.size),
                g.next || "—",
                g.next ? "Upcoming" : "No upcoming sessions",
              ]),
            );
            setCount(
              "Courses",
              String(new Set(list.map((g) => g.course)).size),
            );
            setCount("Batches", String(list.length));
            setCount(
              "Students",
              String(new Set(students.map((r) => r.id)).size),
            );
          }
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load your records.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      } else if (pathname === "/instructor/assignments") {
        setLoading(true);
        try {
          const [rows, sessions, students] = await Promise.all([
            getStaffAssignments(signal),
            getStaffSchedule(undefined, signal).catch(() => []),
            getStaffStudents(undefined, signal).catch(() => []),
          ]);
          if (signal.aborted) return;
          setAssignmentsList(rows);
          const opts = new Map<number, string>();
          students.forEach((x) => {
            if (x.scheduleId != null) opts.set(x.scheduleId, x.courseTitle);
          });
          rows.forEach((x) => opts.set(x.scheduleId, x.courseTitle));
          sessions.forEach((x) =>
            opts.set(x.scheduleId, `${x.courseTitle} · ${x.batchCode}`),
          );
          setScheduleOptions(
            Array.from(opts, ([id, label]) => ({
              id,
              label: `${label} (#${id})`,
            })),
          );
          setLiveRows(
            rows.map((r) => [
              r.title,
              r.courseTitle,
              new Date(r.dueDate).toLocaleString(),
              String(r.submissions),
              new Date(r.dueDate) < new Date() ? "Past due" : "Open",
            ]),
          );
          setCount("Assignments", String(rows.length));
          setCount(
            "To grade",
            String(rows.reduce((sum, r) => sum + r.submissions, 0)),
          );
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load assignments.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      } else if (
        pathname === "/admin/compensation" ||
        pathname === "/instructor/earnings"
      ) {
        setLoading(true);
        try {
          const rows = await getStaffPayouts(signal);
          if (signal.aborted) return;
          const payoutRows = rows.map((r) =>
            pathname === "/instructor/earnings"
              ? [
                  new Date(r.createdAt).toLocaleDateString(),
                  r.scheduleId ? `Schedule #${r.scheduleId}` : r.notes || "—",
                  "—",
                  `${r.amount} ${r.currency}`,
                  String(r.status),
                ]
              : [
                  r.instructorName,
                  new Date(r.createdAt).toLocaleDateString(),
                  r.scheduleId ? `Schedule #${r.scheduleId}` : "—",
                  `${r.amount} ${r.currency}`,
                  String(r.status),
                ],
          );
          payoutRows.forEach((row, i) => payoutByRow.current.set(row, rows[i]));
          setLiveRows(payoutRows);
          const cur = rows[0]?.currency ?? "EGP";
          const money = (n: number) => `${n.toLocaleString("en-US")} ${cur}`;
          const sum = (list: StaffPayoutDto[]) =>
            list.reduce((a, r) => a + r.amount, 0);
          const sameMonth = (iso: string | null) => {
            if (!iso) return false;
            const d = new Date(iso),
              n = new Date();
            return (
              d.getFullYear() === n.getFullYear() &&
              d.getMonth() === n.getMonth()
            );
          };
          const pending = rows.filter((r) => String(r.status) === "Pending");
          const paid = rows.filter((r) => String(r.status) === "Paid");
          setCount("Pending payout", money(sum(pending)));
          setCount(
            "Paid this month",
            money(sum(paid.filter((r) => sameMonth(r.paidAt)))),
          );
          setCount("Recent transactions", String(rows.length));
          setCount(
            "This month",
            money(sum(rows.filter((r) => sameMonth(r.createdAt)))),
          );
          setCount("Pending", money(sum(pending)));
          setCount("Paid", money(sum(paid)));
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load payouts.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      } else if (pathname === "/admin/permissions") {
        setLoading(true);
        try {
          const roles: AdminRole[] = await getRoles(signal);
          if (signal.aborted) return;
          setRoleMatrix(roles);
          setLiveRows(
            roles.map((r) => [
              r.name,
              r.permissions.length
                ? `${r.permissions.length} permissions`
                : "No permissions",
              r.permissions.includes("payments.view") ? "Yes" : "No",
              r.permissions.some((p) =>
                p.toLowerCase().includes("users.manage"),
              )
                ? "Yes"
                : "No",
              "Configured",
            ]),
          );
          setCount("Roles", String(roles.length));
          setCount(
            "Permissions",
            String(new Set(roles.flatMap((r) => r.permissions)).size),
          );
        } catch (e) {
          if (!signal.aborted)
            setLoadError(
              e instanceof Error ? e.message : "Could not load roles.",
            );
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [pathname, reloadKey, period]);
  useEffect(() => {
    if (pathname !== "/admin/reports") return;
    const controller = new AbortController();
    const loadReports = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const range = rangeFor(period);
        const result = await getAdminReports(
          {
            from: range?.from,
            to: range?.to,
            search: reportSearch || undefined,
          },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setLiveStats((prev) =>
          prev.map((item) =>
            item.label === "Student growth"
              ? { ...item, value: String(result.studentGrowth) }
              : item.label === "Sessions delivered"
                ? { ...item, value: String(result.sessionsDelivered) }
                : item.label === "Revenue"
                  ? { ...item, value: result.revenue }
                  : { ...item },
          ),
        );
        setLiveRows(
          result.records.map((r) => [
            r.report,
            r.period,
            new Date(r.updated).toLocaleString(),
            r.status,
          ]),
        );
      } catch (e) {
        if (!controller.signal.aborted)
          setLoadError(
            e instanceof Error ? e.message : "Could not load reports.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadReports();
    return () => controller.abort();
  }, [pathname, reloadKey, period, reportSearch]);
  const filteredRows = useMemo(
    () =>
      liveRows.filter(
        (r) =>
          r.join(" ").toLowerCase().includes(query.toLowerCase()) &&
          (!pendingOnly ||
            !canReviewPayouts ||
            String(payoutByRow.current.get(r)?.status) === "Pending") &&
          (!monthOnly ||
            (() => {
              const c = payoutByRow.current.get(r)?.createdAt;
              if (!c) return true;
              const d = new Date(c),
                n = new Date();
              return (
                d.getFullYear() === n.getFullYear() &&
                d.getMonth() === n.getMonth()
              );
            })()),
      ),
    [liveRows, query, pendingOnly, canReviewPayouts, monthOnly],
  );
  function runAction(action: string) {
    setNotice("");
    if (action === "Add instructor") {
      setDialog("instructor");
      return;
    }
    if (action === "Add student") {
      setDialog("student");
      return;
    }
    if (action === "Schedule session") {
      setDialog("session");
      return;
    }
    if (action === "Review roles") {
      setDialog("roles");
      return;
    }
    if (action === "Review pending") {
      setPendingOnly((p) => !p);
      return;
    }
    if (action === "Today") {
      setPeriod("Today");
      return;
    }
    if (action === "Week") {
      setPeriod("This week");
      return;
    }
    if (action === "Month") {
      setPeriod("This month");
      return;
    }
    if (action === "Create assignment") {
      setDialog("assignment");
      return;
    }
    if (action === "Review submissions") {
      if (!assignmentsList.length) {
        setNotice("There are no assignments to review yet.");
        return;
      }
      setDialog("submissions");
      return;
    }
    if (action === "Current month") {
      setMonthOnly(true);
      setNotice("Showing this month's earnings.");
      return;
    }
    if (action === "Earnings history") {
      setMonthOnly(false);
      setNotice("Showing your full earnings history.");
      return;
    }
    if (pathname === "/admin/reports" && action === "Operational report") {
      setQuery("Operational report");
      return;
    }
    if (pathname === "/admin/reports" && action === "Financial report") {
      setQuery("Financial report");
      return;
    }
    if (action.startsWith("Export")) {
      if (!filteredRows.length) {
        setNotice("Nothing to export yet.");
        return;
      }
      downloadCsv(
        `${config.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`,
        [config.columns, ...filteredRows],
      );
      return;
    }
    setNotice(
      `${action} is not available yet: the backend has no endpoint for it.`,
    );
  }
  if (pathname === "/admin/courses") return <AdminCoursesManager />;
  const adminHeading = ADMIN_HEADINGS[pathname];
  const heading = adminHeading ?? { eyebrow: config.eyebrow, title: config.title, sub: config.subtitle };
  const permissionKeys = [...new Set(roleMatrix.flatMap((r) => r.permissions))].sort();
  const showMatrix = pathname === "/admin/permissions" && roleMatrix.length > 0;
  return (
    <div className="staff-dashboard staff-workspace-page">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">{heading.eyebrow}</div>
          <h1 className="staff-page_title">{heading.title}</h1>
          <p className="staff-page_sub">{heading.sub}</p>
        </div>
        <div className="staff-workspace-head-actions">
          <label className="staff-select-label">
            Period{" "}
            <Select
              className="staff-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {pathname === "/instructor/schedule" && (
                <option value="Today">Today</option>
              )}
              <option value="This week">This week</option>
              <option value="This month">This month</option>
              <option value="This year">This year</option>
              <option value="All time">All time</option>
            </Select>
          </label>
          {config.actions.slice(0, 1).map((a) => (
            <button
              className="staff-workspace-primary"
              key={a.id}
              onClick={() => runAction(a.label)}
            >
              {/^(Add|Create|Schedule|New)/.test(a.label) && <span className="material-symbols-outlined">add</span>}
              {a.label === "Review pending" && pendingOnly ? "Show all payouts" : a.label}
            </button>
          ))}
        </div>
      </header>
      <section className="staff-workspace-stats">
        {liveStats.map((s) => (
          <article className="staff-workspace-stat" key={s.label}>
            <span className="material-symbols-outlined">{s.icon}</span>
            <small>{s.label}</small>
            <strong>{s.value}</strong>
            <em>{s.value === "—" ? "Not available yet" : "Live data"}</em>
          </article>
        ))}
      </section>
      <section className="staff-card staff-workspace-table-card">
        <div className="staff-card_head">
          <div>
            <h2>{adminHeading ? adminHeading.title : `${config.title} register`}</h2>
            <p className="staff-page_sub">
              {adminHeading
                ? `${filteredRows.length} record${filteredRows.length === 1 ? "" : "s"} in your academy`
                : "Search, review and manage the records available to your role."}
            </p>
          </div>
          <span className="material-symbols-outlined staff-workspace-card-icon">
            {config.icon}
          </span>
        </div>
        <div className="staff-toolbar">
          <input
            className="staff-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}...`}
            aria-label={`Search ${config.title}`}
          />
          <button
            className="staff-workspace-secondary"
            onClick={() => {
              setQuery("");
              setPeriod("This month");
              setPendingOnly(false);
              setMonthOnly(false);
            }}
          >
            Reset filters
          </button>
          {config.actions.slice(1).map((a) => (
            <button
              className="staff-workspace-secondary"
              key={a.id}
              onClick={() => runAction(a.label)}
            >
              {a.label}
            </button>
          ))}
        </div>
        {notice && (
          <p className="staff-workspace-notice" role="status">
            {notice}
          </p>
        )}
        {loadError && (
          <p className="staff-workspace-notice" role="alert">
            Could not load live data: {loadError}
          </p>
        )}
        {loading && (
          <p className="staff-workspace-notice" role="status">
            Loading live records…
          </p>
        )}
        {showMatrix && (
          <div className="staff-table-wrap staff-matrix">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Permission key</th>
                  {roleMatrix.map((r) => (
                    <th key={r.roleId} className="staff-matrix_role">{r.name.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionKeys.map((key) => (
                  <tr key={key}>
                    <td>{key}</td>
                    {roleMatrix.map((r) => {
                      const on = r.permissions.includes(key);
                      return (
                        <td key={r.roleId} className="staff-matrix_cell">
                          <span
                            className={`staff-switch${on ? " is-on" : ""}`}
                            role="img"
                            aria-label={`${r.name}: ${key} ${on ? "allowed" : "not allowed"}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="staff-table-wrap" hidden={showMatrix}>
          <table className="staff-table">
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                {canReviewPayouts && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length ? (
                filteredRows.map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, j) => (
                      <td key={j}>
                        {config.columns[j] === "Status" && cell && cell !== "—" ? (
                          <span className={`staff-pill${POSITIVE.test(cell) ? "" : " staff-pill--off"}`}>{cell}</span>
                        ) : j === 0 && PEOPLE_PAGES.includes(pathname) ? (
                          <span className="staff-person">
                            <span className="staff-avatar staff-avatar--sm staff-avatar--square">{initials(cell)}</span>
                            <strong>{cell}</strong>
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                    {canReviewPayouts && (
                      <td>
                        {(() => {
                          const p = payoutByRow.current.get(r);
                          if (!p) return null;
                          const done = String(p.status) !== "Pending";
                          return done ? (
                            "—"
                          ) : (
                            <span className="staff-row-actions">
                              <button
                                className="staff-workspace-secondary"
                                disabled={busyPayout === p.id}
                                onClick={() => void changePayout(p, "Paid")}
                              >
                                Mark paid
                              </button>
                              <button
                                className="staff-workspace-secondary"
                                disabled={busyPayout === p.id}
                                onClick={() =>
                                  void changePayout(p, "Cancelled")
                                }
                              >
                                Cancel
                              </button>
                            </span>
                          );
                        })()}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={config.columns.length + (canReviewPayouts ? 1 : 0)}
                  >
                    <div className="staff-workspace-empty">
                      <span className="material-symbols-outlined">
                        {config.icon}
                      </span>
                      <strong>
                        {query
                          ? "No matching records"
                          : loading
                            ? "Loading records…"
                            : "No records to display yet"}
                      </strong>
                      <p>
                        {query
                          ? "Try another search term."
                          : loadError
                            ? "Check the API and your permissions, then retry."
                            : config.note}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="staff-workspace-foot">
          <span>Showing {filteredRows.length} records</span>
          <span>Period: {period}</span>
        </div>
      </section>
      {dialog === "instructor" && (
        <AddPersonDialog
          kind="instructor"
          onClose={() => setDialog(null)}
          onDone={dialogDone}
        />
      )}
      {dialog === "student" && (
        <AddPersonDialog
          kind="student"
          onClose={() => setDialog(null)}
          onDone={dialogDone}
        />
      )}
      {dialog === "session" && (
        <ScheduleSessionDialog
          schedules={schedules}
          onClose={() => setDialog(null)}
          onDone={dialogDone}
        />
      )}
      {dialog === "roles" && (
        <ReviewRolesDialog
          onClose={() => setDialog(null)}
          onDone={dialogDone}
        />
      )}
      {dialog === "assignment" && (
        <CreateAssignmentDialog
          schedules={scheduleOptions}
          onClose={() => setDialog(null)}
          onDone={dialogDone}
        />
      )}
      {dialog === "submissions" && (
        <ReviewSubmissionsDialog
          assignments={assignmentsList}
          onClose={() => {
            setDialog(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
