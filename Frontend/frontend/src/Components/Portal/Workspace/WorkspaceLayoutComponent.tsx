import { memo, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { SUPPORT_CONVERSATION_ID, type WorkspaceLink } from "./constants";
import { initials } from "./helpers";
import "../Applications/style.css";
import "./style.css";

type Props = {
  links: WorkspaceLink[];
  badges: Record<string, number>;
  userName: string;
  isDemo: boolean;
  children: ReactNode;
};

function WorkspaceLayoutComponent({ links, badges, userName, isDemo, children }: Props) {
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

        <div className="ws_help">
          <span className="material-symbols-outlined">auto_awesome</span>
          <strong>Need a hand?</strong>
          <p>Our academy support team is here for you.</p>
          <NavLink to={`/workspace/messages?c=${SUPPORT_CONVERSATION_ID}`}>Talk to support</NavLink>
        </div>

        <div className="ws_me">
          <span className="ws_avatar">{initials(userName)}</span>
          <div>
            <strong>{userName}</strong>
            <small>Student</small>
          </div>
        </div>
      </aside>

      <div className="ws_content">
        {isDemo && (
          <p className="ws_demo" role="status">
            <span className="material-symbols-outlined">info</span>
            Showing sample data — the enrollment service could not be reached.
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export default memo(WorkspaceLayoutComponent);
