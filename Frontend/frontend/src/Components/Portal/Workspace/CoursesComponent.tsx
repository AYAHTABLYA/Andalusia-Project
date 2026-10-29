import { memo } from "react";
import { Link } from "react-router-dom";
import type { WorkspaceCourse, WorkspaceSession } from "../../../Types/Workspace";
import EmptyState from "./EmptyState";
import { fmtDate, fmtTime } from "./helpers";

type CourseItem = { course: WorkspaceCourse; next: WorkspaceSession | null; pending: number };
type Props = { loading: boolean; items: CourseItem[] };

function CoursesComponent({ loading, items }: Props) {
  return (
    <>
      <header className="ws_head">
        <span className="portal-eyebrow">YOUR LEARNING</span>
        <h1>My courses</h1>
        <p>Courses from your active enrollments.</p>
      </header>

      {loading ? (
        <div className="portal-card ws_pad">Loading…</div>
      ) : items.length === 0 ? (
        <div className="portal-card">
          <EmptyState icon="menu_book" title="No active courses" text="Enroll in a course to see it here." />
        </div>
      ) : (
        <div className="ws_courses">
          {items.map(({ course: c, next, pending }) => (
            <article className="portal-card ws_course" key={c.id}>
              <span className="ws_course-icon material-symbols-outlined">menu_book</span>
              {c.group && <span className="portal-eyebrow">{c.group}</span>}
              <h2>{c.title}</h2>
              {c.instructor && <p className="ws_muted">{`Instructor: ${c.instructor}`}</p>}
              <div className="ws_progress">
                <div className="ws_progress-top"><span>Progress</span><strong>{`${c.progress}%`}</strong></div>
                <div className="ws_bar"><i style={{ width: `${c.progress}%` }} /></div>
              </div>
              <ul className="ws_course-meta">
                <li><span className="material-symbols-outlined">event</span>{next ? `Next: ${fmtDate(next.start)} · ${fmtTime(next.start)}` : "No upcoming session"}</li>
                <li><span className="material-symbols-outlined">assignment</span>{`${pending} assignment${pending === 1 ? "" : "s"} due`}</li>
              </ul>
              <div className="ws_actions">
                <Link className="portal-btn portal-btn-secondary" to="/workspace/schedule">Schedule</Link>
                <Link className="portal-btn portal-btn-secondary" to="/workspace/assignments">Assignments</Link>
                <Link className="portal-btn portal-btn-secondary" to="/workspace/materials">Materials</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export type { CourseItem };
export default memo(CoursesComponent);
