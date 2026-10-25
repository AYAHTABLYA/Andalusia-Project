type SessionStatus = "Live" | "Upcoming" | "Completed";
type AssignmentStatus = "Pending" | "Submitted" | "Graded";

type WorkspaceCourse = {
  id: number;
  title: string;
  group: string;
  instructor: string;
  progress: number; // 0-100
  nextSessionId: string | null;
};

type ClassComment = {
  id: string;
  author: string;
  role: "Instructor" | "Student";
  text: string;
  at: string; // ISO
};

type WorkspaceSession = {
  id: string;
  courseId: number;
  courseTitle: string;
  group: string;
  instructor: string;
  students: number;
  start: string; // ISO
  durationMin: number;
  zoomUrl: string | null;
  comments: ClassComment[];
};

type WorkspaceAssignment = {
  id: string;
  courseId: number;
  courseTitle: string;
  title: string;
  due: string; // ISO
  status: AssignmentStatus;
  score?: number;
  maxScore?: number;
  feedback?: string;
  submission?: string;
};

type ChatMessage = { id: string; from: "me" | "them"; author: string; text: string; at: string };

type Conversation = {
  id: string;
  name: string;
  subtitle: string;
  unread: number;
  messages: ChatMessage[];
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
  isDemo: boolean;
  courses: WorkspaceCourse[];
  sessions: WorkspaceSession[];
  assignments: WorkspaceAssignment[];
  conversations: Conversation[];
  stats: WorkspaceStats;
  submitAssignment: (id: string, text: string) => void;
  postComment: (sessionId: string, text: string, author: string) => void;
  sendMessage: (conversationId: string, text: string, author: string) => void;
  markRead: (conversationId: string) => void;
};

type WorkspaceOutletContext = { workspace: WorkspaceData; userName: string };

export type {
  SessionStatus,
  AssignmentStatus,
  WorkspaceCourse,
  ClassComment,
  WorkspaceSession,
  WorkspaceAssignment,
  ChatMessage,
  Conversation,
  WorkspaceStats,
  WorkspaceData,
  WorkspaceOutletContext,
};
