import type { AdminRole } from "../../../../Types/Admin";

// Read-only matrix: one row per permission key, one column per role.
function PermissionMatrixComponent({ roles }: { roles: AdminRole[] }) {
  const keys = [...new Set(roles.flatMap((r) => r.permissions))].sort();
  return (
    <div className="staff-table-wrap staff-matrix">
      <table className="staff-table">
        <thead>
          <tr>
            <th>Permission key</th>
            {roles.map((r) => <th key={r.roleId} className="staff-matrix_role">{r.name.replace(/_/g, " ")}</th>)}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <td>{key}</td>
              {roles.map((r) => {
                const on = r.permissions.includes(key);
                return (
                  <td key={r.roleId} className="staff-matrix_cell">
                    <span className={`staff-switch${on ? " is-on" : ""}`} role="img" aria-label={`${r.name}: ${key} ${on ? "allowed" : "not allowed"}`} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PermissionMatrixComponent;
