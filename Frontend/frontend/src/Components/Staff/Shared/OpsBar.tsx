import { Link } from "react-router-dom";

export type OpsAction = { label: string; to: string; icon: string; primary?: boolean };

type Props = { title?: string; subtitle?: string; actions: OpsAction[] };

// "Quick actions" strip at the bottom of every overview. Links only: it adds no new behaviour.
function OpsBar({ title = "Quick actions", subtitle = "Jump straight to the things you do most.", actions }: Props) {
  if (actions.length === 0) return null;
  return (
    <section className="ov-ops" aria-label={title}>
      <span className="ov-ops_icon material-symbols-outlined" aria-hidden="true">bolt</span>
      <div className="ov-ops_copy">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="ov-ops_actions">
        {actions.map((a) => (
          <Link key={a.to + a.label} to={a.to} className={`ov-ops_btn${a.primary ? " ov-ops_btn--primary" : ""}`}>
            <span className="material-symbols-outlined" aria-hidden="true">{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default OpsBar;
