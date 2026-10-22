import { Link } from "react-router-dom";
import { initials } from "../../../utils/format";

type Stat = { label: string; value?: string | number; icon: string; hint?: string };
type SessionRow = { id: number | string; time: string; date?: string; title: string; meta?: string; person?: string; students?: number; live?: boolean; joinUrl?: string | null };
type ActivityRow = { id: number | string; who: string; text: string; when: string };

type Props = {
  name: string;
  subtitle: string;
  stats: Stat[];
  sessions: SessionRow[];
  activity: ActivityRow[];
  scheduleLink?: string;
  loading?: boolean;
};

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Africa/Cairo" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};
const today = () =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Cairo" })
    .format(new Date()).replace(",", " ·").toUpperCase();

// AHA-style overview: greeting, 4 stat cards, today's schedule and recent activity.
function OverviewView({ name, subtitle, stats, sessions, activity, scheduleLink, loading }: Props) {
  return (
    <>
      <div className="staff-page_head">
        <div>
          <p className="staff-eyebrow">{today()}</p>
          <h1 className="staff-page_title">{greeting()}, {name.split(" ")[0] || "there"} <span className="staff-spark">✷</span></h1>
          <p className="staff-page_sub">{subtitle}</p>
        </div>
      </div>

      <div className="staff-stats">
        {stats.map((s) => (
          <div key={s.label} className="staff-stat">
            <span className="staff-stat_icon material-symbols-outlined">{s.icon}</span>
            <small>{s.label}</small>
            <strong>{loading ? "…" : s.value ?? "—"}</strong>
            {s.hint && <em>{s.hint}</em>}
            <i />
          </div>
        ))}
      </div>

      <div className="staff-two">
        <section className="staff-card">
          <div className="staff-card_head">
            <div>
              <h2>Today's schedule</h2>
              <p className="staff-page_sub">{sessions.length} upcoming session{sessions.length === 1 ? "" : "s"}</p>
            </div>
            {scheduleLink && <Link to={scheduleLink} className="staff-link">View calendar ↗</Link>}
          </div>
          {sessions.length === 0 ? (
            <p className="staff-empty">No sessions scheduled for today.</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="staff-session">
                <div className="staff-session_time"><strong>{s.time}</strong>{s.date && <small>{s.date}</small>}</div>
                <div className="staff-session_main"><strong>{s.title}</strong>{s.meta && <small>{s.meta}</small>}</div>
                {s.person && <div className="staff-session_who"><span className="staff-avatar staff-avatar--sm">{initials(s.person)}</span>{s.person}</div>}
                {s.students !== undefined && <span className="staff-session_count"><span className="material-symbols-outlined">group</span>{s.students} students</span>}
                <span className={`staff-status${s.live ? " staff-status--live" : ""}`}>{s.live ? "Live" : "Scheduled"}</span>
                {s.joinUrl && <a className="staff-btn staff-btn--ghost staff-btn--sm" href={s.joinUrl} target="_blank" rel="noreferrer">Join</a>}
              </div>
            ))
          )}
        </section>

        <section className="staff-card">
          <div className="staff-card_head"><div><h2>Recent activity</h2><p className="staff-page_sub">Latest updates</p></div></div>
          {activity.length === 0 ? (
            <p className="staff-empty">Nothing new yet.</p>
          ) : (
            activity.map((a) => (
              <div key={a.id} className="staff-activity">
                <span className="material-symbols-outlined">chat_bubble</span>
                <div><strong>{a.who}</strong><small>{a.when}</small><p>{a.text}</p></div>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}

export type { Stat, SessionRow, ActivityRow };
export default OverviewView;
