import type { ReactNode } from "react";
import { initials } from "../../../../utils/format";
import "../../style.css";

type Stat = { label: string; value?: string | number; icon: string };
type Action = { label: string; icon?: string; onClick: () => void };

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: string;
  stats: Stat[];
  columns: string[];
  rows: string[][];
  query: string;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  primaryAction?: Action;
  secondaryActions?: Action[];
  headerExtras?: ReactNode; // e.g. the period selector
  footerExtra?: ReactNode;
  notice?: string;
  error?: string;
  loading?: boolean;
  emptyNote: string;
  peopleColumn?: boolean; // first column is a person: show an avatar
  rowActions?: (rowIndex: number) => ReactNode; // when given, an "Actions" column is added
  beforeTable?: ReactNode; // e.g. the permission matrix
  hideTable?: boolean;
  children?: ReactNode; // dialogs
};

const POSITIVE = /^(active|enrolled|approved|paid|configured|yes|completed|live|graded|running|scheduled|open|upcoming)$/i;

// Presentational table page shared by the staff workspaces (Instructors, Students, Schedule, Compensation, Reports…).
// It owns no data: each page's Container loads the records and passes them in.
function WorkspaceTableComponent({
  eyebrow, title, subtitle, icon, stats, columns, rows, query, onQueryChange, onReset,
  primaryAction, secondaryActions = [], headerExtras, footerExtra, notice, error, loading,
  emptyNote, peopleColumn, rowActions, beforeTable, hideTable, children,
}: Props) {
  return (
    <div className="staff-dashboard staff-workspace-page">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">{eyebrow}</div>
          <h1 className="staff-page_title">{title}</h1>
          <p className="staff-page_sub">{subtitle}</p>
        </div>
        <div className="staff-workspace-head-actions">
          {headerExtras}
          {primaryAction && (
            <button className="staff-workspace-primary" onClick={primaryAction.onClick}>
              {primaryAction.icon && <span className="material-symbols-outlined">{primaryAction.icon}</span>}
              {primaryAction.label}
            </button>
          )}
        </div>
      </header>

      <section className="staff-workspace-stats">
        {stats.map((s) => (
          <article className="staff-workspace-stat" key={s.label}>
            <span className="material-symbols-outlined">{s.icon}</span>
            <small>{s.label}</small>
            <strong>{s.value ?? (loading ? "…" : "—")}</strong>
            <em>{s.value === undefined ? "Not available yet" : "Live data"}</em>
          </article>
        ))}
      </section>

      <section className="staff-card staff-workspace-table-card">
        <div className="staff-card_head">
          <div>
            <h2>{title}</h2>
            <p className="staff-page_sub">
              {rows.length} record{rows.length === 1 ? "" : "s"} in your academy
            </p>
          </div>
          <span className="material-symbols-outlined staff-workspace-card-icon">{icon}</span>
        </div>
        <div className="staff-toolbar">
          <input
            className="staff-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            aria-label={`Search ${title}`}
          />
          <button className="staff-workspace-secondary" onClick={onReset}>Reset filters</button>
          {secondaryActions.map((a) => (
            <button className="staff-workspace-secondary" key={a.label} onClick={a.onClick}>{a.label}</button>
          ))}
        </div>
        {notice && <p className="staff-workspace-notice" role="status">{notice}</p>}
        {error && <p className="staff-workspace-notice" role="alert">Could not load live data: {error}</p>}
        {loading && <p className="staff-workspace-notice" role="status">Loading live records…</p>}
        {beforeTable}
        <div className="staff-table-wrap" hidden={hideTable}>
          <table className="staff-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
                {rowActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>
                        {columns[j] === "Status" && cell && cell !== "—" ? (
                          <span className={`staff-pill${POSITIVE.test(cell) ? "" : " staff-pill--off"}`}>{cell}</span>
                        ) : j === 0 && peopleColumn ? (
                          <span className="staff-person">
                            <span className="staff-avatar staff-avatar--sm staff-avatar--square">{initials(cell)}</span>
                            <strong>{cell}</strong>
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                    {rowActions && <td>{rowActions(i)}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (rowActions ? 1 : 0)}>
                    <div className="staff-workspace-empty">
                      <span className="material-symbols-outlined">{icon}</span>
                      <strong>{query ? "No matching records" : loading ? "Loading records…" : "No records to display yet"}</strong>
                      <p>{query ? "Try another search term." : error ? "Check the API and your permissions, then retry." : emptyNote}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="staff-workspace-foot">
          <span>Showing {rows.length} records</span>
          {footerExtra}
        </div>
      </section>
      {children}
    </div>
  );
}

export type { Stat, Action };
export default WorkspaceTableComponent;
