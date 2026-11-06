import { memo, type ReactNode } from "react";
import EmptyState from "./EmptyState";
import "../Applications/style.css";
import "./style.css";
import "./workspace.css";

type Props = {
  error: string | null;
  warning: string | null;
  onRetry: () => void;
  children: ReactNode;
};

// Content area of "My Workspace". The sidebar / top bar now come from StudentLayout (same shell as the staff
// dashboards); this only shows the load warning / error and the current page.
function WorkspaceLayoutComponent({ error, warning, onRetry, children }: Props) {
  return (
    <div className="ws">
      {warning && (
        <p className="staff-workspace-notice" role="status">
          <span className="material-symbols-outlined">warning</span>
          {warning}
          <button type="button" className="staff-btn staff-btn--ghost staff-btn--sm" onClick={onRetry}>
            Retry
          </button>
        </p>
      )}
      {error ? (
        <section className="staff-card">
          <EmptyState icon="cloud_off" title="We couldn't load your workspace" text={error} />
          <div className="ws_center">
            <button type="button" className="staff-btn" onClick={onRetry}>
              Try again
            </button>
          </div>
        </section>
      ) : (
        children
      )}
    </div>
  );
}

export default memo(WorkspaceLayoutComponent);
