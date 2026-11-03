import { memo, useMemo, useState } from "react";
import type { AdminRole } from "../../../../Types/Admin";
import "./permissions.css";

type PermissionItem = { code: string; action: string; description: string };
type PermissionGroup = { key: string; title: string; items: PermissionItem[] };

type Props = {
  loading: boolean;
  error: string;
  roles: AdminRole[];
  role: AdminRole | null;
  groups: PermissionGroup[];
  selected: string[];
  added: string[];
  removed: string[];
  locked: boolean;
  confirming: boolean;
  saving: boolean;
  saveError: string;
  notice: string;
  onPickRole: (id: number) => void;
  onToggle: (code: string) => void;
  onReset: () => void;
  onAskConfirm: () => void;
  onCancelConfirm: () => void;
  onSave: () => void;
  onRetry: () => void;
};

const label = (name: string) => name.replace(/_/g, " ");

function PermissionsComponent({
  loading, error, roles, role, groups, selected, added, removed, locked, confirming, saving, saveError, notice,
  onPickRole, onToggle, onReset, onAskConfirm, onCancelConfirm, onSave, onRetry,
}: Props) {
  const dirty = added.length + removed.length > 0;
  const totalPermissions = groups.reduce((n, g) => n + g.items.length, 0);
  const users = roles.reduce((n, r) => n + r.usersCount, 0);

  // Long catalog -> groups are collapsed accordions with a search box (search opens every group that matches).
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string[]>([]);
  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: q ? g.items.filter((p) => `${p.code} ${p.action} ${p.description}`.toLowerCase().includes(q)) : g.items,
        }))
        .filter((g) => g.items.length > 0),
    [groups, q],
  );
  const isOpen = (key: string) => Boolean(q) || open.includes(key);
  const flip = (key: string) => setOpen((o) => (o.includes(key) ? o.filter((k) => k !== key) : [...o, key]));
  const allOpen = visible.length > 0 && visible.every((g) => isOpen(g.key));
  // Select all / none for one group: flip only the switches that differ (toggle uses functional updates).
  const setGroup = (codes: string[], on: boolean) => codes.filter((c) => selected.includes(c) !== on).forEach(onToggle);

  return (
    <div className="staff-dashboard staff-workspace-page perm">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">SECURITY & ACCESS</div>
          <h1 className="staff-page_title">Roles & permissions</h1>
          <p className="staff-page_sub">
            {loading ? "Loading…" : `${roles.length} roles · ${totalPermissions} permissions · ${users} users with a role`}
          </p>
        </div>
      </header>

      {error ? (
        <section className="staff-card perm_state" role="alert">
          <p>{error}</p>
          <button type="button" className="staff-btn" onClick={onRetry}>Try again</button>
        </section>
      ) : loading || !role ? (
        <section className="staff-card perm_state">Loading roles…</section>
      ) : (
        <>
          <div className="perm_tabs" role="tablist" aria-label="Roles">
            {roles.map((r) => (
              <button
                key={r.roleId}
                type="button"
                role="tab"
                aria-selected={r.roleId === role.roleId}
                className={`perm_tab${r.roleId === role.roleId ? " is-active" : ""}`}
                onClick={() => onPickRole(r.roleId)}
              >
                {label(r.name)}
                <small>{r.permissions.length}</small>
              </button>
            ))}
          </div>

          <section className="staff-card perm_card">
            <div className="perm_head">
              <div>
                <h2>{label(role.name)}</h2>
                <p className="staff-page_sub">
                  {`${selected.length} of ${totalPermissions} permissions · ${role.usersCount} user${role.usersCount === 1 ? "" : "s"}`}
                </p>
              </div>
              {locked && <span className="perm_lock">Read-only: the Admin role can't be edited here</span>}
            </div>

            {notice && <p className="perm_notice" role="status">{notice}</p>}

            <div className="perm_tools">
              <label className="perm_search">
                <span className="material-symbols-outlined" aria-hidden="true">search</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search permissions"
                  aria-label="Search permissions"
                />
              </label>
              <button
                type="button"
                className="staff-btn staff-btn--ghost"
                disabled={Boolean(q)}
                onClick={() => setOpen(allOpen ? [] : visible.map((g) => g.key))}
              >
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </div>
          </section>

          {visible.length === 0 ? (
            <p className="staff-card perm_state" role="status">No permissions match “{query}”.</p>
          ) : (
            <div className="perm_groups">
              {visible.map((g) => {
                const full = groups.find((x) => x.key === g.key)?.items ?? g.items;
                const codes = full.map((p) => p.code);
                const onCount = codes.filter((c) => selected.includes(c)).length;
                const changes = codes.filter((c) => added.includes(c) || removed.includes(c)).length;
                const expanded = isOpen(g.key);
                const panel = `perm-panel-${g.key}`;
                return (
                  <section className={`perm_g${expanded ? " is-open" : ""}`} key={g.key}>
                    <div className="perm_g-head">
                      <button type="button" className="perm_g-toggle" aria-expanded={expanded} aria-controls={panel} onClick={() => flip(g.key)} disabled={Boolean(q)}>
                        <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
                        <strong>{g.title}</strong>
                        <span className="perm_g-count">{onCount}/{codes.length}</span>
                        {changes > 0 && <span className="perm_g-changed">{changes} changed</span>}
                      </button>
                      {!locked && (
                        <button
                          type="button"
                          className="perm_g-all"
                          disabled={saving}
                          onClick={() => setGroup(codes, onCount !== codes.length)}
                        >
                          {onCount === codes.length ? "Clear" : "Select all"}
                        </button>
                      )}
                    </div>
                    {expanded && (
                      <ul id={panel} className="perm_g-list">
                        {g.items.map((p) => {
                          const on = selected.includes(p.code);
                          const changed = added.includes(p.code) || removed.includes(p.code);
                          return (
                            <li key={p.code} className={changed ? "is-changed" : ""}>
                              <div>
                                <strong>{p.action || p.code}</strong>
                                <small>{p.description || p.code}</small>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={on}
                                aria-label={`${label(role.name)}: ${p.code}`}
                                disabled={locked || saving}
                                className={`staff-switch${on ? " is-on" : ""}`}
                                onClick={() => onToggle(p.code)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {dirty && !locked && (
            <div className="perm_bar" role="region" aria-label="Unsaved changes">
              <span>
                {confirming
                  ? `Apply to ${label(role.name)}: ${added.length} added, ${removed.length} removed?`
                  : `${added.length + removed.length} unsaved change${added.length + removed.length === 1 ? "" : "s"}`}
              </span>
              {saveError && <em role="alert">{saveError}</em>}
              {confirming ? (
                <>
                  <button type="button" className="staff-btn staff-btn--ghost" onClick={onCancelConfirm} disabled={saving}>Back</button>
                  <button type="button" className="staff-btn" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Confirm & save"}</button>
                </>
              ) : (
                <>
                  <button type="button" className="staff-btn staff-btn--ghost" onClick={onReset}>Discard</button>
                  <button type="button" className="staff-btn" onClick={onAskConfirm}>Save changes</button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export type { PermissionGroup, PermissionItem };
export default memo(PermissionsComponent);
