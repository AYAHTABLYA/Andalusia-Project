import useStaffTable from "../../../hooks/staffHooks/useStaffTable";
import useTeachingRecords from "../../../hooks/staffHooks/useTeachingRecords";
import type { StaffStudentDto } from "../../../apis/staffApi";
import WorkspaceTableComponent from "../Shared/WorkspaceTable/WorkspaceTableComponent";
import { useState } from "react";

const COLUMNS = ["Student", "Course", "Batch", "Enrolled", "Status"];
const isActiveEnrollment = (status: string | number) => ["active", "enrolled"].includes(String(status).toLowerCase());

// /instructor/students: only learners a Coordinator enrolled in this instructor's batches (the API enforces it).
export default function InstructorStudents() {
  const { data, loading, error } = useTeachingRecords();
  const [notice, setNotice] = useState("");
  const batchOf = new Map(data.sessions.map((x) => [x.scheduleId, x.batchCode]));

  const toRow = (r: StaffStudentDto) => [
    `${r.name} (${r.email})`,
    r.courseTitle || "—",
    (r.scheduleId != null && batchOf.get(r.scheduleId)) || "—",
    new Date(r.enrolledAt).toLocaleDateString(),
    String(r.status).replaceAll("_", " "),
  ];
  const table = useStaffTable(data.students, toRow);
  const ready = !loading && !error;

  return (
    <WorkspaceTableComponent
      eyebrow="TEACHING WORKSPACE"
      title="My students"
      subtitle="Learners with an approved enrollment in your courses."
      icon="groups"
      stats={[
        { label: "Students", value: ready ? new Set(data.students.map((r) => r.id)).size : undefined, icon: "groups" },
        { label: "Active enrollments", value: ready ? data.students.filter((r) => isActiveEnrollment(r.status)).length : undefined, icon: "task_alt" },
        { label: "Courses", value: ready ? new Set(data.students.map((r) => r.courseTitle)).size : undefined, icon: "menu_book" },
      ]}
      columns={COLUMNS}
      rows={table.rows}
      query={table.query}
      onQueryChange={table.setQuery}
      onReset={() => table.setQuery("")}
      secondaryActions={[{ label: "Export students", onClick: () => setNotice(table.exportCsv("my-students.csv", COLUMNS) ? "" : "Nothing to export yet.") }]}
      notice={notice}
      error={error}
      loading={loading}
      emptyNote="You only see learners assigned to you through an approved enrollment."
      peopleColumn
    />
  );
}
