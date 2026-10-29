import { useState } from "react";
import { getAdminInstructors, setAdminInstructorStatus } from "../../../../apis/staffAdminApi";
import type { AdminInstructorDto } from "../../../../apis/staffAdminApi";
import type { Paginated } from "../../../../Types/Paginated";
import useIsCoordinator from "../../../../hooks/staffHooks/useIsCoordinator";
import useStaffData from "../../../../hooks/staffHooks/useStaffData";
import useStaffTable from "../../../../hooks/staffHooks/useStaffTable";
import WorkspaceTableComponent from "../../Shared/WorkspaceTable/WorkspaceTableComponent";
import { AddPersonDialog } from "../../Shared/StaffActionDialogs";

const COLUMNS = ["Instructor", "Specialization", "Teaching load", "Email", "Status"];
const EMPTY: Paginated<AdminInstructorDto> = { pageIndex: 1, pageSize: 100, count: 0, data: [] };

const toRow = (i: AdminInstructorDto) => [
  i.fullName,
  i.jobTitle || "—",
  `${i.schedulesCount} ${i.schedulesCount === 1 ? "batch" : "batches"}`,
  i.email || "—",
  i.isActive ? "Active" : "Inactive",
];

// /admin/instructors and /coordinator/instructors.
// Admin can add instructors and activate / deactivate them; a Coordinator only reviews them.
function InstructorsContainer() {
  const isCoordinator = useIsCoordinator();
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data, loading, error, reload } = useStaffData(
    (signal) => getAdminInstructors({ page: 1, pageSize: 100 }, signal),
    EMPTY,
    "Could not load instructors.",
  );
  const table = useStaffTable(data.data, toRow);
  const ready = !loading && !error;

  async function toggleStatus(instructor: AdminInstructorDto) {
    setBusyId(instructor.id);
    setNotice("");
    try {
      await setAdminInstructorStatus(instructor.id, !instructor.isActive);
      setNotice(`${instructor.fullName} is now ${instructor.isActive ? "inactive" : "active"}.`);
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not update this instructor.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <WorkspaceTableComponent
      eyebrow="ACADEMY MANAGEMENT"
      title="Instructors"
      subtitle="Manage, review, and keep every record up to date."
      icon="school"
      stats={[
        { label: "Total instructors", value: ready ? data.count : undefined, icon: "groups" },
        { label: "Active", value: ready ? data.data.filter((i) => i.isActive).length : undefined, icon: "verified_user" },
        { label: "Teaching load", value: ready ? data.data.reduce((sum, i) => sum + i.schedulesCount, 0) : undefined, icon: "calendar_month" },
      ]}
      columns={COLUMNS}
      rows={table.rows}
      query={table.query}
      onQueryChange={table.setQuery}
      onReset={() => table.setQuery("")}
      primaryAction={isCoordinator ? undefined : { label: "Add instructor", icon: "add", onClick: () => { setNotice(""); setAdding(true); } }}
      secondaryActions={[{ label: "Export list", onClick: () => setNotice(table.exportCsv("instructors.csv", COLUMNS) ? "" : "Nothing to export yet.") }]}
      notice={notice}
      error={error}
      loading={loading}
      emptyNote="No instructors yet. Use “Add instructor” to create the first account."
      peopleColumn
      rowActions={
        isCoordinator
          ? undefined
          : (i) => {
              const instructor = table.visible[i];
              return (
                <span className="staff-row-actions">
                  <button className="staff-workspace-secondary" disabled={busyId === instructor.id} onClick={() => void toggleStatus(instructor)}>
                    {instructor.isActive ? "Deactivate" : "Activate"}
                  </button>
                </span>
              );
            }
      }
    >
      {adding && (
        <AddPersonDialog
          kind="instructor"
          onClose={() => setAdding(false)}
          onDone={(message) => { setAdding(false); setNotice(message); reload(); }}
        />
      )}
    </WorkspaceTableComponent>
  );
}

export default InstructorsContainer;
