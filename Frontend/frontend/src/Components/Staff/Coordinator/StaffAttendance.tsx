import { useCallback, useEffect, useMemo, useState } from "react";
import { getStaffSchedule } from "../../../apis/staffApi";
import type { StaffSessionDto } from "../../../apis/staffApi";
import { getSessionAttendance, saveSessionAttendance } from "../../../apis/staffAdminApi";
import type { AttendanceStatus, SessionAttendanceDto } from "../../../apis/staffAdminApi";
import { initials } from "../../../utils/format";
import "../style.css";
import Select from "../../Shared/Select/Select";

const STATUSES: AttendanceStatus[] = ["Present", "Late", "Absent", "Excused"];
const todayIso = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });

// Attendance register: pick a session, mark Present / Late / Absent / Excused, save.
export default function StaffAttendance() {
  const [date, setDate] = useState(todayIso);
  const [sessions, setSessions] = useState<StaffSessionDto[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [register, setRegister] = useState<SessionAttendanceDto | null>(null);
  const [marks, setMarks] = useState<Record<number, AttendanceStatus | null>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // 1) sessions of the chosen day
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setNotice("");
    getStaffSchedule({ from: date, to: date }, controller.signal)
      .then((rows) => {
        if (controller.signal.aborted) return;
        setSessions(rows);
        setSessionId(rows[0]?.id ?? null);
        if (!rows.length) setRegister(null);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Could not load sessions.");
      });
    return () => controller.abort();
  }, [date]);

  // 2) learners + saved marks of the chosen session
  const loadRegister = useCallback(async (id: number, signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await getSessionAttendance(id, signal);
      if (signal?.aborted) return;
      setRegister(data);
      setMarks(Object.fromEntries(data.learners.map((l) => [l.learnerId, (l.status as AttendanceStatus) ?? null])));
    } catch (e) {
      if (!signal?.aborted) setError(e instanceof Error ? e.message : "Could not load the register.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionId == null) return;
    const controller = new AbortController();
    void loadRegister(sessionId, controller.signal);
    return () => controller.abort();
  }, [sessionId, loadRegister]);

  const counts = useMemo(() => {
    const values = Object.values(marks);
    const n = (s: AttendanceStatus) => values.filter((v) => v === s).length;
    return { total: values.length, present: n("Present"), late: n("Late"), absent: n("Absent") };
  }, [marks]);

  const unmarked = counts.total - Object.values(marks).filter(Boolean).length;
  const current = sessions.find((s) => s.id === sessionId);

  async function save() {
    if (sessionId == null || !register) return;
    const entries = Object.entries(marks)
      .filter(([, status]) => status)
      .map(([learnerId, status]) => ({ learnerId: Number(learnerId), status: status as AttendanceStatus }));
    if (!entries.length) {
      setError("Mark at least one student before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveSessionAttendance(sessionId, entries);
      setNotice(`Attendance saved for ${entries.length} student${entries.length === 1 ? "" : "s"}.`);
      await loadRegister(sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the register.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="staff-dashboard staff-workspace-page">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">
            {date === todayIso() ? "TODAY" : date}
            {current ? ` · ${current.startTime.slice(0, 5)}` : ""}
          </div>
          <h1 className="staff-page_title">Attendance register</h1>
          <p className="staff-page_sub">
            {current ? `${current.courseTitle}${current.batchCode ? ` · ${current.batchCode}` : ""}` : "Choose a session to record attendance."}
          </p>
        </div>
        <div className="staff-workspace-head-actions">
          <label className="staff-select-label">
            Date{" "}
            <input className="staff-select" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </label>
          <button className="staff-workspace-primary" onClick={() => void save()} disabled={saving || !register?.learners.length}>
            <span className="material-symbols-outlined">save</span>
            {saving ? "Saving…" : "Save register"}
          </button>
        </div>
      </header>

      {notice && <p className="staff-workspace-notice" role="status">{notice}</p>}
      {error && <p className="staff-workspace-notice" role="alert">{error}</p>}

      <section className="staff-card">
        <div className="staff-toolbar">
          <Select
            className="staff-select"
            aria-label="Session"
            value={sessionId ?? ""}
            onChange={(e) => setSessionId(Number(e.target.value))}
            disabled={!sessions.length}
          >
            {!sessions.length && <option value="">No sessions on this day</option>}
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)} · {s.courseTitle || s.title}
                {s.batchCode ? ` (${s.batchCode})` : ""}
              </option>
            ))}
          </Select>
        </div>

        <div className="coord-att-stats">
          <div><strong>{counts.total}</strong><small>Students</small></div>
          <div><strong>{counts.present}</strong><small>Present</small></div>
          <div><strong>{counts.late}</strong><small>Late</small></div>
          <div><strong>{counts.absent}</strong><small>Absent</small></div>
        </div>

        {loading && <p className="staff-workspace-notice" role="status">Loading students…</p>}

        {register && register.learners.length > 0 ? (
          <div className="coord-att-list">
            {register.learners.map((l) => (
              <div className="coord-att-row" key={l.learnerId}>
                <span className="staff-person">
                  <span className="staff-avatar staff-avatar--sm staff-avatar--square">{initials(l.name)}</span>
                  <span>
                    <strong>{l.name}</strong>
                    <small className="coord-att-email">{l.email}</small>
                  </span>
                </span>
                <span className="coord-att-buttons" role="group" aria-label={`Attendance for ${l.name}`}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`coord-att-btn coord-att-btn--${s.toLowerCase()}${marks[l.learnerId] === s ? " is-on" : ""}`}
                      aria-pressed={marks[l.learnerId] === s}
                      onClick={() => setMarks((m) => ({ ...m, [l.learnerId]: s }))}
                    >
                      {s}
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="staff-workspace-empty">
              <span className="material-symbols-outlined">fact_check</span>
              <strong>{sessions.length ? "No students in this session" : "No sessions on this day"}</strong>
              <p>Students appear here once they are enrolled in the session's batch.</p>
            </div>
          )
        )}

        {register && register.learners.length > 0 && (
          <div className="staff-workspace-foot">
            <span>{unmarked > 0 ? `${unmarked} not marked yet` : "All students marked"}</span>
            <span>Marks are saved when you press “Save register”.</span>
          </div>
        )}
      </section>
    </div>
  );
}
