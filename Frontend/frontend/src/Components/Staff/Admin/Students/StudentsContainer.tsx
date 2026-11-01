import { useEffect, useState } from "react";
import { getStaffStudents } from "../../../../apis/staffApi";
import type { StaffStudentDto } from "../../../../apis/staffApi";
import { getScheduleProgress } from "../../../../apis/staffAdminApi";
import useIsCoordinator from "../../../../hooks/staffHooks/useIsCoordinator";
import useStaffData from "../../../../hooks/staffHooks/useStaffData";
import useStaffTable from "../../../../hooks/staffHooks/useStaffTable";
import WorkspaceTableComponent from "../../Shared/WorkspaceTable/WorkspaceTableComponent";
import { AddPersonDialog } from "../../Shared/StaffActionDialogs";

const COLUMNS = ["Student", "Course", "Progress", "Enrolled", "Status"];
const EMPTY: StaffStudentDto[] = [];
const isActiveEnrollment = (status: string | number) => ["active", "enrolled"].includes(String(status).toLowerCase());

// /admin/students and /coordinator/students.
// The list loads first; the Progress column is filled afterwards (one progress call per batch).
function StudentsContainer() {
  const isCoordinator = useIsCoordinator();
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());

  const { data, loading, error, reload } = useStaffData(
    (signal) => getStaffStudents(undefined, signal),
    EMPTY,
    "Could not load students.",
  );

  useEffect(() => {
    const scheduleIds = [...new Set(data.map((r) => r.scheduleId).filter((id): id is number => id != null))].slice(0, 40);
    if (!scheduleIds.length) return;
    const controller = new AbortController();
    const map = new Map<string, number>();
    Promise.all(
      scheduleIds.map((id) =>
        getScheduleProgress(id, controller.signal)
          .then((p) => p.learners.forEach((l) => map.set(`${id}:${l.learnerId}`, l.progress.overallPercentage)))
          .catch(() => undefined),
      ),
    ).then(() => {
      if (!controller.signal.aborted) setProgress(map);
    });
    return () => controller.abort();
  }, [data]);

  const toRow = (r: StaffStudentDto) => {
    const pct = r.scheduleId != null ? progress.get(`${r.scheduleId}:${r.id}`) : undefined;
    return [
      `${r.name} (${r.email})`,
      r.courseTitle || "—",
      pct != null ? `${Math.round(pct)}%` : "—",
      new Date(r.enrolledAt).toLocaleDateString(),
      String(r.status).replaceAll("_", " "),
    ];
  };
  const table = useStaffTable(data, toRow);
  const ready = !loading && !error;

  return (
    <WorkspaceTableComponent
      eyebrow="ACADEMY MANAGEMENT"
      title="Students"
      subtitle="Manage, review, and keep every record up to date."
      icon="groups"
      stats={[
        { label: "Students", value: ready ? new Set(data.map((r) => r.id)).size : undefined, icon: "groups" },
        { label: "Active enrollments", value: ready ? data.filter((r) => isActiveEnrollment(r.status)).length : undefined, icon: "school" },
        { label: "Needs attention", value: ready ? data.filter((r) => !isActiveEnrollment(r.status)).length : undefined, icon: "flag" },
      ]}
      columns={COLUMNS}
      rows={table.rows}
      query={table.query}
      onQueryChange={table.setQuery}
      onReset={() => table.setQuery("")}
      primaryAction={isCoordinator ? undefined : { label: "Add student", icon: "add", onClick: () => { setNotice(""); setAdding(true); } }}
      secondaryActions={[{ label: "Export list", onClick: () => setNotice(table.exportCsv("students.csv", COLUMNS) ? "" : "Nothing to export yet.") }]}
      notice={notice}
      error={error}
      loading={loading}
      emptyNote="No enrolled students yet. Coordinators enroll students from the Courses page."
      peopleColumn
    >
      {adding && (
        <AddPersonDialog
          kind="student"
          onClose={() => setAdding(false)}
          onDone={(message) => { setAdding(false); setNotice(message); reload(); }}
        />
      )}
    </WorkspaceTableComponent>
  );
}

export default StudentsContainer;
