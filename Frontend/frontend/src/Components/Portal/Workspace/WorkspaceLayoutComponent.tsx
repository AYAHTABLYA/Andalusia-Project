import { memo, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import type { WorkspaceLink } from "./constants";
import EmptyState from "./EmptyState";
import { initials } from "./helpers";
import "../Applications/style.css";
import "./style.css";

type Props = {
  links: WorkspaceLink[];
  badges: Record<string, number>;
  userName: string;
  error: string | null;
  warning: string | null;
  onRetry: () => void;
  children: ReactNode;
};

function WorkspaceLayoutComponent({ links, badges, userName, error, warning, onRetry, children }: Props) {
  return (
    <section className="ws">
      <aside className="ws_side" aria-label="Student workspace">
        <span className="ws_side-label">STUDENT WORKSPACE</span>
        <nav className="ws_side-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `ws_side-link${isActive ? " is-active" : ""}`}
            >
              <span className="material-symbols-outlined">{l.icon}</span>
              <span className="ws_side-text">{l.label}</span>
              {badges[l.to] > 0 && <span className="ws_badge">{badges[l.to]}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="ws_me">
          <span className="ws_avatar">{initials(userName)}</span>
          <div>
            <strong>{userName}</strong>
            <small>Student</small>
          </div>
        </div>
      </aside>

      <div className="ws_content">
        {warning && (
          <p className="ws_demo" role="status">
            <span className="material-symbols-outlined">warning</span>
            {warning}
            <button type="button" className="portal-btn portal-btn-secondary" onClick={onRetry}>Retry</button>
          </p>
        )}
        {error ? (
          <div className="portal-card">
            <EmptyState icon="cloud_off" title="We couldn't load your workspace" text={error} />
            <div className="ws_center">
              <button type="button" className="portal-btn portal-btn-primary" onClick={onRetry}>Try again</button>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default memo(WorkspaceLayoutComponent);
