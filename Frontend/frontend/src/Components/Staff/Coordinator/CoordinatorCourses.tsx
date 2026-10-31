import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Dialog from "../../Portal/Shared/Dialog";
import { apiGet } from "../../../apis/academyApi";
import { getAdminSchedules, getScheduleProgress } from "../../../apis/staffAdminApi";
import type { AdminScheduleDto, ScheduleProgressDto } from "../../../apis/staffAdminApi";
import { enrollLearner, removeEnrollment, searchEligibleLearners } from "../../../apis/coordinatorApi";
import type { EligibleLearnerDto } from "../../../apis/coordinatorApi";
import type { Paginated } from "../../../Types/Paginated";
import type { CourseListItemDto } from "../../../Types/AcademyApi";
import useDebouncedValue from "../../../hooks/academyHooks/useDebouncedValue";
import { initials } from "../../../utils/format";
import { hasPermission } from "../../../utils/session";
import "../style.css";

const messageOf = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);
const GOOD = /^(running|scheduled)$/i;

// ------------------------------------------------------------------ Enroll dialog
// Adds ONE eligible learner to a course batch. Students never add themselves (they have no such endpoint);
// the API records who performed the enrollment and when.
function EnrollDialog({ schedule, onClose, onDone }: {
  schedule: AdminScheduleDto; onClose: () => void; onDone: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);
  const [results, setResults] = useState<EligibleLearnerDto[]>([]);
  const [picked, setPicked] = useState<EligibleLearnerDto | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const full = schedule.enrolledCount >= schedule.capacity;

  useEffect(() => {
    const controller = new AbortController();
    setSearching(true);
    searchEligibleLearners({ search: debounced || undefined, scheduleId: schedule.id }, controller.signal)
      .then((rows) => !controller.signal.aborted && setResults(rows))
      .catch((e: unknown) => !controller.signal.aborted && setError(messageOf(e, "Could not search students.")))
      .finally(() => !controller.signal.aborted && setSearching(false));
    return () => controller.abort();
  }, [debounced, schedule.id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!picked) return;
    setSaving(true);
    setError("");
    try {
      await enrollLearner({ scheduleId: schedule.id, learnerId: picked.id });
      onDone(`${picked.name} was enrolled in ${schedule.title || schedule.batchCode}.`);
    } catch (err) {
      setError(messageOf(err, "Could not enroll this student."));
      setSaving(false);
    }
  }

  return (
    <Dialog
      icon="person_add"
      title="Enroll student"
      subtitle={`${schedule.title || "Course"} · ${schedule.batchCode} · ${schedule.enrolledCount}/${schedule.capacity} seats used`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" form="coord-enroll-form" className="portal-ui_btn portal-ui_btn--primary" disabled={saving || !picked || full}>
            {saving ? "Enrolling…" : "Enroll student"}
          </button>
        </>
      }
    >
      <form id="coord-enroll-form" onSubmit={submit} style={{ display: "grid", gap: "0.9rem" }}>
        {full && <div className="staff-workspace-notice" role="alert">This batch is full. Increase its capacity before adding students.</div>}
        <div className="portal-ui_field">
          <label htmlFor="coord-enroll-search">Find a student</label>
          <input
            id="coord-enroll-search" className="portal-ui_input" placeholder="Name or email"
            value={search} onChange={(e) => { setSearch(e.target.value); setPicked(null); }}
          />
          <span className="portal-ui_hint">Only students who can still be added to this batch are listed.</span>
        </div>
        <div className="coord-pick-list" role="listbox" aria-label="Eligible students">
          {searching && <p className="staff-empty">Searching…</p>}
          {!searching && !results.length && <p className="staff-empty">No eligible students found.</p>}
          {results.map((l) => (
            <button
              key={l.id} type="button" role="option" aria-selected={picked?.id === l.id}
              className={`coord-pick${picked?.id === l.id ? " is-on" : ""}`} onClick={() => setPicked(l)}
            >
              <span className="staff-avatar staff-avatar--sm staff-avatar--square">{initials(l.name)}</span>
              <span><strong>{l.name}</strong><small>{l.email}</small></span>
            </button>
          ))}
        </div>
        {error && <div className="staff-workspace-notice" role="alert">{error}</div>}
      </form>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Roster dialog (read-only)
function RosterDialog({ schedule, onClose, onChanged, canManageEnrollments }: { schedule: AdminScheduleDto; onClose: () => void; onChanged: (message: string) => void; canManageEnrollments: boolean }) {
  const [data, setData] = useState<ScheduleProgressDto | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getScheduleProgress(schedule.id, controller.signal)
      .then((d) => !controller.signal.aborted && setData(d))
      .catch((e: unknown) => !controller.signal.aborted && setError(messageOf(e, "Could not load students.")));
    return () => controller.abort();
  }, [schedule.id, reloadKey]);

  async function remove(enrollmentId: number, name: string) {
    if (!window.confirm(`Remove ${name} from this batch? The change is recorded with your name and the time.`)) return;
    setBusy(enrollmentId);
    setError("");
    try {
      await removeEnrollment(enrollmentId);
      onChanged(`${name} was removed from ${schedule.title || schedule.batchCode}.`);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(messageOf(e, "Could not remove this student."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog icon="groups" title="Enrolled students" subtitle={`${schedule.title || "Course"} · ${schedule.batchCode}`} onClose={onClose}
      footer={<button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>Close</button>}>
      {error && <div className="staff-workspace-notice" role="alert">{error}</div>}
      {!data && !error && <p className="staff-empty">Loading…</p>}
      {data && !data.learners.length && <p className="staff-empty">No students enrolled yet.</p>}
      {data && data.learners.length > 0 && (
        <div className="coord-pick-list">
          {data.learners.map((l) => (
            <div className="coord-pick" key={l.learnerId}>
              <span className="staff-avatar staff-avatar--sm staff-avatar--square">{initials(l.name)}</span>
              <span style={{ flex: 1 }}><strong>{l.name}</strong><small>{l.email} · attendance {Math.round(l.progress.attendanceRate)}%</small></span>
              {canManageEnrollments && <button type="button" className="staff-workspace-secondary" disabled={busy === l.progress.enrollmentId}
                onClick={() => void remove(l.progress.enrollmentId, l.name)}>Remove</button>}
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}

// ------------------------------------------------------------------ Page
export default function CoordinatorCourses() {
  const canViewEnrollments = hasPermission("enrollments.view") || hasPermission("enrollments.manage");
  const canManageEnrollments = hasPermission("enrollments.manage");
  const [schedules, setSchedules] = useState<AdminScheduleDto[]>([]);
  const [prices, setPrices] = useState<Map<number, CourseListItemDto>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [enrolling, setEnrolling] = useState<AdminScheduleDto | null>(null);
  const [roster, setRoster] = useState<AdminScheduleDto | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const [sched, courses] = await Promise.all([
        getAdminSchedules({ page: 1, pageSize: 100 }, signal),
        apiGet<Paginated<CourseListItemDto>>("/api/courses", { page: 1, pageSize: 100 }, signal).catch(() => null),
      ]);
      if (signal?.aborted) return;
      setSchedules(sched.data);
      setPrices(new Map((courses?.data ?? []).map((c) => [c.id, c])));
    } catch (e) {
      if (!signal?.aborted) setError(messageOf(e, "Could not load courses."));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const rows = useMemo(
    () => schedules.filter((s) => `${s.title} ${s.batchCode} ${s.instructors.map((i) => i.name).join(" ")}`.toLowerCase().includes(query.toLowerCase())),
    [schedules, query],
  );
  const seats = schedules.reduce((a, s) => a + s.enrolledCount, 0);

  return (
    <div className="staff-dashboard staff-workspace-page">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">ACADEMY MANAGEMENT</div>
          <h1 className="staff-page_title">Courses</h1>
          <p className="staff-page_sub">Manage, review, and keep every enrollment up to date.</p>
        </div>
      </header>

      <section className="staff-workspace-stats">
        <article className="staff-workspace-stat"><span className="material-symbols-outlined">menu_book</span><small>Course batches</small><strong>{schedules.length}</strong><em>Live data</em></article>
        <article className="staff-workspace-stat"><span className="material-symbols-outlined">play_circle</span><small>Running</small><strong>{schedules.filter((s) => s.status === "Running").length}</strong><em>Live data</em></article>
        <article className="staff-workspace-stat"><span className="material-symbols-outlined">groups</span><small>Enrollments</small><strong>{seats}</strong><em>Live data</em></article>
      </section>

      {notice && <p className="staff-workspace-notice" role="status">{notice}</p>}
      {error && <p className="staff-workspace-notice" role="alert">Could not load live data: {error}</p>}

      <section className="staff-card staff-workspace-table-card">
        <div className="staff-card_head">
          <div>
            <h2>Courses</h2>
            <p className="staff-page_sub">{rows.length} record{rows.length === 1 ? "" : "s"} in your academy</p>
          </div>
          <span className="material-symbols-outlined staff-workspace-card-icon">menu_book</span>
        </div>
        <div className="staff-toolbar">
          <input className="staff-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses, codes, instructors…" aria-label="Search courses" />
          <button className="staff-workspace-secondary" onClick={() => setQuery("")}>Reset</button>
          <button className="staff-workspace-secondary" onClick={() => void load()}>Refresh</button>
        </div>
        {loading && <p className="staff-workspace-notice" role="status">Loading courses…</p>}
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr><th>Course</th><th>Code</th><th>Instructor</th><th>Enrollment</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((s) => {
                const course = s.courseId != null ? prices.get(s.courseId) : undefined;
                const full = s.enrolledCount >= s.capacity;
                const closed = s.status === "Completed" || s.status === "Cancelled";
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="staff-person">
                        <span className="staff-avatar staff-avatar--sm staff-avatar--square">{initials(s.title || s.batchCode)}</span>
                        <strong>{s.title || `Schedule #${s.id}`}</strong>
                      </span>
                    </td>
                    <td>{s.batchCode}</td>
                    <td>{s.instructors.map((i) => i.name).join(", ") || "Unassigned"}</td>
                    <td>{s.enrolledCount} / {s.capacity}</td>
                    <td>{course ? `${course.tuition.toLocaleString("en-US")} ${course.currency}` : "—"}</td>
                    <td><span className={`staff-pill${GOOD.test(s.status) ? "" : " staff-pill--off"}`}>{s.status}</span></td>
                    <td>
                      <span className="staff-row-actions">
                        {canViewEnrollments && <button className="staff-workspace-secondary" onClick={() => setRoster(s)}>Students</button>}
                        {canManageEnrollments && <button
                          className="staff-workspace-secondary" onClick={() => setEnrolling(s)} disabled={full || closed}
                          title={full ? "This batch is full" : closed ? "This batch is closed" : "Add a student to this batch"}
                        >
                          Enroll
                        </button>}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7}>
                  <div className="staff-workspace-empty">
                    <span className="material-symbols-outlined">menu_book</span>
                    <strong>{query ? "No matching records" : loading ? "Loading records…" : "No courses to display yet"}</strong>
                    <p>{query ? "Try another search term." : "Course batches appear here once Admin creates them."}</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {enrolling && (
        <EnrollDialog
          schedule={enrolling}
          onClose={() => setEnrolling(null)}
          onDone={(m) => { setEnrolling(null); setNotice(m); void load(); }}
        />
      )}
      {roster && <RosterDialog schedule={roster} onClose={() => { setRoster(null); void load(); }} onChanged={(m) => setNotice(m)} canManageEnrollments={canManageEnrollments} />}
    </div>
  );
}
