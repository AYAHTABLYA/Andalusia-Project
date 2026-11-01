type SessionStatus = "Live" | "Upcoming" | "Completed";
type AssignmentStatus = "Pending" | "Submitted" | "Graded";
type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

// One active enrollment of the learner. `id` IS the enrollment id (the API is keyed by it).
type WorkspaceCourse = {
  id: number;
  title: string;
  group: string; // batch / group code, "" when the API doesn't send one
  instructor: string; // "" when unknown
  progress: number; // 0-100
};

type WorkspaceSession = {
  id: string;
  courseId: number;
  courseTitle: string;
  title: string;
  group: string;
  instructor: string;
  students: number | null;
  start: string; // ISO
  durationMin: number;
  zoomUrl: string | null;
  location: string | null;
  attendance: AttendanceStatus | null; // null = not recorded yet
};

type WorkspaceAssignment = {
  id: string;
  courseId: number;
  courseTitle: string;
  title: string;
  description?: string;
  due: string; // ISO
  status: AssignmentStatus;
  score?: number;
  maxScore?: number;
  feedback?: string;
  submission?: string;
};

type WorkspaceMaterial = {
  id: string;
  courseId: number;
  courseTitle: string;
  title: string;
  description?: string;
  kind: string; // "pdf", "video", "link", ... (lower-case, "file" when unknown)
  url: string | null;
  addedAt: string | null; // ISO
};

type WorkspaceStats = {
  courseProgress: number;
  sessionsAttended: number;
  sessionsThisWeek: number;
  assignmentsDue: number;
  learningHours: number;
};

type WorkspaceData = {
  loading: boolean;
  error: string | null; // the enrollments call failed -> nothing can be shown
  warning: string | null; // some course data failed to load -> partial view
  courses: WorkspaceCourse[];
  sessions: WorkspaceSession[];
  assignments: WorkspaceAssignment[];
  materials: WorkspaceMaterial[];
  stats: WorkspaceStats;
  reload: () => void;
  submitAssignment: (id: string, text: string) => Promise<void>;
};

type WorkspaceOutletContext = { workspace: WorkspaceData; userName: string };

export type {
  SessionStatus,
  AssignmentStatus,
  AttendanceStatus,
  WorkspaceCourse,
  WorkspaceSession,
  WorkspaceAssignment,
  WorkspaceMaterial,
  WorkspaceStats,
  WorkspaceData,
  WorkspaceOutletContext,
};
