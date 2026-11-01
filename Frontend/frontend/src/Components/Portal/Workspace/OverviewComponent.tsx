import { memo } from "react";
import { Link } from "react-router-dom";
import type { WorkspaceMaterial, WorkspaceSession } from "../../../Types/Workspace";
import { BarChart, ChartCard, DonutChart, type BarDatum, type Segment } from "../../Charts/Charts";
import EmptyState from "./EmptyState";
import { fmtDate, fmtTime, initials } from "./helpers";

type StatCard = { label: string; value: string; note: string; icon: string; pct: number };
type UpcomingItem = { session: WorkspaceSession; live: boolean };
type UpdateItem = WorkspaceMaterial;

type Props = {
  loading: boolean;
  hasCourses: boolean;
  greeting: string;
  weekday: string;
  clock: string;
  cards: StatCard[];
  upcoming: UpcomingItem[];
  materials: UpdateItem[];
  courseBars: BarDatum[];
  assignmentSegments: Segment[];
  attendanceSegments: Segment[];
};

function OverviewComponent({ loading, hasCourses, greeting, weekday, clock, cards, upcoming, materials, courseBars, assignmentSegments, attendanceSegments }: Props) {
  if (loading) return <div className="portal-card ws_pad">Loading your workspace…</div>;

  if (!hasCourses) {
    return (
      <div className="portal-card">
        <EmptyState
          icon="school"
          title="No active enrollment yet"
          text="Your workspace fills in as soon as you have an active enrollment."
        />
        <div className="ws_center">
          <Link className="portal-btn portal-btn-primary" to="/enrollments">View my enrollments</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="ws_hello">
        <div>
          <span className="portal-eyebrow">{weekday}</span>
          <h1>{greeting}</h1>
          <p>Ready for your next learning moment?</p>
        </div>
        <div className="ws_clock">
          <span className="material-symbols-outlined">schedule</span>
          <strong>{clock}</strong>
          <small>Cairo time</small>
        </div>
      </header>

      <div className="portal-stat-grid">
        {cards.map((c) => (
          <article className="portal-stat ws_stat" key={c.label}>
            <span className="ws_stat-icon material-symbols-outlined">{c.icon}</span>
            <span>{c.label}</span>
            <strong>{c.value}</strong>
            <small>{c.note}</small>
            <div className="ws_bar"><i style={{ width: `${c.pct}%` }} /></div>
          </article>
        ))}
      </div>

      <div className="ws_charts">
        <ChartCard className="portal-card" title="Progress by course" subtitle="Completion %" empty={courseBars.length === 0 ? "No active courses." : undefined}>
          <BarChart data={courseBars} unit="%" ariaLabel="Progress percentage per course" />
        </ChartCard>
        <ChartCard className="portal-card" title="Assignments" subtitle="By status" empty={assignmentSegments.every((s) => s.value === 0) ? "No assignments yet." : undefined}>
          <DonutChart segments={assignmentSegments} centerValue={assignmentSegments.reduce((n, s) => n + s.value, 0)} centerLabel="assignments" ariaLabel="Assignments by status" />
        </ChartCard>
        <ChartCard className="portal-card" title="Attendance" subtitle="Recorded sessions" empty={attendanceSegments.every((s) => s.value === 0) ? "No attendance recorded yet." : undefined}>
          <DonutChart segments={attendanceSegments} centerValue={attendanceSegments.reduce((n, s) => n + s.value, 0)} centerLabel="sessions" ariaLabel="Attendance by status" />
        </ChartCard>
      </div>

      <div className="ws_grid">
        <article className="portal-card ws_panel">
          <header className="ws_panel-head">
            <div>
              <h2>Your next sessions</h2>
              <p>{`${upcoming.length} upcoming session${upcoming.length === 1 ? "" : "s"}`}</p>
            </div>
            <Link to="/workspace/schedule" className="ws_link">View calendar <span className="material-symbols-outlined">north_east</span></Link>
          </header>
          {upcoming.length === 0 ? (
            <EmptyState icon="event_available" title="Nothing scheduled" text="New sessions will show up here." />
          ) : (
            <ul className="ws_rows">
              {upcoming.map(({ session: s, live }) => (
                <li key={s.id} className="ws_session-row">
                  <div className="ws_time"><strong>{fmtTime(s.start)}</strong><small>{fmtDate(s.start)}</small></div>
                  <div className="ws_session-main">
                    <strong>{s.courseTitle}</strong>
                    <small>{[s.group, s.students != null ? `${s.students} students` : ""].filter(Boolean).join(" · ")}</small>
                  </div>
                  {s.instructor && <span className="ws_who"><span className="ws_avatar ws_avatar--sm">{initials(s.instructor)}</span>{s.instructor}</span>}
                  <span className={`ws_tag ${live ? "ws_tag--live" : ""}`}>{live ? "Live" : "Upcoming"}</span>
                  <Link className="portal-btn portal-btn-secondary ws_join" to={`/workspace/schedule?s=${s.id}`}>
                    <span className="material-symbols-outlined">videocam</span>{live ? "Join" : "Details"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="portal-card ws_panel">
          <header className="ws_panel-head">
            <div><h2>New materials</h2><p>Latest from your courses</p></div>
          </header>
          {materials.length === 0 ? (
            <EmptyState icon="folder_open" title="No materials yet" text="Files your instructors share will appear here." />
          ) : (
            <ul className="ws_rows">
              {materials.map((u) => (
                <li key={u.id} className="ws_update">
                  <span className="ws_update-icon material-symbols-outlined">description</span>
                  <div>
                    <strong>{u.title}</strong>
                    <p>{u.courseTitle}</p>
                  </div>
                  {u.addedAt && <small>{fmtDate(u.addedAt)}</small>}
                </li>
              ))}
            </ul>
          )}
          <Link to="/workspace/materials" className="ws_link ws_foot">See all materials <span className="material-symbols-outlined">chevron_right</span></Link>
        </article>
      </div>
    </>
  );
}

export type { StatCard, UpcomingItem, UpdateItem };
export default memo(OverviewComponent);
