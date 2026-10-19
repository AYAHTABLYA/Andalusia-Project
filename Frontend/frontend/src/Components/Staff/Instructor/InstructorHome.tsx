import { Link } from "react-router-dom";
import { getStoredUser } from "../../../utils/session";
import { getStaffDashboard, getStaffSchedule, getStaffAssignments, getStaffPayouts, type StaffDashboardDto, type StaffSessionDto, type StaffAssignmentDto, type StaffPayoutDto } from "../../../apis/staffApi";
import { useEffect, useState } from "react";
import "../style.css";

const today = () => new Intl.DateTimeFormat("en-US", {
  weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Cairo"
}).format(new Date());

function InstructorHome() {
  const user = getStoredUser();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const [stats, setStats] = useState<StaffDashboardDto | null>(null);
  const [sessions, setSessions] = useState<StaffSessionDto[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignmentDto[]>([]);
  const [payouts, setPayouts] = useState<StaffPayoutDto[]>([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getStaffDashboard(controller.signal), getStaffSchedule(undefined, controller.signal), getStaffAssignments(controller.signal), getStaffPayouts(controller.signal)])
      .then(([d, s, a, p]) => { if (controller.signal.aborted) return; setStats(d); setSessions(s); setAssignments(a); setPayouts(p); })
      .catch((e: unknown) => { if (!controller.signal.aborted) setLoadError(e instanceof Error ? e.message : "Could not load instructor data."); });
    return () => controller.abort();
  }, []);
  const metrics = [
    { icon: "groups", label: "My students", value: stats ? String(stats.totalStudents) : "—", note: "Assigned learners", tone: "tone-blue" },
    { icon: "menu_book", label: "My courses", value: stats ? String(stats.totalCourses) : "—", note: "Assigned courses", tone: "tone-sand" },
    { icon: "calendar_month", label: "Sessions this week", value: stats ? String(stats.upcomingSessions) : "—", note: "Upcoming teaching", tone: "tone-green" },
    { icon: "payments", label: "Pending payouts", value: String(payouts.filter(p => String(p.status).toLowerCase() === "pending" || p.status === 0).length), note: "Your payout records", tone: "tone-lavender" },
  ];
  const tools = [
    { icon: "calendar_month", title: "My schedule", detail: "Review upcoming classes and meeting details", to: "/instructor/schedule", tone: "tone-blue" },
    { icon: "assignment", title: "Assignments & grading", detail: "Prepare coursework and review submissions", to: "/instructor/assignments", tone: "tone-sand" },
    { icon: "forum", title: "Student messages", detail: "Keep course conversations in one place", to: "/instructor/messages", tone: "tone-green" },
    { icon: "event_available", title: "My availability", detail: "Set the hours you are available to teach", to: "/instructor/availability", tone: "tone-lavender" },
  ];
  return <div className="instructor-dashboard">
    <section className="instructor-welcome">
      <div className="instructor-welcome_copy">
        <span className="instructor-kicker">AHA ACADEMY · INSTRUCTOR WORKSPACE</span>
        <h1>Welcome back, {firstName} <span className="staff-spark">✷</span></h1>
        <p>Your teaching day, student progress, and follow-ups in one place. Here’s what’s happening with your classes.</p>
        <a href="#instructor-today" className="instructor-primary-action"><span className="material-symbols-outlined">calendar_today</span> View today’s classes</a>
      </div>
      <div className="instructor-welcome_art" aria-hidden="true"><span className="instructor-art-ring"/><span className="material-symbols-outlined">school</span><i className="instructor-art-dot instructor-art-dot--one"/><i className="instructor-art-dot instructor-art-dot--two"/></div>
    </section>
    {loadError && <p className="staff-workspace-notice" role="alert">Could not load live teaching data: {loadError}</p>}
    <div className="instructor-section-heading"><h2>Your teaching overview</h2><span className="instructor-date">{today()}</span></div>
    <section className="instructor-metrics">{metrics.map(m => <article className="instructor-metric" key={m.label}>
      <span className={`instructor-metric_icon ${m.tone} material-symbols-outlined`}>{m.icon}</span><span className="instructor-metric_label">{m.label}</span><strong>{m.value}</strong><small>{m.note}</small>
    </article>)}</section>
    <div className="instructor-main-grid">
      <section className="instructor-panel" id="instructor-today">
        <div className="instructor-panel_header"><div><h2>Today’s classes</h2><p>Your assigned sessions and classroom access</p></div><span className="material-symbols-outlined">event</span></div>
        {sessions.length ? <div className="instructor-tools-list">{sessions.slice(0, 5).map(session => <div className="instructor-tool" key={session.id}><span className="instructor-tool_icon tone-blue material-symbols-outlined">event</span><span className="instructor-tool_copy"><strong>{session.title || session.courseTitle}</strong><small>{session.date} · {session.startTime}–{session.endTime} · {session.courseTitle}</small></span></div>)}</div> : <div className="instructor-empty-state"><span className="instructor-empty-icon material-symbols-outlined">calendar_month</span><strong>No upcoming sessions</strong><p>Your assigned sessions will appear here when available.</p></div>}
      </section>
      <section className="instructor-panel">
        <div className="instructor-panel_header"><div><h2>Teaching tools</h2><p>Shortcuts for your day-to-day work</p></div></div>
        <div className="instructor-tools-list">{tools.map(t => <Link className="instructor-tool" to={t.to} key={t.title}><span className={`instructor-tool_icon ${t.tone} material-symbols-outlined`}>{t.icon}</span><span className="instructor-tool_copy"><strong>{t.title}</strong><small>{t.detail}</small></span><span className="instructor-tool_arrow material-symbols-outlined">arrow_forward</span></Link>)}</div>
      </section>
    </div>
    <div className="instructor-bottom-grid">
      <section className="instructor-panel"><div className="instructor-panel_header"><div><h2>Student progress</h2><p>Assigned learners who may need support</p></div><span className="material-symbols-outlined">trending_up</span></div><div className="instructor-inline-empty"><span className="material-symbols-outlined">groups</span><span><strong>No student progress loaded</strong><small>Progress will be based on your assigned students only.</small></span></div></section>
      <section className="instructor-panel"><div className="instructor-panel_header"><div><h2>Grading & open questions</h2><p>Work that may need your attention</p></div><span className="material-symbols-outlined">fact_check</span></div>{assignments.length ? <div className="instructor-tools-list">{assignments.slice(0, 4).map(a => <div className="instructor-tool" key={a.id}><span className="instructor-tool_icon tone-sand material-symbols-outlined">assignment</span><span className="instructor-tool_copy"><strong>{a.title}</strong><small>{a.courseTitle} · Due {new Date(a.dueDate).toLocaleDateString()} · {a.submissions} submissions</small></span></div>)}</div> : <div className="instructor-inline-empty"><span className="material-symbols-outlined">task_alt</span><span><strong>No assignments found</strong><small>Assignment records will appear here when assigned to your schedule.</small></span></div>}</section>
    </div>
    <section className="instructor-panel instructor-availability-note"><div className="instructor-panel_header"><div><h2>Manage your availability</h2><p>You own your teaching windows; coordinators use them when scheduling sessions.</p></div><span className="material-symbols-outlined">event_available</span></div><p className="instructor-availability-copy">Availability management is part of the AHA target workflow. Use the availability workspace to review and maintain your teaching windows.</p></section>
  </div>;
}
export default InstructorHome;
