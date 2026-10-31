import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../apis/academyApi";
import { getActiveEnrollments, loadCourse, submitAssignment as submitAssignmentRequest } from "../../apis/learnerApi";
import type {
  WorkspaceAssignment,
  WorkspaceCourse,
  WorkspaceData,
  WorkspaceMaterial,
  WorkspaceSession,
  WorkspaceStats,
} from "../../Types/Workspace";

// All of the learner's workspace data, loaded once per visit from the real API
// (enrollments -> per-enrollment progress / sessions / assignments / materials / attendance).
function useWorkspaceData(): WorkspaceData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [courses, setCourses] = useState<WorkspaceCourse[]>([]);
  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [assignments, setAssignments] = useState<WorkspaceAssignment[]>([]);
  const [materials, setMaterials] = useState<WorkspaceMaterial[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const enrollments = await getActiveEnrollments();
        const bundles = await Promise.all(enrollments.map((e) => loadCourse(e)));
        if (cancelled) return;

        setCourses(bundles.map((b) => b.course));
        setSessions(
          bundles.flatMap((b) => b.sessions).sort((a, b) => +new Date(a.start) - +new Date(b.start)),
        );
        setAssignments(bundles.flatMap((b) => b.assignments));
        setMaterials(
          bundles
            .flatMap((b) => b.materials)
            .sort((a, b) => +new Date(b.addedAt ?? 0) - +new Date(a.addedAt ?? 0)),
        );

        const failed = bundles.filter((b) => b.failed.length);
        setWarning(
          failed.length
            ? `Some data could not be loaded for ${failed.map((b) => b.course.title).join(", ")} (${[
                ...new Set(failed.flatMap((b) => b.failed)),
              ].join(", ")}).`
            : null,
        );
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Could not load your workspace."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Saves on the server first; the local copy only changes once the API accepted it.
  const submitAssignment = useCallback(async (id: string, text: string) => {
    await submitAssignmentRequest(id, text);
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Submitted", submission: text } : a)),
    );
  }, []);

  const stats = useMemo<WorkspaceStats>(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 864e5;
    const attended = sessions.filter((s) => s.attendance === "Present" || s.attendance === "Late");
    return {
      courseProgress: courses.length
        ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
        : 0,
      sessionsAttended: attended.length,
      sessionsThisWeek: attended.filter((s) => +new Date(s.start) > weekAgo && +new Date(s.start) <= now).length,
      assignmentsDue: assignments.filter((a) => a.status === "Pending").length,
      learningHours: attended.reduce((sum, s) => sum + s.durationMin / 60, 0),
    };
  }, [courses, sessions, assignments]);

  return { loading, error, warning, courses, sessions, assignments, materials, stats, reload, submitAssignment };
}

export default useWorkspaceData;
