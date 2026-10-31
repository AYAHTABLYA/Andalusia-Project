import { useEffect, useState } from "react";
import { getStaffAssignments, getStaffDashboard, getStaffSchedule } from "../../../apis/staffApi";
import type { StaffAssignmentDto, StaffDashboardDto, StaffSessionDto } from "../../../apis/staffApi";
import { getStoredUser } from "../../../utils/session";
import OverviewView from "../Shared/OverviewView";
import type { Stat } from "../Shared/OverviewView";
import { settle, submissionBars, toActivityRows, toSessionRows, weekBars } from "../Shared/overviewData";
import { BarChart, ChartCard } from "../../Charts/Charts";
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
