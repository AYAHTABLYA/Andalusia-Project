import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../../apis/academyApi";
import { getUsers } from "../../../apis/adminApi";
import { getStaffDashboard, getStaffSchedule, type StaffDashboardDto, type StaffSessionDto } from "../../../apis/staffApi";
import type { Paginated } from "../../../Types/Paginated";
import type { CourseListItemDto } from "../../../Types/AcademyApi";
import { getStoredUser } from "../../../utils/session";
import "../style.css";

const today = () => new Intl.DateTimeFormat("en-US", {
  weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Cairo"
}).format(new Date());

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
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const actions = [
    { icon: "manage_accounts", title: "Users & roles", detail: "Manage accounts and access", to: "/admin/users", tone: "tone-blue" },
    { icon: "calendar_month", title: "Schedule overview", detail: "Review teaching operations", to: "/admin/schedule", tone: "tone-green" },
    { icon: "school", title: "Instructor management", detail: "Review teaching team", to: "/admin/instructors", tone: "tone-sand" },
    { icon: "analytics", title: "Reports & activity", detail: "Monitor platform operations", to: "/admin/reports", tone: "tone-lavender" },
  ];
  const metrics = [
    { icon: "groups", label: "Students", value: liveCounts.students, note: loadingCounts ? "Loading live data…" : "From academy user records", tone: "tone-blue" },
    { icon: "school", label: "Instructors", value: liveCounts.instructors, note: loadingCounts ? "Loading live data…" : "From academy user records", tone: "tone-sand" },
    { icon: "menu_book", label: "Courses", value: liveCounts.courses, note: loadingCounts ? "Loading live data…" : "From course catalog", tone: "tone-green" },
    { icon: "calendar_month", label: "Upcoming sessions", value: staffStats ? String(staffStats.upcomingSessions) : "—", note: "From staff schedule records", tone: "tone-lavender" },
  ];
  return <div className="instructor-dashboard admin-dashboard">
    <section className="instructor-welcome admin-welcome">
      <div className="instructor-welcome_copy">
        <span className="instructor-kicker">AHA ACADEMY · ADMINISTRATION</span>
        <h1>Good day, {firstName} <span className="staff-spark">✷</span></h1>
        <p>Your academy at a glance. Review activity, manage access, and keep teaching operations moving.</p>
        <Link to="/admin/users" className="instructor-primary-action"><span className="material-symbols-outlined">manage_accounts</span> Manage users</Link>
      </div>
      <div className="instructor-welcome_art" aria-hidden="true"><span className="instructor-art-ring"/><span className="material-symbols-outlined">space_dashboard</span><i className="instructor-art-dot instructor-art-dot--one"/><i className="instructor-art-dot instructor-art-dot--two"/></div>
    </section>
    <div className="instructor-section-heading"><h2>Academy overview</h2><span className="instructor-date">{today()}</span></div>
    <section className="instructor-metrics admin-metrics">
      {metrics.map(m => <article className="instructor-metric" key={m.label}>
        <span className={`instructor-metric_icon ${m.tone} material-symbols-outlined`}>{m.icon}</span>
        <span className="instructor-metric_label">{m.label}</span><strong>{m.value}</strong><small>{m.note}</small>
      </article>)}
    </section>
    {countsError && <p className="staff-workspace-notice" role="status">Some overview figures could not be loaded: {countsError}</p>}
    <div className="instructor-main-grid admin-main-grid">
      <section className="instructor-panel">
        <div className="instructor-panel_header"><div><h2>Today's operations</h2><p>Sessions and activity across the academy</p></div><span className="material-symbols-outlined">event_note</span></div>
        {opsSessions.length ? <div className="instructor-tools-list">{opsSessions.map(session => <div className="instructor-tool" key={session.id}><span className="instructor-tool_icon tone-green material-symbols-outlined">event</span><span className="instructor-tool_copy"><strong>{session.title || session.courseTitle}</strong><small>{session.courseTitle} · {session.startTime}–{session.endTime} · {session.roomDetails || "Room not specified"}</small></span></div>)}</div> : <div className="instructor-empty-state"><span className="instructor-empty-icon material-symbols-outlined">calendar_month</span><strong>No sessions scheduled for today</strong><p>Today's operations are loaded from the academy session records.</p></div>}
      </section>
      <section className="instructor-panel">
        <div className="instructor-panel_header"><div><h2>Quick access</h2><p>Common administration tasks</p></div></div>
        <div className="instructor-tools-list">{actions.map(a => <Link className="instructor-tool" to={a.to} key={a.title}>
          <span className={`instructor-tool_icon ${a.tone} material-symbols-outlined`}>{a.icon}</span><span className="instructor-tool_copy"><strong>{a.title}</strong><small>{a.detail}</small></span><span className="instructor-tool_arrow material-symbols-outlined">arrow_forward</span>
        </Link>)}</div>
      </section>
    </div>
    <div className="instructor-bottom-grid">
      <section className="instructor-panel"><div className="instructor-panel_header"><div><h2>Recent activity</h2><p>Latest changes and events</p></div><span className="material-symbols-outlined">history</span></div><div className="instructor-inline-empty"><span className="material-symbols-outlined">history</span><span><strong>No recent activity to show</strong><small>Activity will appear when the relevant backend feed is available.</small></span></div></section>
      <section className="instructor-panel"><div className="instructor-panel_header"><div><h2>Items needing attention</h2><p>Operational follow-up</p></div><span className="material-symbols-outlined">task_alt</span></div><div className="instructor-inline-empty"><span className="material-symbols-outlined">check_circle</span><span><strong>No attention items loaded</strong><small>Pending approvals and exceptions will appear here when connected.</small></span></div></section>
    </div>
  </div>;
}
export default AdminHomeComponent;
