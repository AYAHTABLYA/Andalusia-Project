import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Dialog from "../../Portal/Shared/Dialog";
import { createStaffUser, getRoles } from "../../../apis/adminApi";
import {
  createAdminInstructor,
  createStaffAssignment,
  createStaffSession,
  getAssignmentSubmissions,
  getPermissionCatalog,
  gradeSubmission,
  updateRolePermissions,
} from "../../../apis/staffAdminApi";
import type { AdminScheduleDto, PermissionDto, StaffSubmissionDto } from "../../../apis/staffAdminApi";
import type { StaffAssignmentDto } from "../../../apis/staffApi";
import type { AdminRole } from "../../../Types/Admin";
import Select from "../../Shared/Select/Select";

// Dialogs opened from the admin workspace action buttons (Instructors, Students, Schedule, Permissions and Assignments pages).
// Each one calls an endpoint that already exists in the backend and reports back through onDone(message).

const stack = { display: "grid", gap: "0.9rem" } as const;
const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" } as const;
const errorBox = {
  padding: "0.7rem 0.9rem", borderRadius: "0.6rem", background: "#fbeaea", color: "#9b2c2c", fontSize: "0.8rem",
} as const;

const messageOf = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="portal-ui_field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="portal-ui_hint">{hint}</span>}
    </div>
  );
}

function Footer({ formId, onClose, saving, submitLabel, disabled }: {
  formId: string; onClose: () => void; saving: boolean; submitLabel: string; disabled?: boolean;
}) {
  return (
    <>
      <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>Cancel</button>
      <button type="submit" form={formId} className="portal-ui_btn portal-ui_btn--primary" disabled={saving || disabled}>
        {saving ? "Saving…" : submitLabel}
      </button>
    </>
  );
}

// ------------------------------------------------------------------ Add instructor / Add student
type PersonKind = "instructor" | "student";

