import { memo, type FormEvent } from "react";
import type { SessionStatus, WorkspaceSession } from "../../../Types/Workspace";
import EmptyState from "./EmptyState";
import { fmtDayLong, fmtRelative, fmtTime, initials } from "./helpers";

type DayTab = { key: string; weekday: string; date: number; hasSessions: boolean };
type SlotItem = { session: WorkspaceSession; status: SessionStatus };

type Props = {
  dayLabel: string; // ISO of the selected day
  tabs: DayTab[];
  activeDay: string;
  slots: SlotItem[];
  selected: WorkspaceSession | null;
  selectedStatus: SessionStatus | null;
  draft: string;
  onDayChange: (key: string) => void;
  onSelect: (sessionId: string) => void;
  onDraftChange: (value: string) => void;
  onPost: (e: FormEvent) => void;
  onJoin: (url: string) => void;
};

function ScheduleComponent({
  dayLabel, tabs, activeDay, slots, selected, selectedStatus: status, draft,
  onDayChange, onSelect, onDraftChange, onPost, onJoin,
}: Props) {
  return (
    <>
      <header className="ws_head">
        <span className="portal-eyebrow">CLASSES &amp; MEETINGS</span>
        <h1>My schedule</h1>
        <p>Everything you need for your next learning session.</p>
      </header>

      <div className="ws_split">
        <article className="portal-card ws_panel">
          <header className="ws_panel-head">
            <div>
              <h2>My learning schedule</h2>
              <p>{fmtDayLong(dayLabel)}</p>
            </div>
          </header>

          <div className="ws_week" role="tablist" aria-label="Week days">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeDay === t.key}
                className={`ws_day${activeDay === t.key ? " is-active" : ""}`}
                onClick={() => onDayChange(t.key)}
              >
                <small>{t.weekday}</small>
                <strong>{t.date}</strong>
                {t.hasSessions && <i className="ws_dot" />}
              </button>
            ))}
          </div>

          {slots.length === 0 ? (
            <EmptyState icon="event_busy" title="No sessions this day" text="Pick another day to see your classes." />
          ) : (
            <ul className="ws_rows">
              {slots.map(({ session: s, status: st }) => (
                <li key={s.id}>
                  <button className={`ws_slot${selected?.id === s.id ? " is-active" : ""}`} onClick={() => onSelect(s.id)}>
                    <div className="ws_time"><strong>{fmtTime(s.start)}</strong><small>{`${s.durationMin} min`}</small></div>
                    <div className="ws_session-main">
                      <small className="portal-eyebrow">{s.group}</small>
                      <strong>{s.courseTitle}</strong>
                      <small>{`${s.instructor} · ${s.students} students`}</small>
                    </div>
                    <span className={`ws_tag ${st === "Live" ? "ws_tag--live" : ""}`}>{st}</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="portal-card ws_panel ws_detail">
          {!selected ? (
            <EmptyState icon="videocam" title="Select a session" text="Session details and class comments appear here." />
          ) : (
            <>
              <span className="portal-eyebrow">SESSION DETAILS</span>
              <h2>{selected.courseTitle}</h2>
              <p className="ws_muted">{`${new Date(selected.start).toLocaleDateString("en-CA")} at ${fmtTime(selected.start)} · Cairo time`}</p>

              <div className="ws_zoom">
                <span className="material-symbols-outlined">videocam</span>
                <div>
                  <strong>Zoom classroom</strong>
                  <small>{selected.zoomUrl ? (status === "Completed" ? "Session ended" : "Meeting link is ready") : "Meeting link is not ready yet"}</small>
                </div>
                <button
                  className="portal-btn portal-btn-primary"
                  disabled={!selected.zoomUrl || status === "Completed"}
                  onClick={() => selected.zoomUrl && onJoin(selected.zoomUrl)}
                >
                  <span className="material-symbols-outlined">play_circle</span>Join now
                </button>
              </div>

              <dl className="ws_facts">
                <div><dt>Instructor</dt><dd>{selected.instructor}</dd></div>
                <div><dt>Status</dt><dd><span className={`ws_tag ${status === "Live" ? "ws_tag--live" : ""}`}>{status}</span></dd></div>
              </dl>

              <h3 className="ws_sub"><span className="material-symbols-outlined">chat_bubble</span>Class comments</h3>
              <ul className="ws_comments">
                {selected.comments.length === 0 && <li className="ws_muted">No comments yet. Ask your first question below.</li>}
                {selected.comments.map((c) => (
                  <li key={c.id} className={c.role === "Student" ? "is-me" : ""}>
                    <span className="ws_avatar ws_avatar--sm">{initials(c.author)}</span>
                    <div>
                      <strong>{c.author}<small>{c.role}</small></strong>
                      <p>{c.text}</p>
                      <small>{fmtRelative(c.at)}</small>
                    </div>
                  </li>
                ))}
              </ul>

              <form className="ws_compose" onSubmit={onPost}>
                <textarea
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  placeholder="Write a comment or question..."
                  aria-label="Write a comment or question"
                  rows={2}
                />
                <button className="portal-btn portal-btn-primary ws_send" disabled={!draft.trim()} aria-label="Send comment">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </>
          )}
        </article>
      </div>
    </>
  );
}

export type { DayTab, SlotItem };
export default memo(ScheduleComponent);
