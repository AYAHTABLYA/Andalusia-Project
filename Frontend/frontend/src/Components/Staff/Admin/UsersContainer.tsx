import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import UsersComponent from "./UsersComponent";
import useApi from "../../../hooks/academyHooks/useApi";
import useDebouncedValue from "../../../hooks/academyHooks/useDebouncedValue";
import { ApiError } from "../../../apis/academyApi";
import { changeUserRole, createStaffUser, getRoles, getUsers, setUserStatus } from "../../../apis/adminApi";
import { getStoredUser } from "../../../utils/session";
import type { CreateStaffUserBody } from "../../../Types/Admin";

const EMPTY_FORM: CreateStaffUserBody = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  temporaryPassword: "",
  role: "Instructor",
};

const PAGE_SIZE = 20;

function UsersContainer() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateStaffUserBody>(EMPTY_FORM);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const currentUserId = getStoredUser()?.id;

  const roles = useApi((signal) => getRoles(signal), []);
  const users = useApi(
    (signal) => getUsers({ search: debouncedSearch, role: roleFilter, page, pageSize: PAGE_SIZE }, signal),
    [debouncedSearch, roleFilter, page],
  );

  const fail = (error: unknown) =>
    setMessage({
      type: "error",
      text: error instanceof ApiError ? error.message : "The request failed. Please try again.",
    });

  const run = async (id: number, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    setMessage(null);
    try {
      await action();
      setMessage({ type: "success", text: success });
      users.reload();
      roles.reload();
    } catch (error) {
      fail(error);
    } finally {
      setBusyId(null);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await createStaffUser(form);
      setMessage({ type: "success", text: `Account created for ${form.email}.` });
      setForm(EMPTY_FORM);
      setShowForm(false);
      users.reload();
      roles.reload();
    } catch (error) {
      fail(error);
    } finally {
      setSaving(false);
    }
  };

  const total = users.data?.count ?? 0;

  return (
    <UsersComponent
      users={users.data?.data ?? []}
      roles={roles.data ?? []}
      loading={users.loading}
      errorMessage={users.error?.message}
      message={message}
      currentUserId={currentUserId}
      busyId={busyId}
      search={search}
      roleFilter={roleFilter}
      page={page}
      pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      showForm={showForm}
      form={form}
      saving={saving}
      onSearch={handleSearch}
      onRoleFilter={handleRoleFilter}
      onPage={setPage}
      onToggleForm={() => setShowForm((v) => !v)}
      onFormChange={handleFormChange}
      onCreate={handleCreate}
      onChangeRole={(id, role) => run(id, () => changeUserRole(id, role), "Role updated.")}
      onSetStatus={(id, isActive) =>
        run(id, () => setUserStatus(id, isActive), isActive ? "User activated." : "User deactivated.")
      }
      onRetry={users.reload}
    />
  );
}

export default UsersContainer;
