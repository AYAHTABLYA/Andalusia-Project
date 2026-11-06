import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { initials } from "../../../utils/format";
import { OverviewHero, OverviewProfile, type Tile } from "./OverviewHero";
import useTilt from "../../Shared/Constellation/useTilt";
import OpsBar, { type OpsAction } from "./OpsBar";

type Stat = { label: string; value?: string | number; icon: string; hint?: string; pct?: number; note?: string };
type SessionRow = { id: number | string; time: string; date?: string; title: string; meta?: string; person?: string; students?: number; live?: boolean; done?: boolean; joinUrl?: string | null };
type ActivityRow = { id: number | string; who: string; text: string; when: string; icon?: string };

type Props = {
  name: string;
  email?: string;
  role: string;
  photoUrl?: string | null;
  workspace: string;
  tiles: Tile[]; // two real figures for the profile card
  actions?: OpsAction[]; // quick-action buttons shown at the bottom
  scene?: ReactNode; // 3D constellation card shown between the banner and the stat cards
  charts?: ReactNode; // chart cards rendered under the stat cards
  subtitle: string;
  stats: Stat[];
  sessions: SessionRow[];
  activity: ActivityRow[];
  scheduleLink?: string;
  loading?: boolean;
  // Optional wording overrides (the student overview reuses this layout). Defaults keep the staff texts.
  pulse?: string; // replaces the sentence computed from `sessions`
  sessionsTitle?: string;
  sessionsSub?: string;
  emptySessions?: string;
  activityTitle?: string;
  activitySub?: string;
  emptyActivity?: string;
  activityLink?: { label: string; to: string };
};

// AHA-style overview: greeting, 4 stat cards, today's schedule and recent activity.
function OverviewView({
  name, email, role, photoUrl, workspace, tiles, scene, actions, charts, subtitle, stats, sessions, activity, scheduleLink, loading,
  pulse: pulseOverride, sessionsTitle = "Today's schedule", sessionsSub, emptySessions = "No sessions scheduled for today.",
  activityTitle = "Recent activity", activitySub = "Latest updates", emptyActivity = "Nothing new yet.", activityLink,
}: Props) {
  const tiltRef = useTilt<HTMLDivElement>(".staff-stat");
  const upcoming = sessions.filter((s) => !s.done).length;
  const live = sessions.filter((s) => s.live).length;
  const pulse = loading ? undefined : pulseOverride ? pulseOverride : live ? `${live} live session${live === 1 ? "" : "s"} right now` : upcoming ? `${upcoming} session${upcoming === 1 ? "" : "s"} still to go today` : "No sessions left today";
  return (
    <>
      <div className="ov-top">
        <OverviewHero workspace={workspace} name={name} subtitle={subtitle} pulse={pulse} cta={scheduleLink ? { label: "View timetable", to: scheduleLink } : undefined} />
        <OverviewProfile name={name} email={email} role={role} photoUrl={photoUrl} tiles={tiles} loading={loading} />
      </div>

      {scene}

      <div className="staff-stats tilt-scope" ref={tiltRef}>
        {stats.map((s) => (
          <div key={s.label} className="staff-stat">
            <span className="staff-stat_icon material-symbols-outlined">{s.icon}</span>
            <small>{s.label}</small>
            <strong>{loading ? "…" : s.value ?? "—"}</strong>
            {s.hint && <em>{s.hint}</em>}
            {s.note && <span className="staff-stat_note">{s.note}</span>}
            {s.pct !== undefined && <i style={{ ["--p" as string]: `${Math.max(0, Math.min(100, s.pct))}%` }} />}
          </div>
        ))}
      </div>

      {charts && <div className="ov-charts">{charts}</div>}

      <div className="staff-two">
        <section className="staff-card">
          <div className="staff-card_head">
            <div>
              <h2>{sessionsTitle}</h2>
              <p className="staff-page_sub">{sessionsSub ?? `${upcoming} upcoming session${upcoming === 1 ? "" : "s"}`}</p>
            </div>
            {scheduleLink && <Link to={scheduleLink} className="staff-link">View calendar ↗</Link>}
          </div>
          {sessions.length === 0 ? (
            <p className="staff-empty">{loading ? "Loading sessions…" : emptySessions}</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="staff-session">
                <div className="staff-session_time"><strong>{s.time}</strong>{s.date && <small>{s.date}</small>}</div>
                <div className="staff-session_main"><strong>{s.title}</strong>{s.meta && <small>{s.meta}</small>}</div>
                {s.person && <div className="staff-session_who"><span className="staff-avatar staff-avatar--sm">{initials(s.person)}</span>{s.person}</div>}
                {s.students !== undefined && <span className="staff-session_count"><span className="material-symbols-outlined">group</span>{s.students} students</span>}
                <span className={`staff-status${s.live ? " staff-status--live" : ""}`}>{s.live ? "Live" : s.done ? "Done" : "Scheduled"}</span>
                {s.joinUrl && <a className="staff-btn staff-btn--ghost staff-btn--sm" href={s.joinUrl} target="_blank" rel="noreferrer">Join</a>}
              </div>
            ))
          )}
        </section>

        <section className="staff-card">
          <div className="staff-card_head">
            <div><h2>{activityTitle}</h2><p className="staff-page_sub">{activitySub}</p></div>
            {activityLink && <Link to={activityLink.to} className="staff-link">{activityLink.label} ↗</Link>}
          </div>
          {activity.length === 0 ? (
            <p className="staff-empty">{loading ? "Loading…" : emptyActivity}</p>
          ) : (
            activity.map((a) => (
              <div key={a.id} className="staff-activity">
                <span className="material-symbols-outlined">{a.icon ?? "chat_bubble"}</span>
                <div><strong>{a.who}</strong><small>{a.when}</small><p>{a.text}</p></div>
              </div>
            ))
          )}
        </section>
      </div>

      <OpsBar actions={actions ?? []} />
    </>
  );
}

export type { Stat, SessionRow, ActivityRow };
export default OverviewView;
