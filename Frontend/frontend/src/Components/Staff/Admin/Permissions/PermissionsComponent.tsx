import { memo } from "react";
import type { AdminRole } from "../../../../Types/Admin";

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

            {groups.map((g) => (
              <div className="perm_group" key={g.key}>
                <h3>{g.title}</h3>
                <ul>
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
              </div>
            ))}
          </section>

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
