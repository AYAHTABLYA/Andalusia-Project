import { memo, type FormEvent } from "react";
import type { WorkspaceAssignment } from "../../../Types/Workspace";
import EmptyState from "./EmptyState";
import { fmtDate } from "./helpers";

type Props = {
  loading: boolean;
  assignments: WorkspaceAssignment[];
  openId: string | null;
  text: string;
  onToggle: (id: string) => void;
  onTextChange: (value: string) => void;
  onSubmit: (e: FormEvent, id: string) => void;
  onCancel: () => void;
};

function AssignmentsComponent({ loading, assignments, openId, text, onToggle, onTextChange, onSubmit, onCancel }: Props) {
  return (
    <>
      <header className="ws_head">
        <span className="portal-eyebrow">LEARNING TASKS</span>
        <h1>Assignments</h1>
        <p>Create, submit, and review course work.</p>
      </header>

      <div className="portal-card ws_pad0">
        {loading ? (
          <p className="ws_pad">Loading…</p>
        ) : assignments.length === 0 ? (
          <EmptyState icon="assignment" title="No assignments" text="Work from your courses will show up here." />
        ) : (
          <ul className="ws_assign">
            {assignments.map((a) => (
              <li key={a.id}>
                <div className="ws_assign-row">
                  <span className="ws_assign-icon material-symbols-outlined">assignment_turned_in</span>
                  <div className="ws_assign-main">
                    <small className="portal-eyebrow">{a.courseTitle}</small>
                    <strong>{a.title}</strong>
                    <small>{`Due ${fmtDate(a.due)}`}</small>
                  </div>
                  <span className={`ws_tag ws_tag--${a.status.toLowerCase()}`}>{a.status}</span>
                  {a.status === "Pending" && (
                    <button className="portal-btn portal-btn-primary" onClick={() => onToggle(a.id)}>Submit work</button>
                  )}
                  {a.status === "Graded" && <strong className="ws_score">{`${a.score} / ${a.maxScore}`}</strong>}
                </div>
                {a.status === "Graded" && a.feedback && <p className="ws_feedback"><b>Feedback:</b> {a.feedback}</p>}
                {a.status === "Submitted" && a.submission && <p className="ws_feedback"><b>Your submission:</b> {a.submission}</p>}
                {openId === a.id && (
                  <form className="ws_submit" onSubmit={(e) => onSubmit(e, a.id)}>
                    <textarea
                      value={text}
                      onChange={(e) => onTextChange(e.target.value)}
                      rows={3}
                      placeholder="Write your answer or paste a link to your work..."
                      aria-label="Your submission"
                      autoFocus
                    />
                    <div className="ws_actions">
                      <button type="button" className="portal-btn portal-btn-secondary" onClick={onCancel}>Cancel</button>
                      <button className="portal-btn portal-btn-primary" disabled={!text.trim()}>Submit</button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default memo(AssignmentsComponent);
