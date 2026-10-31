import { useState } from "react";
import useStaffTable from "../../../hooks/staffHooks/useStaffTable";
import useTeachingRecords from "../../../hooks/staffHooks/useTeachingRecords";
import WorkspaceTableComponent from "../Shared/WorkspaceTable/WorkspaceTableComponent";
import { cairoDate } from "../time";

const COLUMNS = ["Course", "Batch", "Students", "Next session", "Status"];

type BatchRow = { scheduleId: number; course: string; batch: string; students: number; next: string };

// /instructor/courses: one row per batch assigned to the instructor (built from their sessions + learners).
export default function InstructorCourses() {
  const { data, loading, error } = useTeachingRecords();
  const [notice, setNotice] = useState("");

  const today = cairoDate();
  const groups = new Map<number, { course: string; batch: string; students: Set<number>; next: string }>();
  data.sessions.forEach((x) => {
    const g = groups.get(x.scheduleId) ?? { course: x.courseTitle, batch: x.batchCode || "—", students: new Set<number>(), next: "" };
    if (x.date >= today && (!g.next || x.date < g.next)) g.next = x.date;
    groups.set(x.scheduleId, g);
  });
  data.students.forEach((x) => {
    if (x.scheduleId == null) return;
    const g = groups.get(x.scheduleId) ?? { course: x.courseTitle, batch: "—", students: new Set<number>(), next: "" };
    g.students.add(x.id);
    groups.set(x.scheduleId, g);
  });
  const batches: BatchRow[] = Array.from(groups, ([scheduleId, g]) => ({ scheduleId, course: g.course, batch: g.batch, students: g.students.size, next: g.next }));

  const toRow = (b: BatchRow) => [b.course, b.batch, String(b.students), b.next || "—", b.next ? "Upcoming" : "No upcoming sessions"];
  const table = useStaffTable(batches, toRow);
  const ready = !loading && !error;

  return (
    <WorkspaceTableComponent
      eyebrow="TEACHING WORKSPACE"
      title="My courses"
      subtitle="The courses and batches assigned to you."
      icon="menu_book"
      stats={[
        { label: "Courses", value: ready ? new Set(batches.map((b) => b.course)).size : undefined, icon: "menu_book" },
        { label: "Batches", value: ready ? batches.length : undefined, icon: "layers" },
        { label: "Students", value: ready ? new Set(data.students.map((r) => r.id)).size : undefined, icon: "groups" },
      ]}
      columns={COLUMNS}
      rows={table.rows}
      query={table.query}
      onQueryChange={table.setQuery}
      onReset={() => table.setQuery("")}
      secondaryActions={[{ label: "Export courses", onClick: () => setNotice(table.exportCsv("my-courses.csv", COLUMNS) ? "" : "Nothing to export yet.") }]}
      notice={notice}
      error={error}
      loading={loading}
      emptyNote="Only courses assigned to your instructor account are shown here."
    />
  );
}
