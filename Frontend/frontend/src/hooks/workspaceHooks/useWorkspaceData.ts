import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getActiveCourseTitles,
  getDemoCourseTitles,
  getWorkspaceAssignments,
  getWorkspaceConversations,
  getWorkspaceCourses,
  getWorkspaceSessions,
} from "../../apis/workspaceApi";
import type {
  Conversation,
  WorkspaceAssignment,
  WorkspaceCourse,
  WorkspaceData,
  WorkspaceSession,
  WorkspaceStats,
} from "../../Types/Workspace";

const BASE_ATTENDED = 14; // mock until attendance is exposed by the API
const BASE_HOURS = 26;

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function useWorkspaceData(studentName: string): WorkspaceData {
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [courses, setCourses] = useState<WorkspaceCourse[]>([]);
  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [assignments, setAssignments] = useState<WorkspaceAssignment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    let cancelled = false;
    const name = studentName || "Student";

    async function hydrate(titles: string[], demo: boolean) {
      const c = await getWorkspaceCourses(titles);
      const [sess, assign, convs] = await Promise.all([
        getWorkspaceSessions(c, name),
        getWorkspaceAssignments(c),
        getWorkspaceConversations(c, name),
      ]);
      if (cancelled) return;
      setCourses(c);
      setSessions(sess);
      setAssignments(assign);
      setConversations(convs);
      setIsDemo(demo);
      setLoading(false);
    }

    getActiveCourseTitles()
      .then((titles) => hydrate(titles, false))
      // API unreachable (local dev without the backend): show the demo course.
      .catch(() => hydrate(getDemoCourseTitles(), true));

    return () => {
      cancelled = true;
    };
    // studentName only seeds mock comment authors; do not refetch when it refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAssignment = useCallback((id: string, text: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Submitted", submission: text } : a)),
    );
  }, []);

  const postComment = useCallback((sessionId: string, text: string, author: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              comments: [
                ...s.comments,
                { id: newId(), author, role: "Student", text, at: new Date().toISOString() },
              ],
            }
          : s,
      ),
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string, author: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: newId(), from: "me", author, text, at: new Date().toISOString() },
              ],
            }
          : c,
      ),
    );
  }, []);

  const markRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId && c.unread ? { ...c, unread: 0 } : c)),
    );
  }, []);

  const stats = useMemo<WorkspaceStats>(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 864e5;
    const done = sessions.filter((s) => +new Date(s.start) + s.durationMin * 6e4 < now);
    return {
      courseProgress: courses.length
        ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
        : 0,
      sessionsAttended: BASE_ATTENDED + done.length,
      sessionsThisWeek: done.filter((s) => +new Date(s.start) > weekAgo).length,
      assignmentsDue: assignments.filter((a) => a.status === "Pending").length,
      learningHours: BASE_HOURS + done.reduce((sum, s) => sum + s.durationMin / 60, 0),
    };
  }, [courses, sessions, assignments]);

  return {
    loading,
    isDemo,
    courses,
    sessions,
    assignments,
    conversations,
    stats,
    submitAssignment,
    postComment,
    sendMessage,
    markRead,
  };
}

export default useWorkspaceData;
