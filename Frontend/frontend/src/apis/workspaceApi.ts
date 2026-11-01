// Data source for "My Workspace". Courses come from the real enrollments API;
// sessions, assignments and messages are served from workspaceMock until the
// backend exposes /api/workspace/*. Swap the bodies below, keep the signatures.
import { getMyEnrollments } from "./portalRecordsApi";
import {
  DEMO_ENROLLMENT_TITLES,
  buildAssignments,
  buildConversations,
  buildCourses,
  buildSessions,
} from "./workspaceMock";
import type {
  Conversation,
  WorkspaceAssignment,
  WorkspaceCourse,
  WorkspaceSession,
} from "../Types/Workspace";

// Enrollment statuses that no longer give access to the workspace.
const INACTIVE = ["cancelled", "canceled", "rejected", "withdrawn", "dropped", "completed", "expired"];
const isActive = (status: string) => !INACTIVE.includes(status.toLowerCase());

// GET /api/enrollments -> titles of the learner's ACTIVE enrollments only.
async function getActiveCourseTitles(): Promise<string[]> {
  const list = await getMyEnrollments();
  const titles = list
    .filter((e) => isActive(e.status))
    .map((e) => e.courseTitle ?? e.programTitle)
    .filter((t): t is string => !!t);
  return [...new Set(titles)];
}

const getDemoCourseTitles = (): string[] => DEMO_ENROLLMENT_TITLES;

const getWorkspaceCourses = async (titles: string[]): Promise<WorkspaceCourse[]> => buildCourses(titles);

const getWorkspaceSessions = async (courses: WorkspaceCourse[], studentName: string): Promise<WorkspaceSession[]> =>
  buildSessions(courses, studentName);

const getWorkspaceAssignments = async (courses: WorkspaceCourse[]): Promise<WorkspaceAssignment[]> =>
  buildAssignments(courses);

const getWorkspaceConversations = async (courses: WorkspaceCourse[], studentName: string): Promise<Conversation[]> =>
  buildConversations(courses, studentName);

export {
  getActiveCourseTitles,
  getDemoCourseTitles,
  getWorkspaceCourses,
  getWorkspaceSessions,
  getWorkspaceAssignments,
  getWorkspaceConversations,
};
