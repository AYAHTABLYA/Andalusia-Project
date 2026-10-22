import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getStoredUser } from "../../../utils/session";
import {
  getStaffDashboard, getStaffSchedule, getStaffAssignments, getStaffPayouts, getStaffStudents,
  type StaffDashboardDto, type StaffSessionDto, type StaffAssignmentDto, type StaffPayoutDto, type StaffStudentDto,
} from "../../../apis/staffApi";
import "../style.css";

const TZ = "Africa/Cairo";
const iso = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const cairoHour = () => Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: TZ }).format(new Date())) % 24;
const greeting = () => { const h = cairoHour(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };
const dateLine = () => {
  const d = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: TZ }).format(d);
  const rest = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", timeZone: TZ }).format(d);
  return `${weekday} · ${rest}`.toUpperCase();
};
const weekRange = () => {
  const n = new Date();
  const mon = new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7));
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return { from: iso(mon), to: iso(sun) };
};
const pct = (part: number, total: number) => (total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0);
const isPending = (p: StaffPayoutDto) => String(p.status).toLowerCase() === "pending" || p.status === 0;
const sameMonth = (value: string | null) => {
  if (!value) return false;
  const d = new Date(value), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};
const ago = (value: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (mins < 60) return `${mins || 1}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
};
const hhmm = (t: string) => t.slice(0, 5);

type Activity = { key: string; icon: string; title: string; detail: string; at: string };

function InstructorHomeComponent() {
  const user = getStoredUser();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const [stats, setStats] = useState<StaffDashboardDto | null>(null);
  const [today, setToday] = useState<StaffSessionDto[]>([]);
  const [week, setWeek] = useState<StaffSessionDto[]>([]);
  const [students, setStudents] = useState<StaffStudentDto[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignmentDto[]>([]);
  const [payouts, setPayouts] = useState<StaffPayoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const t = iso(new Date());
    Promise.all([
      getStaffDashboard(signal), getStaffSchedule({ from: t, to: t }, signal), getStaffSchedule(weekRange(), signal),
      getStaffStudents(undefined, signal), getStaffAssignments(signal), getStaffPayouts(signal),
    ])
      .then(([d, td, wk, st, a, p]) => {
        if (signal.aborted) return;
        setStats(d); setToday(td); setWeek(wk); setStudents(st); setAssignments(a); setPayouts(p);
      })
      .catch((e: unknown) => { if (!signal.aborted) setLoadError(e instanceof Error ? e.message : "Could not load instructor data."); })
      .finally(() => { if (!signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const view = useMemo(() => {
    const nowT = new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: TZ });
    const t = iso(new Date());
    const activeEnrollments = students.filter(s => ["active", "enrolled"].includes(String(s.status).toLowerCase())).length;
    const doneThisWeek = week.filter(s => s.date < t || (s.date === t && s.endTime <= nowT)).length;
    const weekCourses = new Set(week.map(s => s.courseTitle)).size;
    const currency = payouts[0]?.currency ?? "EGP";
    const monthPayouts = payouts.filter(p => sameMonth(p.createdAt));
    const monthTotal = monthPayouts.reduce((a, p) => a + p.amount, 0);
    const monthPaid = monthPayouts.filter(p => String(p.status).toLowerCase() === "paid").reduce((a, p) => a + p.amount, 0);
    const month = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: TZ }).format(new Date());
    const upcoming = today.filter(s => s.endTime > nowT).length;
    const activity: Activity[] = [
      ...assignments.filter(a => a.latestSubmissionAt).map(a => ({
        key: `a${a.id}`, icon: "assignment_turned_in", title: a.title,
        detail: `${a.submissions} ${a.submissions === 1 ? "submission" : "submissions"} · ${a.courseTitle}`, at: a.latestSubmissionAt as string,
      })),
      ...payouts.filter(p => p.paidAt).map(p => ({
        key: `p${p.id}`, icon: "payments", title: "Payout received",
        detail: `${p.amount.toLocaleString("en-US")} ${p.currency}`, at: p.paidAt as string,
      })),
    ].sort((x, y) => +new Date(y.at) - +new Date(x.at)).slice(0, 4);
    const metrics = [
      { icon: "groups", label: "Active students", value: stats ? stats.totalStudents.toLocaleString("en-US") : "—", note: `${activeEnrollments} active enrollments`, bar: pct(activeEnrollments, students.length), tone: "tone-blue" },
      { icon: "menu_book", label: "Courses", value: stats ? String(stats.totalCourses) : "—", note: `${weekCourses} teaching this week`, bar: pct(weekCourses, stats?.totalCourses ?? 0), tone: "tone-green" },
      { icon: "calendar_month", label: "Sessions this week", value: stats ? String(week.length) : "—", note: `${doneThisWeek} completed`, bar: pct(doneThisWeek, week.length), tone: "tone-sand" },
      { icon: "payments", label: `${month} earnings`, value: stats ? `${monthTotal.toLocaleString("en-US")} ${currency}` : "—", note: `${payouts.filter(isPending).length} pending payouts`, bar: pct(monthPaid, monthTotal), tone: "tone-lavender" },
    ];
    return { metrics, activity, upcoming, nowT };
  }, [stats, today, week, students, assignments, payouts]);

  const joinHref = (s: StaffSessionDto) => (/^https?:\/\//i.test(s.roomDetails ?? "") ? s.roomDetails : null);

  return <div className="instructor-dashboard">
    <header className="instructor-greeting">
      <div>
        <span className="instructor-kicker">{dateLine()}</span>
        <h1>{greeting()}, {firstName} <span className="staff-spark">✷</span></h1>
        <p>Your classes and students are ready for today.</p>
      </div>
      <Link to="/instructor/schedule" className="instructor-primary-action"><span className="material-symbols-outlined">calendar_today</span> View schedule</Link>
    </header>
    {loadError && <p className="staff-workspace-notice" role="alert">Could not load live teaching data: {loadError}</p>}
    <section className="instructor-metrics" aria-busy={loading}>{view.metrics.map(m => <article className="instructor-metric" key={m.label}>
      <span className={`instructor-metric_icon ${m.tone} material-symbols-outlined`}>{m.icon}</span>
      <span className="instructor-metric_label">{m.label}</span>
      <strong>{m.value}</strong>
      <small>{m.note}</small>
      <span className="instructor-metric_bar" role="presentation"><i style={{ width: `${m.bar}%` }} /></span>
    </article>)}</section>
    <div className="instructor-main-grid">
      <section className="instructor-panel" id="instructor-today">
        <div className="instructor-panel_header">
          <div><h2>Today’s schedule</h2><p>{view.upcoming} upcoming {view.upcoming === 1 ? "session" : "sessions"}</p></div>
          <Link to="/instructor/schedule" className="instructor-text-link">View calendar <span className="material-symbols-outlined">arrow_forward</span></Link>
        </div>
        {today.length ? <div className="instructor-tools-list">{today.map(s => {
          const href = joinHref(s);
          const ended = s.endTime <= view.nowT;
          return <div className={`instructor-session${ended ? " is-done" : ""}`} key={s.id}>
            <span className="instructor-session_time"><strong>{hhmm(s.startTime)}</strong><small>{hhmm(s.endTime)}</small></span>
            <span className="instructor-session_bar" aria-hidden="true" />
            <span className="instructor-tool_copy"><strong>{s.title || s.courseTitle}</strong><small>{s.courseTitle}{s.batchCode ? ` · ${s.batchCode}` : ""}</small></span>
            {href ? <a className="instructor-join" href={href} target="_blank" rel="noreferrer"><span className="material-symbols-outlined">videocam</span> Join</a> : <span className="instructor-session_status">{ended ? "Done" : "Scheduled"}</span>}
          </div>;
        })}</div> : <div className="instructor-empty-state"><span className="instructor-empty-icon material-symbols-outlined">calendar_month</span><strong>{loading ? "Loading your schedule…" : "No sessions today"}</strong><p>Your assigned sessions will appear here when available.</p></div>}
      </section>
      <section className="instructor-panel">
        <div className="instructor-panel_header"><div><h2>Recent activity</h2><p>Latest updates</p></div></div>
        {view.activity.length ? <div className="instructor-tools-list">{view.activity.map(a => <div className="instructor-tool" key={a.key}>
          <span className="instructor-tool_icon tone-sand material-symbols-outlined">{a.icon}</span>
          <span className="instructor-tool_copy"><strong>{a.title}</strong><small>{a.detail}</small></span>
          <small className="instructor-activity_time">{ago(a.at)}</small>
        </div>)}</div> : <div className="instructor-inline-empty"><span className="material-symbols-outlined">notifications</span><span><strong>{loading ? "Loading activity…" : "No recent activity"}</strong><small>Submissions and payouts will show up here.</small></span></div>}
        <Link to="/instructor/assignments" className="instructor-see-all">See all activity <span className="material-symbols-outlined">arrow_forward</span></Link>
      </section>
    </div>
  </div>;
}
export default InstructorHomeComponent;
