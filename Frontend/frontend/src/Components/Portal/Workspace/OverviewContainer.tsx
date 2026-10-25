import { useEffect, useState } from "react";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import OverviewComponent, { type StatCard, type UpcomingItem, type UpdateItem } from "./OverviewComponent";
import { TZ, fmtTime, greeting, sessionStatus } from "./helpers";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function OverviewContainer() {
  const { workspace, userName } = useWorkspace();
  const now = useClock();
  const { stats, sessions, courses, loading } = workspace;

  const upcoming: UpcomingItem[] = sessions
    .map((session) => ({ session, live: sessionStatus(session, now.getTime()) === "Live" }))
    .filter(({ session }) => sessionStatus(session, now.getTime()) !== "Completed")
    .slice(0, 3);

  const updates: UpdateItem[] = sessions
    .flatMap((s) => s.comments)
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, 4);

  const cairoHour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: TZ }).format(now));
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(now);

  const cards: StatCard[] = [
    { label: "Course progress", value: `${stats.courseProgress}%`, note: "Across active courses", icon: "trending_up", pct: stats.courseProgress },
    { label: "Sessions attended", value: String(stats.sessionsAttended), note: `${stats.sessionsThisWeek} this week`, icon: "check", pct: Math.min(100, stats.sessionsAttended * 4) },
    { label: "Assignments due", value: String(stats.assignmentsDue), note: stats.assignmentsDue ? "Needs your attention" : "All caught up", icon: "assignment", pct: stats.assignmentsDue ? 50 : 100 },
    { label: "Learning hours", value: `${Math.round(stats.learningHours)}h`, note: "Since you started", icon: "schedule", pct: Math.min(100, stats.learningHours * 2) },
  ];

  return (
    <OverviewComponent
      loading={loading}
      hasCourses={courses.length > 0}
      greeting={`${greeting(cairoHour)}, ${userName.split(" ")[0]}`}
      weekday={weekday.toUpperCase()}
      clock={fmtTime(now.toISOString())}
      cards={cards}
      upcoming={upcoming}
      updates={updates}
    />
  );
}

export default OverviewContainer;
