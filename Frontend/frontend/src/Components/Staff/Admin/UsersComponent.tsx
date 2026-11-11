import { memo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { AdminRole, AdminUser, CreateStaffUserBody } from "../../../Types/Admin";
import Select from "../../Shared/Select/Select";

type Props = {
  users: AdminUser[];
  roles: AdminRole[];
  loading: boolean;
  errorMessage?: string;
  message: { type: "error" | "success"; text: string } | null;
  currentUserId?: number;
  busyId: number | null;
  search: string;
  roleFilter: string;
  page: number;
  pageCount: number;
  showForm: boolean;
  form: CreateStaffUserBody;
  saving: boolean;
  onSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  onRoleFilter: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPage: (page: number) => void;
  onToggleForm: () => void;
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCreate: (e: FormEvent) => void;
  onChangeRole: (id: number, role: string) => void;
  onSetStatus: (id: number, isActive: boolean) => void;
  onRetry: () => void;
};

function UsersComponent({
  users, roles, loading, errorMessage, message, currentUserId, busyId, search, roleFilter,
  page, pageCount, showForm, form, saving,
  onSearch, onRoleFilter, onPage, onToggleForm, onFormChange, onCreate, onChangeRole, onSetStatus, onRetry,
}: Props) {
  return (
    <>
      <div className="staff-page_head">
        <div>
          <h1 className="staff-page_title">Users &amp; Roles</h1>
          <p className="staff-page_sub">Public sign-up always creates a Learner. Staff accounts are created here.</p>
        </div>
        <button type="button" className="staff-btn" onClick={onToggleForm}>
          {showForm ? "Close" : "New staff account"}
        </button>
      </div>

      {message && (
        <p className={message.type === "error" ? "staff-error" : "staff-page_sub"} role="status">
          {message.text}
        </p>
      )}

      {showForm && (
        <form className="staff-card" onSubmit={onCreate}>
          <div className="staff-form">
            <input className="staff-input" name="firstName" placeholder="First name" value={form.firstName} onChange={onFormChange} required maxLength={50} />
            <input className="staff-input" name="lastName" placeholder="Last name" value={form.lastName} onChange={onFormChange} required maxLength={50} />
            <input className="staff-input" name="email" type="email" placeholder="Email" value={form.email} onChange={onFormChange} required />
            <input className="staff-input" name="mobileNumber" type="tel" placeholder="Mobile" value={form.mobileNumber} onChange={onFormChange} required />
            <input className="staff-input" name="temporaryPassword" type="password" placeholder="Temporary password (min 8)" value={form.temporaryPassword} onChange={onFormChange} required minLength={8} />
            <Select className="staff-select" name="role" value={form.role} onChange={onFormChange}>
              {roles.map((r) => (
                <option key={r.roleId} value={r.name}>{r.name}</option>
              ))}
            </Select>
          </div>
          <button type="submit" className="staff-btn" disabled={saving}>
            {saving ? "Creating..." : "Create account"}
          </button>
        </form>
      )}

      <div className="staff-card" style={{ marginTop: "1rem" }}>
        <div className="staff-toolbar">
          <input className="staff-input" type="search" placeholder="Search name or email" value={search} onChange={onSearch} aria-label="Search users" />
          <Select className="staff-select" value={roleFilter} onChange={onRoleFilter} aria-label="Filter by role">
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r.roleId} value={r.name}>{r.name} ({r.usersCount})</option>
            ))}
          </Select>
        </div>

        {errorMessage ? (
          <p className="staff-error">
            {errorMessage}{" "}
            <button type="button" className="staff-btn staff-btn--ghost" onClick={onRetry}>Retry</button>
          </p>
        ) : loading && users.length === 0 ? (
          <p className="staff-page_sub">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="staff-page_sub">No users match your filters.</p>
        ) : (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u.userId === currentUserId;
                  const busy = busyId === u.userId;
                  return (
                    <tr key={u.userId}>
                      <td>{u.fullName}{isMe && " (you)"}</td>
                      <td>{u.email}</td>
                      <td>
                        <Select
                          className="staff-select"
                          value={u.role}
                          disabled={isMe || busy}
                          onChange={(e) => onChangeRole(u.userId, e.target.value)}
                          aria-label={`Role for ${u.fullName}`}
                        >
                          {roles.map((r) => (
                            <option key={r.roleId} value={r.name}>{r.name}</option>
                          ))}
                        </Select>
                      </td>
                      <td>
                        <span className={`staff-pill${u.isActive ? "" : " staff-pill--off"}`}>
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="staff-btn staff-btn--ghost"
                          disabled={busy || (isMe && u.isActive)}
                          onClick={() => onSetStatus(u.userId, !u.isActive)}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 && (
          <div className="staff-toolbar" style={{ marginTop: "1rem" }}>
            <button type="button" className="staff-btn staff-btn--ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
            <span className="staff-page_sub">Page {page} of {pageCount}</span>
            <button type="button" className="staff-btn staff-btn--ghost" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {roles.length > 0 && (
        <div className="staff-grid" style={{ marginTop: "1rem" }}>
          {roles.map((r) => (
            <div key={r.roleId} className="staff-card">
              <strong>{r.name}</strong> <span className="staff-page_sub">· {r.usersCount} users</span>
              <div className="staff-perms">
                {r.permissions.map((p) => (
                  <span key={p} className="staff-perm">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default memo(UsersComponent);
