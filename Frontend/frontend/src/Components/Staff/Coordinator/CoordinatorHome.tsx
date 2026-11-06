import { useEffect, useState } from "react";
import { getStaffAssignments, getStaffDashboard, getStaffSchedule } from "../../../apis/staffApi";
import type { StaffAssignmentDto, StaffDashboardDto, StaffSessionDto } from "../../../apis/staffApi";
import { getStoredUser, hasPermission } from "../../../utils/session";
import OverviewView from "../Shared/OverviewView";
import type { Stat } from "../Shared/OverviewView";
import { settle, submissionBars, toActivityRows, toSessionRows, weekBars } from "../Shared/overviewData";
import { BarChart, ChartCard } from "../../Charts/Charts";
import Constellation, { type SceneNode } from "../../Shared/Constellation/Constellation";
import { resolveAssetUrl } from "../../../utils/format";
import { cairoDate, cairoWeek } from "../time";
import "../style.css";

// Coordinator overview: people, courses, schedules, attendance. No finance / security figures on purpose.
// Requests are independent (allSettled): one forbidden/failed endpoint no longer blanks the whole page.
export default function CoordinatorHome() {
  const user = getStoredUser();
  const [stats, setStats] = useState<StaffDashboardDto | null>(null);
  const [week, setWeek] = useState<StaffSessionDto[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const days = cairoWeek();
    Promise.allSettled([getStaffDashboard(signal), getStaffSchedule({ from: days[0], to: days[6] }, signal), getStaffAssignments(signal)]).then(
      ([d, s, a]) => {
        if (signal.aborted) return;
        const bad: string[] = [];
        setStats(settle(d, "summary figures", bad));
        setWeek(settle(s, "schedule", bad) ?? []);
        setAssignments(settle(a, "recent activity", bad) ?? []);
        setFailed(bad);
        setLoading(false);
      },
    );
    return () => controller.abort();
  }, []);

  const today = week.filter((s) => s.date.slice(0, 10) === cairoDate());
  const submissions = submissionBars(assignments);

  const cards: Stat[] = [
    { label: "Students", value: stats?.totalStudents, icon: "groups" },
    { label: "Instructors", value: stats?.totalInstructors, icon: "school" },
    { label: "Course batches", value: stats?.totalSchedules, icon: "menu_book" },
    { label: "Upcoming sessions", value: stats?.upcomingSessions, icon: "calendar_month", note: `${week.length} this week` },
  ];

  // Nodes only link where this coordinator is allowed in (same permissions as the sidebar tabs).
  const allow = (to: string, ...codes: string[]) => (codes.some(hasPermission) ? to : undefined);
  const sceneNodes: SceneNode[] = [
    { id: "students", label: "Students", value: stats?.totalStudents, to: allow("/coordinator/students", "students.view") },
    { id: "instructors", label: "Instructors", value: stats?.totalInstructors, to: allow("/coordinator/instructors", "instructors.manage") },
    { id: "batches", label: "Course batches", value: stats?.totalSchedules, to: allow("/coordinator/courses", "enrollments.view", "enrollments.manage", "schedules.manage") },
    { id: "sessions", label: "Upcoming sessions", value: stats?.upcomingSessions, to: allow("/coordinator/schedule", "schedules.manage") },
  ]
    .filter((n) => n.value !== undefined)
    .map((n, _i, all) => {
      const max = Math.max(1, ...all.map((x) => Number(x.value) || 0));
      return { ...n, satellites: Number(n.value) || 0, weight: Math.max(0.3, Math.sqrt((Number(n.value) || 0) / max)) };
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
        role={user?.role ?? "Coordinator"}
        photoUrl={resolveAssetUrl(user?.photoUrl)}
        workspace="COORDINATOR WORKSPACE"
        tiles={[
          { label: "Pending assignments", value: stats?.pendingAssignments },
          { label: "Course batches", value: stats?.totalSchedules },
        ]}
        scene={scene}
        actions={[
          { label: "Students", to: "/coordinator/students", icon: "groups", ok: hasPermission("students.view") },
          { label: "Attendance", to: "/coordinator/attendance", icon: "fact_check", ok: hasPermission("attendance.manage") },
          { label: "Open schedule", to: "/coordinator/schedule", icon: "calendar_month", ok: hasPermission("schedules.manage"), primary: true },
        ].filter((a) => a.ok).map((a) => ({ label: a.label, to: a.to, icon: a.icon, primary: a.primary }))}
        charts={charts}
        subtitle="Here's what's happening across your academy today."
        stats={cards}
        sessions={toSessionRows(today)}
        activity={toActivityRows(assignments)}
        scheduleLink="/coordinator/schedule"
        loading={loading}
      />
    </>
  );
}
