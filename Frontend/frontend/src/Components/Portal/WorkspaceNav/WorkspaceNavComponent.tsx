import { memo } from "react";
import { Link } from "react-router-dom";
import type { WorkspaceTab } from "./constants";
import "./style.css";

type Props = { tabs: WorkspaceTab[]; currentPath: string };

function WorkspaceNavComponent({ tabs, currentPath }: Props) {
  return (
    <section className="workspace-nav">
      <div className="workspace-nav_inner">
        <nav className="workspace-nav_tabs" aria-label="Student workspace">
          {tabs.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className={`workspace-nav_tab${currentPath === tab.to ? " workspace-nav_tab--active" : ""}`}
              aria-current={currentPath === tab.to ? "page" : undefined}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
              {tab.badge && <span className="workspace-nav_badge">{tab.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="workspace-nav_note">
          <span className="material-symbols-outlined">verified</span>
          <span>Pearson Assured Programs</span>
        </div>
      </div>
    </section>
  );
}

export default memo(WorkspaceNavComponent);
