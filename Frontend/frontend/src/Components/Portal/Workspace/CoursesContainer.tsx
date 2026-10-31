import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import CoursesComponent, { type CourseItem } from "./CoursesComponent";
import { sessionStatus } from "./helpers";

function CoursesContainer() {
  const { workspace } = useWorkspace();
  const { courses, sessions, assignments, loading } = workspace;

  const items: CourseItem[] = courses.map((course) => ({
    course,
    next: sessions.find((s) => s.courseId === course.id && sessionStatus(s) !== "Completed") ?? null,
    pending: assignments.filter((a) => a.courseId === course.id && a.status === "Pending").length,
  }));

  return <CoursesComponent loading={loading} items={items} />;
}

export default CoursesContainer;
