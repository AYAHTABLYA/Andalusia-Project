import { useCallback, useEffect, useState } from "react";
import { getStaffAssignments, getStaffSchedule, getStaffStudents } from "../../../apis/staffApi";
import type { StaffAssignmentDto } from "../../../apis/staffApi";
import { getAssignmentSubmissions } from "../../../apis/staffAdminApi";
import { CreateAssignmentDialog, ReviewSubmissionsDialog } from "../Shared/StaffActionDialogs";
import "../style.css";

type Row = { a: StaffAssignmentDto; state: "Pending" | "Submitted" | "Graded"; score?: string };

// Assignments (AHA design): list with course, title, due date and Pending / Submitted / Graded state.
export default function InstructorAssignments() {
  const [rows, setRows] = useState<Row[]>([]);
  const [options, setOptions] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState<StaffAssignmentDto | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const [list, sessions, students] = await Promise.all([
        getStaffAssignments(signal),
        getStaffSchedule(undefined, signal).catch(() => []),
        getStaffStudents(undefined, signal).catch(() => []),
      ]);
      if (signal?.aborted) return;
      const opts = new Map<number, string>();
      students.forEach((x) => x.scheduleId != null && opts.set(x.scheduleId, x.courseTitle));
      list.forEach((x) => opts.set(x.scheduleId, x.courseTitle));
      sessions.forEach((x) => opts.set(x.scheduleId, `${x.courseTitle} · ${x.batchCode}`));
      setOptions(Array.from(opts, ([id, label]) => ({ id, label: `${label} (#${id})` })));

      const subs = await Promise.allSettled(list.map((a) => (a.submissions ? getAssignmentSubmissions(a.id, signal) : Promise.resolve([]))));
      if (signal?.aborted) return;
      setRows(list.map((a, i) => {
        const r = subs[i];
        const items = r.status === "fulfilled" ? r.value : [];
        const graded = items.filter((s) => s.score != null);
        if (items.length && graded.length === items.length) {
          const avg = graded.reduce((sum, s) => sum + (s.score ?? 0), 0) / graded.length;
          return { a, state: "Graded" as const, score: `${Math.round(avg * 10) / 10} / ${a.maxScore}` };
        }
        return { a, state: a.submissions > 0 ? ("Submitted" as const) : ("Pending" as const) };
      }));
    } catch (e) {
      if (!signal?.aborted) setError(e instanceof Error ? e.message : "Could not load assignments.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  return (
    <div className="staff-dashboard staff-workspace-page">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">LEARNING TASKS</div>
          <h1 className="staff-page_title">Assignments</h1>
          <p className="staff-page_sub">Create, submit, and review course work.</p>
        </div>
        <button className="staff-workspace-primary" onClick={() => setCreating(true)}>
          <span className="material-symbols-outlined">add</span> New assignment
        </button>
      </header>
      {notice && <p className="staff-workspace-notice" role="status">{notice}</p>}
      {error && <p className="staff-workspace-notice" role="alert">Could not load live data: {error}</p>}

      <section className="staff-card">
        {rows.length ? rows.map(({ a, state, score }) => (
          <button key={a.id} type="button" className="ins-assign" onClick={() => setReviewing(a)}>
            <span className="ins-assign_icon material-symbols-outlined">assignment_turned_in</span>
            <span className="ins-assign_main">
              <small>{a.courseTitle}</small>
              <strong>{a.title}</strong>
              <small>Due {new Date(a.dueDate).toLocaleDateString("en-CA")}</small>
            </span>
            <span className={`ins-state ins-state--${state.toLowerCase()}`}>{state}</span>
            {score && <strong className="ins-assign_score">{score}</strong>}
          </button>
        )) : (
          <div className="staff-workspace-empty">
            <span className="material-symbols-outlined">assignment</span>
            <strong>{loading ? "Loading assignments…" : "No assignments yet"}</strong>
            <p>Students come from coordinator-approved enrollments. Create an assignment for one of your batches.</p>
          </div>
        )}
      </section>

      {creating && (
        <CreateAssignmentDialog schedules={options} onClose={() => setCreating(false)}
          onDone={(m) => { setCreating(false); setNotice(m); void load(); }} />
      )}
      {reviewing && (
        <ReviewSubmissionsDialog assignments={[reviewing]} onClose={() => { setReviewing(null); void load(); }} />
      )}
    </div>
  );
}