export function AddPersonDialog({ kind, onClose, onDone }: {
  kind: PersonKind; onClose: () => void; onDone: (message: string) => void;
}) {
  const [f, setF] = useState({
    firstName: "", lastName: "", email: "", mobileNumber: "", temporaryPassword: "", jobTitle: "", bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isInstructor = kind === "instructor";

  const change = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const base = {
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email.trim(),
        mobileNumber: f.mobileNumber.trim(),
        temporaryPassword: f.temporaryPassword,
      };
      if (isInstructor) {
        await createAdminInstructor({ ...base, jobTitle: f.jobTitle.trim() || undefined, bio: f.bio.trim() || undefined });
      } else {
        // No dedicated "create student" endpoint: POST /api/admin/users with the Learner role.
        await createStaffUser({ ...base, role: "Learner" });
      }
      onDone(`${base.firstName} ${base.lastName} was added as ${isInstructor ? "an instructor" : "a student"}.`);
    } catch (err) {
      setError(messageOf(err, "Could not save this account."));
      setSaving(false);
    }
  };

  return (
    <Dialog
      icon={isInstructor ? "school" : "groups"}
      title={isInstructor ? "Add instructor" : "Add student"}
      subtitle="The person signs in with this email and the temporary password."
      onClose={onClose}
      footer={<Footer formId="staff-person-form" onClose={onClose} saving={saving} submitLabel={isInstructor ? "Add instructor" : "Add student"} />}
    >
      <form id="staff-person-form" style={stack} onSubmit={submit}>
        <div style={row}>
          <Field id="sp-first" label="First name">
            <input id="sp-first" className="portal-ui_input" name="firstName" required maxLength={50} value={f.firstName} onChange={change} />
          </Field>
          <Field id="sp-last" label="Last name">
            <input id="sp-last" className="portal-ui_input" name="lastName" required maxLength={50} value={f.lastName} onChange={change} />
          </Field>
        </div>
        <div style={row}>
          <Field id="sp-email" label="Email">
            <input id="sp-email" className="portal-ui_input" type="email" name="email" required maxLength={255} value={f.email} onChange={change} />
          </Field>
          <Field id="sp-mobile" label="Mobile number">
            <input id="sp-mobile" className="portal-ui_input" type="tel" name="mobileNumber" required maxLength={20} value={f.mobileNumber} onChange={change} />
          </Field>
        </div>
        <Field id="sp-pass" label="Temporary password" hint="At least 8 characters.">
          <input id="sp-pass" className="portal-ui_input" type="password" name="temporaryPassword" required minLength={8} autoComplete="new-password" value={f.temporaryPassword} onChange={change} />
        </Field>
        {isInstructor && (
          <>
            <Field id="sp-job" label="Job title / specialization">
              <input id="sp-job" className="portal-ui_input" name="jobTitle" maxLength={100} value={f.jobTitle} onChange={change} />
            </Field>
            <Field id="sp-bio" label="Bio">
              <textarea id="sp-bio" className="portal-ui_input" name="bio" rows={3} value={f.bio} onChange={change} />
            </Field>
          </>
        )}
        {error && <div style={errorBox} role="alert">{error}</div>}
      </form>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Schedule session
const withSeconds = (t: string) => (t.length === 5 ? `${t}:00` : t);

export function ScheduleSessionDialog({ schedules, onClose, onDone }: {
  schedules: AdminScheduleDto[]; onClose: () => void; onDone: (message: string) => void;
}) {
  const [f, setF] = useState({
    scheduleId: schedules[0] ? String(schedules[0].id) : "", title: "", date: "", startTime: "", endTime: "", roomDetails: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (f.endTime <= f.startTime) {
      setError("The end time must be after the start time.");
      return;
    }
    setSaving(true);
    try {
      await createStaffSession({
        scheduleId: Number(f.scheduleId),
        title: f.title.trim(),
        date: f.date,
        startTime: withSeconds(f.startTime),
        endTime: withSeconds(f.endTime),
        roomDetails: f.roomDetails.trim() || undefined,
      });
      onDone(`Session "${f.title.trim()}" was scheduled for ${f.date}.`);
    } catch (err) {
      setError(messageOf(err, "Could not schedule this session."));
      setSaving(false);
    }
  };

  return (
    <Dialog
      icon="calendar_month"
      title="Schedule session"
      subtitle="Add a class session to an existing batch."
      onClose={onClose}
      footer={<Footer formId="staff-session-form" onClose={onClose} saving={saving} submitLabel="Schedule session" disabled={!schedules.length} />}
    >
      <form id="staff-session-form" style={stack} onSubmit={submit}>
        {!schedules.length && (
          <div style={errorBox} role="alert">There are no schedules yet. Create a schedule (batch) first, then add sessions to it.</div>
        )}
        <Field id="ss-schedule" label="Schedule (batch)">
          <Select id="ss-schedule" className="portal-ui_input" name="scheduleId" required value={f.scheduleId} onChange={change}>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>{(s.title || "Schedule") + " · " + s.batchCode}</option>
            ))}
          </Select>
        </Field>
        <Field id="ss-title" label="Session title">
          <input id="ss-title" className="portal-ui_input" name="title" required maxLength={200} value={f.title} onChange={change} />
        </Field>
        <div style={{ ...row, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Field id="ss-date" label="Date">
            <input id="ss-date" className="portal-ui_input" type="date" name="date" required value={f.date} onChange={change} />
          </Field>
          <Field id="ss-start" label="Start">
            <input id="ss-start" className="portal-ui_input" type="time" name="startTime" required value={f.startTime} onChange={change} />
          </Field>
          <Field id="ss-end" label="End">
            <input id="ss-end" className="portal-ui_input" type="time" name="endTime" required value={f.endTime} onChange={change} />
          </Field>
        </div>
        <Field id="ss-room" label="Room / details">
          <input id="ss-room" className="portal-ui_input" name="roomDetails" maxLength={100} value={f.roomDetails} onChange={change} />
        </Field>
        {error && <div style={errorBox} role="alert">{error}</div>}
      </form>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Review roles
export function ReviewRolesDialog({ onClose, onDone }: { onClose: () => void; onDone: (message: string) => void }) {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionDto[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getRoles(controller.signal), getPermissionCatalog(controller.signal)])
      .then(([r, p]) => {
        if (controller.signal.aborted) return;
        setRoles(r);
        setCatalog(p);
        if (r[0]) {
          setRoleId(r[0].roleId);
          setSelected(r[0].permissions);
        }
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(messageOf(e, "Could not load roles."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const role = roles.find((r) => r.roleId === roleId);
  // The Admin role stays read-only here so an admin cannot lock everyone out by mistake.
  const locked = role?.name === "Admin";
  const dirty = !!role && (selected.length !== role.permissions.length || selected.some((p) => !role.permissions.includes(p)));

  const pickRole = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = roles.find((r) => r.roleId === Number(e.target.value));
    if (!next) return;
    setRoleId(next.roleId);
    setSelected(next.permissions);
    setError("");
  };

  const toggle = (code: string) =>
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role || locked) return;
    setError("");
    setSaving(true);
    try {
      await updateRolePermissions(role.roleId, selected);
      onDone(`Permissions updated for ${role.name}.`);
    } catch (err) {
      setError(messageOf(err, "Could not update this role."));
      setSaving(false);
    }
  };

  return (
    <Dialog
      icon="admin_panel_settings"
      title="Review roles"
      subtitle="Choose a role and adjust the permissions it grants."
      onClose={onClose}
      footer={<Footer formId="staff-roles-form" onClose={onClose} saving={saving} submitLabel="Save permissions" disabled={loading || locked || !dirty} />}
    >
      <form id="staff-roles-form" style={stack} onSubmit={submit}>
        {loading ? <p>Loading roles…</p> : (
          <>
            <Field id="rr-role" label="Role" hint={role ? `${role.usersCount} user${role.usersCount === 1 ? "" : "s"} with this role.` : undefined}>
              <Select id="rr-role" className="portal-ui_input" value={roleId ?? ""} onChange={pickRole}>
                {roles.map((r) => <option key={r.roleId} value={r.roleId}>{r.name}</option>)}
              </Select>
            </Field>
            {locked && <span className="portal-ui_hint">The Admin role always keeps every permission and can&apos;t be edited here.</span>}
            <div style={{ display: "grid", gap: "0.5rem", maxHeight: "18rem", overflowY: "auto" }}>
              {catalog.map((p) => (
                <label key={p.code} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={selected.includes(p.code)} disabled={locked} onChange={() => toggle(p.code)} />
                  <span><strong>{p.code}</strong><br /><small>{p.description}</small></span>
                </label>
              ))}
            </div>
          </>
        )}
        {error && <div style={errorBox} role="alert">{error}</div>}
      </form>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Create assignment (instructor)
export function CreateAssignmentDialog({ schedules, onClose, onDone }: {
  schedules: { id: number; label: string }[]; onClose: () => void; onDone: (message: string) => void;
}) {
  const [f, setF] = useState({
    scheduleId: schedules[0] ? String(schedules[0].id) : "", title: "", description: "", dueDate: "", maxScore: "100",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createStaffAssignment({
        scheduleId: Number(f.scheduleId),
        title: f.title.trim(),
        description: f.description.trim() || undefined,
        dueDate: new Date(f.dueDate).toISOString(),
        maxScore: Number(f.maxScore),
      });
      onDone(`Assignment "${f.title.trim()}" was created.`);
    } catch (err) {
      setError(messageOf(err, "Could not create this assignment."));
      setSaving(false);
    }
  };

  return (
    <Dialog
      icon="assignment"
      title="Create assignment"
      subtitle="Learners enrolled in the selected batch will see it."
      onClose={onClose}
      footer={<Footer formId="staff-assignment-form" onClose={onClose} saving={saving} submitLabel="Create assignment" disabled={!schedules.length} />}
    >
      <form id="staff-assignment-form" style={stack} onSubmit={submit}>
        {!schedules.length && (
          <div style={errorBox} role="alert">No batch is assigned to you yet, so there is nothing to attach an assignment to.</div>
        )}
        <Field id="ca-schedule" label="Batch" hint="Batches that already have sessions, students or assignments are listed.">
          <Select id="ca-schedule" className="portal-ui_input" name="scheduleId" required value={f.scheduleId} onChange={change}>
            {schedules.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </Field>
        <Field id="ca-title" label="Title">
          <input id="ca-title" className="portal-ui_input" name="title" required maxLength={200} value={f.title} onChange={change} />
        </Field>
        <Field id="ca-desc" label="Description">
          <textarea id="ca-desc" className="portal-ui_input" name="description" rows={3} value={f.description} onChange={change} />
        </Field>
        <div style={row}>
          <Field id="ca-due" label="Due date">
            <input id="ca-due" className="portal-ui_input" type="datetime-local" name="dueDate" required value={f.dueDate} onChange={change} />
          </Field>
          <Field id="ca-max" label="Max score">
            <input id="ca-max" className="portal-ui_input" type="number" name="maxScore" required min={1} max={1000} value={f.maxScore} onChange={change} />
          </Field>
        </div>
        {error && <div style={errorBox} role="alert">{error}</div>}
      </form>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Review submissions + grading (instructor)
// Only http(s) or relative links are rendered as links (submission URLs are typed in by learners).
const safeHref = (url: string) => (/^(https?:\/\/|\/)/i.test(url) ? url : null);

export function ReviewSubmissionsDialog({ assignments, onClose }: { assignments: StaffAssignmentDto[]; onClose: () => void }) {
  const [assignmentId, setAssignmentId] = useState<number>(assignments[0]?.id ?? 0);
  const [subs, setSubs] = useState<StaffSubmissionDto[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { score: string; feedback: string }>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const assignment = assignments.find((a) => a.id === assignmentId);
  const maxScore = assignment?.maxScore ?? 1000;

  useEffect(() => {
    if (!assignmentId) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setInfo("");
    getAssignmentSubmissions(assignmentId, controller.signal)
      .then((list) => {
        if (controller.signal.aborted) return;
        setSubs(list);
        setDrafts(Object.fromEntries(list.map((s) => [s.id, { score: s.score == null ? "" : String(s.score), feedback: s.feedback ?? "" }])));
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(messageOf(e, "Could not load submissions."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [assignmentId]);

  const setDraft = (id: number, patch: Partial<{ score: string; feedback: string }>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { score: "", feedback: "" }), ...patch } }));

  const grade = async (s: StaffSubmissionDto) => {
    const d = drafts[s.id];
    const score = Number(d?.score);
    if (!d || d.score === "" || Number.isNaN(score) || score < 0 || score > maxScore) {
      setError(`The score must be a number between 0 and ${maxScore}.`);
      return;
    }
    setSavingId(s.id);
    setError("");
    setInfo("");
    try {
      const updated = await gradeSubmission(s.id, { score, feedback: d.feedback.trim() || undefined });
      setSubs((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
      setInfo(`Saved the grade for ${s.learnerName}.`);
    } catch (err) {
      setError(messageOf(err, "Could not save this grade."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Dialog
      icon="rate_review"
      title="Review submissions"
      subtitle="Open a submission, then enter a score and feedback."
      onClose={onClose}
      footer={<button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>Close</button>}
    >
      <div style={stack}>
        <Field id="rs-assignment" label="Assignment" hint={assignment ? `Max score ${assignment.maxScore}` : undefined}>
          <Select id="rs-assignment" className="portal-ui_input" value={assignmentId} onChange={(e) => setAssignmentId(Number(e.target.value))}>
            {assignments.map((a) => <option key={a.id} value={a.id}>{a.title} · {a.courseTitle}</option>)}
          </Select>
        </Field>
        {loading && <p>Loading submissions…</p>}
        {!loading && !subs.length && !error && <p className="portal-ui_hint">No submissions for this assignment yet.</p>}
        <div style={{ display: "grid", gap: "0.8rem", maxHeight: "22rem", overflowY: "auto" }}>
          {subs.map((s) => {
            const href = safeHref(s.fileUrl);
            const d = drafts[s.id] ?? { score: "", feedback: "" };
            return (
              <div key={s.id} style={{ border: "1px solid #e4e6e1", borderRadius: "0.7rem", padding: "0.8rem", display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span><strong>{s.learnerName}</strong><br /><small>{s.email}</small></span>
                  <small>Attempt {s.attemptNumber} · {new Date(s.submittedAt).toLocaleString()} · {s.status}</small>
                </div>
                <small>{href ? <a href={href} target="_blank" rel="noreferrer noopener">Open submitted file</a> : s.fileUrl}</small>
                <div style={{ display: "grid", gridTemplateColumns: "6rem 1fr auto", gap: "0.6rem", alignItems: "start" }}>
                  <input className="portal-ui_input" type="number" min={0} max={maxScore} placeholder={`/ ${maxScore}`} aria-label={`Score for ${s.learnerName}`} value={d.score} onChange={(e) => setDraft(s.id, { score: e.target.value })} />
                  <input className="portal-ui_input" placeholder="Feedback (optional)" aria-label={`Feedback for ${s.learnerName}`} value={d.feedback} onChange={(e) => setDraft(s.id, { feedback: e.target.value })} />
                  <button type="button" className="portal-ui_btn portal-ui_btn--primary portal-ui_btn--sm" disabled={savingId === s.id} onClick={() => void grade(s)}>
                    {savingId === s.id ? "Saving…" : s.gradedAt ? "Update" : "Grade"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {info && <p className="portal-ui_hint" role="status">{info}</p>}
        {error && <div style={errorBox} role="alert">{error}</div>}
      </div>
    </Dialog>
  );
}
