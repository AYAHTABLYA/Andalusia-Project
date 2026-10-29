import { useEffect, useMemo, useState } from "react";
import { getRoles } from "../../../../apis/adminApi";
import { getPermissionCatalog, updateRolePermissions, type PermissionDto } from "../../../../apis/staffAdminApi";
import { getErrorMessage } from "../../../../apis/academyApi";
import type { AdminRole } from "../../../../Types/Admin";
import useStaffData from "../../../../hooks/staffHooks/useStaffData";
import PermissionsComponent, { type PermissionGroup } from "./PermissionsComponent";

const NO_ROLES: AdminRole[] = [];
const NO_CATALOG: PermissionDto[] = [];

const titleCase = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

// /admin/permissions (Admin only): pick ONE role, then switch its permissions on/off and save.
// The API stays the authority for enforcement; this page only edits the assignments.
function PermissionsContainer() {
  const roles = useStaffData((signal) => getRoles(signal), NO_ROLES, "Could not load roles.");
  const catalog = useStaffData((signal) => getPermissionCatalog(signal), NO_CATALOG, "Could not load permissions.");

  const [roleId, setRoleId] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  const role = roles.data.find((r) => r.roleId === roleId) ?? null;

  // First load: open the first role. After a reload: keep the same role, refresh its saved state.
  useEffect(() => {
    if (!roles.data.length) return;
    const current = roles.data.find((r) => r.roleId === roleId) ?? roles.data[0];
    setRoleId(current.roleId);
    setSelected(current.permissions);
  }, [roles.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const descriptions = useMemo(() => new Map(catalog.data.map((p) => [p.code, p.description])), [catalog.data]);

  const groups = useMemo<PermissionGroup[]>(() => {
    const codes = new Set([...catalog.data.map((p) => p.code), ...roles.data.flatMap((r) => r.permissions)]);
    const byPrefix = new Map<string, PermissionGroup>();
    [...codes].sort().forEach((code) => {
      const prefix = code.split(".")[0];
      const group: PermissionGroup = byPrefix.get(prefix) ?? { key: prefix, title: titleCase(prefix), items: [] };
      group.items.push({ code, action: code.split(".").slice(1).join("."), description: descriptions.get(code) ?? "" });
      byPrefix.set(prefix, group);
    });
    return [...byPrefix.values()];
  }, [catalog.data, roles.data, descriptions]);

  const saved = role?.permissions ?? [];
  const added = selected.filter((p) => !saved.includes(p));
  const removed = saved.filter((p) => !selected.includes(p));
  // The Admin role stays read-only so an admin cannot lock everyone out by mistake.
  const locked = role?.name === "Admin";

  function pickRole(id: number) {
    const next = roles.data.find((r) => r.roleId === id);
    if (!next) return;
    setRoleId(id);
    setSelected(next.permissions);
    setConfirming(false);
    setSaveError("");
    setNotice("");
  }

  const toggle = (code: string) => {
    setConfirming(false);
    setNotice("");
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  async function save() {
    if (!role || locked) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateRolePermissions(role.roleId, selected);
      setNotice(`Permissions updated for ${role.name.replace(/_/g, " ")}.`);
      setConfirming(false);
      roles.reload();
    } catch (e) {
      setSaveError(getErrorMessage(e, "Could not update this role."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PermissionsComponent
      loading={roles.loading || catalog.loading}
      error={roles.error || catalog.error}
      roles={roles.data}
      role={role}
      groups={groups}
      selected={selected}
      added={added}
      removed={removed}
      locked={locked}
      confirming={confirming}
      saving={saving}
      saveError={saveError}
      notice={notice}
      onPickRole={pickRole}
      onToggle={toggle}
      onReset={() => { setSelected(saved); setConfirming(false); setSaveError(""); }}
      onAskConfirm={() => setConfirming(true)}
      onCancelConfirm={() => setConfirming(false)}
      onSave={save}
      onRetry={() => { roles.reload(); catalog.reload(); }}
    />
  );
}

export default PermissionsContainer;
