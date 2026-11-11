import { useEffect, useState } from "react";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import OverviewComponent from "./OverviewComponent";
import type { ActivityRow, SessionRow, Stat } from "../../Staff/Shared/OverviewView";
import type { BarDatum, Segment } from "../../Charts/Charts";
import type { SceneNode } from "../../Shared/Constellation/Constellation";
import { fmtDate, fmtTime, sessionStatus } from "./helpers";

const MAX_SESSIONS = 5;
const MAX_MATERIALS = 5;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Student overview. Every figure comes from the learner API data loaded by WorkspaceLayoutContainer
// (enrollments -> progress / sessions / assignments / materials / attendance); nothing is invented here.
function OverviewContainer() {
  const { workspace, userName, email, photoUrl } = useWorkspace();
  const now = useClock();
  const nowMs = now.getTime();
  const { stats, sessions, courses, materials, assignments, loading } = workspace;

  // ---- sessions: everything that has not finished yet, soonest first ----
  const upcomingAll = sessions.filter((s) => sessionStatus(s, nowMs) !== "Completed");
  const sessionRows: SessionRow[] = upcomingAll.slice(0, MAX_SESSIONS).map((s) => ({
    id: s.id,
    time: fmtTime(s.start),
    date: fmtDate(s.start),
    title: s.courseTitle,
    meta: [s.title !== s.courseTitle ? s.title : "", s.group].filter(Boolean).join(" · ") || undefined,
    person: s.instructor || undefined,
    students: s.students ?? undefined,
    live: sessionStatus(s, nowMs) === "Live",
    joinUrl: s.zoomUrl,
  }));

  const liveCount = upcomingAll.filter((s) => sessionStatus(s, nowMs) === "Live").length;
  const today = fmtDate(now.toISOString());
  const leftToday = upcomingAll.filter((s) => fmtDate(s.start) === today).length;
  const next = upcomingAll[0];
  const pulse = liveCount
    ? `${plural(liveCount, "live session")} right now`
    : leftToday
      ? `${plural(leftToday, "session")} still to go today`
      : next
        ? `Next session ${fmtDate(next.start)} at ${fmtTime(next.start)}`
        : "No upcoming sessions";

  // ---- charts / scene ----
  const courseBars: BarDatum[] = courses.map((c) => ({ label: c.title, value: c.progress }));
  const assignmentSegments: Segment[] = (["Pending", "Submitted", "Graded"] as const).map((status) => ({
    label: status,
    value: assignments.filter((a) => a.status === status).length,
  }));
  const attendanceSegments: Segment[] = (["Present", "Late", "Absent", "Excused"] as const).map((status) => ({
    label: status,
    value: sessions.filter((s) => s.attendance === status).length,
  }));
  const sceneNodes: SceneNode[] = courses.map((c) => ({
    id: String(c.id),
    label: c.title,
    value: `${c.progress}%`,
    progress: c.progress,
    weight: 0.4 + c.progress / 170,
    satellites: sessions.filter((s) => s.courseId === c.id).length,
    to: "/workspace/courses",
  }));

  // ---- stat cards (bars only where a real ratio exists) ----
  const marked = attendanceSegments.filter((s) => s.label !== "Excused").reduce((n, s) => n + s.value, 0);
  const attendanceRate = marked > 0 ? Math.round((stats.sessionsAttended / marked) * 100) : undefined;
  const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : undefined);
  const hours = Math.round(stats.learningHours * 10) / 10;

  const cards: Stat[] = [
    { label: "Course progress", value: `${stats.courseProgress}%`, icon: "trending_up", note: "Across active courses", pct: stats.courseProgress },
    {
      label: "Sessions attended", value: stats.sessionsAttended, icon: "how_to_reg", note: `${stats.sessionsThisWeek} this week`,
      hint: attendanceRate !== undefined ? `${attendanceRate}% attendance` : undefined, pct: attendanceRate,
    },
    {
      label: "Assignments due", value: stats.assignmentsDue, icon: "assignment",
      note: stats.assignmentsDue ? "Needs your attention" : "All caught up",
      pct: pct(assignments.length - stats.assignmentsDue, assignments.length),
    },
    { label: "Learning hours", value: `${hours}h`, icon: "schedule", note: "From attended sessions" },
  ];

  const materialRows: ActivityRow[] = materials.slice(0, MAX_MATERIALS).map((m) => ({
    id: m.id,
    who: m.title,
    text: m.courseTitle,
    when: m.addedAt ? fmtDate(m.addedAt) : "",
    icon: "description",
  }));

  return (
    <OverviewComponent
      loading={loading}
      hasCourses={courses.length > 0}
      name={userName}
      email={email}
      role="Student"
      photoUrl={photoUrl}
      tiles={[
        { label: "Active courses", value: courses.length },
        { label: "Assignments due", value: stats.assignmentsDue },
      ]}
      subtitle="Ready for your next learning moment?"
      pulse={pulse}
      stats={cards}
      sessions={sessionRows}
      upcomingCount={upcomingAll.length}
      materials={materialRows}
      actions={[
        { label: "My courses", to: "/workspace/courses", icon: "menu_book" },
        { label: "Materials", to: "/workspace/materials", icon: "folder_open" },
        { label: "Assignments", to: "/workspace/assignments", icon: "assignment", primary: true },
      ]}
      courseBars={courseBars}
      assignmentSegments={assignmentSegments}
      attendanceSegments={attendanceSegments}
      sceneNodes={sceneNodes}
      overall={Math.round(stats.courseProgress)}
    />
  );
}

export default OverviewContainer;
