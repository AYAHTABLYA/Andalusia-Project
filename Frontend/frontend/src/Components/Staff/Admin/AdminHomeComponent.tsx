import { useEffect, useState } from "react";
import { apiGet } from "../../../apis/academyApi";
import { getUsers } from "../../../apis/adminApi";
import { getStaffDashboard, getStaffSchedule, type StaffDashboardDto, type StaffSessionDto } from "../../../apis/staffApi";
import type { Paginated } from "../../../Types/Paginated";
import type { CourseListItemDto } from "../../../Types/AcademyApi";
import { getStoredUser } from "../../../utils/session";
import OverviewView, { type SessionRow, type Stat } from "../Shared/OverviewView";
import "../style.css";

const TZ = "Africa/Cairo";
const todayIso = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ });
const nowHm = () => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date());

// Admin overview (AHA design): greeting, 4 live stat cards, today's schedule, recent activity.
// Data loading is unchanged; only the presentation moved to the shared OverviewView.
function AdminHomeComponent() {
  const user = getStoredUser();
  const [liveCounts, setLiveCounts] = useState({ students: "—", instructors: "—", courses: "—" });
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [countsError, setCountsError] = useState("");
  const [opsSessions, setOpsSessions] = useState<StaffSessionDto[]>([]);
  const [staffStats, setStaffStats] = useState<StaffDashboardDto | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getUsers({ role: "Learner", page: 1, pageSize: 1 }, controller.signal),
      getUsers({ role: "Instructor", page: 1, pageSize: 1 }, controller.signal),
      apiGet<Paginated<CourseListItemDto>>("/api/courses", { page: 1, pageSize: 1 }, controller.signal),
      getStaffDashboard(controller.signal),
      getStaffSchedule(undefined, controller.signal),
    ]).then(([students, instructors, courses, stats, sessions]) => {
      if (controller.signal.aborted) return;
      setLiveCounts({ students: String(students.count), instructors: String(instructors.count), courses: String(courses.count) });
      setStaffStats(stats);
      setOpsSessions(sessions.filter(session => session.date === new Date().toISOString().slice(0, 10)).slice(0, 5));
      setCountsError("");
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setCountsError(error instanceof Error ? error.message : "Could not load overview data.");
    }).finally(() => { if (!controller.signal.aborted) setLoadingCounts(false); });
    return () => controller.abort();
  }, []);

  const stats: Stat[] = [
    { label: "Active students", value: liveCounts.students, icon: "groups" },
    { label: "Active instructors", value: liveCounts.instructors, icon: "school" },
    { label: "Courses running", value: liveCounts.courses, icon: "menu_book" },
    { label: "Upcoming sessions", value: staffStats ? staffStats.upcomingSessions : "—", icon: "calendar_month" },
  ];

  const hm = nowHm();
  const sessions: SessionRow[] = opsSessions.map(s => ({
    id: s.id,
    time: s.startTime.slice(0, 5),
    date: s.date,
    title: s.courseTitle || s.title,
    meta: [s.batchCode, s.roomDetails].filter(Boolean).join(" · ") || undefined,
    live: s.startTime.slice(0, 5) <= hm && hm < s.endTime.slice(0, 5),
  }));

  return <>
    {countsError && <p className="staff-workspace-notice" role="status">Some overview figures could not be loaded: {countsError}</p>}
    <OverviewView
      name={user?.name ?? ""}
      subtitle="Here's what's happening across your academy today."
      stats={stats}
      sessions={sessions}
      activity={[]}
      scheduleLink="/admin/schedule"
      loading={loadingCounts}
    />
  </>;
}
export default AdminHomeComponent;
