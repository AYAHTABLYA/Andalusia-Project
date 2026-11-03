import { useEffect, useState } from "react";
import { apiGet } from "../../../apis/academyApi";
import { getUsers } from "../../../apis/adminApi";
import {
  getStaffAssignments, getStaffDashboard, getStaffPayouts, getStaffSchedule,
  type StaffAssignmentDto, type StaffDashboardDto, type StaffPayoutDto, type StaffSessionDto,
} from "../../../apis/staffApi";
import type { Paginated } from "../../../Types/Paginated";
import type { CourseListItemDto } from "../../../Types/AcademyApi";
import { getStoredUser } from "../../../utils/session";
import OverviewView, { type Stat } from "../Shared/OverviewView";
import { payoutSegments, settle, submissionBars, toActivityRows, toSessionRows, weekBars } from "../Shared/overviewData";
import { BarChart, ChartCard, DonutChart } from "../../Charts/Charts";
import Constellation, { type SceneNode } from "../../Shared/Constellation/Constellation";
import { resolveAssetUrl } from "../../../utils/format";
import { cairoDate, cairoWeek } from "../time";
import "../style.css";

// Admin overview (AHA design): greeting, 4 live stat cards, today's schedule, recent activity.
// Every request is independent: if one fails the others still render, and the notice says which one failed.
function AdminHomeComponent() {
  const user = getStoredUser();
  const [counts, setCounts] = useState<{ students?: number; instructors?: number; courses?: number }>({});
  const [stats, setStats] = useState<StaffDashboardDto | null>(null);
  const [week, setWeek] = useState<StaffSessionDto[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignmentDto[]>([]);
  const [payouts, setPayouts] = useState<StaffPayoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const days = cairoWeek();
    Promise.allSettled([
      getUsers({ role: "Learner", page: 1, pageSize: 1 }, signal),
      getUsers({ role: "Instructor", page: 1, pageSize: 1 }, signal),
      apiGet<Paginated<CourseListItemDto>>("/api/courses", { page: 1, pageSize: 1 }, signal),
      getStaffDashboard(signal),
      getStaffSchedule({ from: days[0], to: days[6] }, signal),
      getStaffAssignments(signal),
      getStaffPayouts(signal),
    ]).then(([students, instructors, courses, dash, sessions, assigns, pays]) => {
      if (signal.aborted) return;
      const bad: string[] = [];
      const s = settle(students, "students", bad);
      const i = settle(instructors, "instructors", bad);
      const c = settle(courses, "courses", bad);
      setCounts({ students: s?.count, instructors: i?.count, courses: c?.count });
      setStats(settle(dash, "summary figures", bad));
      setWeek(settle(sessions, "schedule", bad) ?? []);
      setAssignments(settle(assigns, "recent activity", bad) ?? []);
      setPayouts(settle(pays, "payouts", bad) ?? []);
      setFailed(bad);
      setLoading(false);
    });
    return () => controller.abort();
  }, []);

  const today = week.filter((s) => s.date.slice(0, 10) === cairoDate());
  const paid = payoutSegments(payouts);
  const submissions = submissionBars(assignments);

  // Prefer the user-directory counts; fall back to the staff summary when that request failed.
  const cards: Stat[] = [
    { label: "Students", value: counts.students ?? stats?.totalStudents, icon: "groups" },
    { label: "Instructors", value: counts.instructors ?? stats?.totalInstructors, icon: "school" },
    { label: "Courses", value: stats?.totalCourses ?? counts.courses, icon: "menu_book" },
    { label: "Upcoming sessions", value: stats?.upcomingSessions, icon: "calendar_month", note: `${week.length} this week` },
  ];

  const sceneNodes: SceneNode[] = [
    { id: "students", label: "Students", value: cards[0].value, satellites: cards[0].value as number | undefined, to: "/admin/students" },
    { id: "instructors", label: "Instructors", value: cards[1].value, satellites: cards[1].value as number | undefined, to: "/admin/instructors" },
    { id: "courses", label: "Courses", value: cards[2].value, satellites: cards[2].value as number | undefined, to: "/admin/courses" },
    { id: "sessions", label: "Upcoming sessions", value: cards[3].value, satellites: cards[3].value as number | undefined, to: "/admin/schedule" },
  ]
    .filter((n) => n.value !== undefined)
    .map((n, _i, all) => {
      const max = Math.max(1, ...all.map((x) => Number(x.value) || 0));
      return { ...n, weight: Math.max(0.3, Math.sqrt((Number(n.value) || 0) / max)) };
    });
  const scene = (
    <Constellation
      title="Your academy at a glance"
      subtitle="Drag to rotate. Select a node to open it."
      centerLabel="Academy"
      nodes={sceneNodes}
      loading={loading}
      empty="Figures will appear here once the API responds."
      footnote="Dot clouds are scaled to the totals."
    />
  );

  const charts = (
    <>
      <ChartCard title="Sessions this week" subtitle="Per day, Cairo time" empty={!loading && week.length === 0 ? "No sessions scheduled this week." : undefined}>
        <BarChart data={weekBars(week)} ariaLabel="Sessions per weekday this week" />
      </ChartCard>
      <ChartCard title="Assignment submissions" subtitle="Busiest assignments" empty={!loading && submissions.length === 0 ? "No submissions yet." : undefined}>
        <BarChart data={submissions} ariaLabel="Submissions per assignment" />
      </ChartCard>
      <ChartCard title="Instructor payouts" subtitle="By status" empty={!loading && payouts.length === 0 ? "No payouts recorded." : undefined}>
        <DonutChart segments={paid} centerValue={payouts.length} centerLabel="payouts" ariaLabel="Payouts by status" />
      </ChartCard>
    </>
  );

  return (
    <>
      {failed.length > 0 && (
        <p className="staff-workspace-notice" role="alert">
          Some overview figures could not be loaded ({failed.join(", ")}). Check that the API is running and that your role has access.
        </p>
      )}
      <OverviewView
        name={user?.name ?? ""}
        email={user?.email}
        role={user?.role ?? "Admin"}
        photoUrl={resolveAssetUrl(user?.photoUrl)}
        workspace="ADMIN WORKSPACE"
        tiles={[
          { label: "Pending assignments", value: stats?.pendingAssignments },
          { label: "Pending payouts", value: stats?.pendingPayouts },
        ]}
        scene={scene}
        actions={[
          { label: "Manage students", to: "/admin/students", icon: "groups" },
          { label: "Manage courses", to: "/admin/courses", icon: "menu_book" },
          { label: "Open schedule", to: "/admin/schedule", icon: "calendar_month", primary: true },
        ]}
        charts={charts}
        subtitle="Here's what's happening across your academy today."
        stats={cards}
        sessions={toSessionRows(today)}
        activity={toActivityRows(assignments, payouts)}
        scheduleLink="/admin/schedule"
        loading={loading}
      />
    </>
  );
}
export default AdminHomeComponent;
