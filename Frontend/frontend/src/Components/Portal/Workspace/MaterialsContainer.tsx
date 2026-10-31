import { useMemo } from "react";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import MaterialsComponent, { type MaterialGroup } from "./MaterialsComponent";

// Course materials (files, links, videos) grouped by course, newest first.
function MaterialsContainer() {
  const { workspace } = useWorkspace();
  const { courses, materials, loading } = workspace;

  const groups = useMemo<MaterialGroup[]>(
    () =>
      courses
        .map((course) => ({ course, items: materials.filter((m) => m.courseId === course.id) }))
        .filter((g) => g.items.length > 0),
    [courses, materials],
  );

  return <MaterialsComponent loading={loading} groups={groups} />;
}

export default MaterialsContainer;
