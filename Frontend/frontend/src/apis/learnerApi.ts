// Learner LMS: everything "My Workspace" shows comes from here (no sample data).
//   GET  /api/learner/enrollments/{id}/materials | sessions | assignments | attendance | progress
//   POST /api/learner/assignments/{id}/submit
// Paths live in urls.json. The mappers below accept camelCase or PascalCase and a few
// common field names, so a small DTO rename on the API does not blank the screens.
// If a screen shows empty data, compare the raw response (Network tab) with the pick(...) lists here.
import { API_BASE_URL, apiGet, apiPost } from "./academyApi";
import { getMyEnrollments, type EnrollmentDto } from "./portalRecordsApi";
import urls from "./urls.json";
import type {
  AssignmentStatus,
  AttendanceStatus,
  WorkspaceAssignment,
  WorkspaceCourse,
  WorkspaceMaterial,
  WorkspaceSession,
} from "../Types/Workspace";

type Raw = Record<string, any>;

const withId = (path: string, id: string | number) => path.replace(":id", encodeURIComponent(String(id)));

// First defined, non-empty value among the given keys (tries camelCase, then PascalCase).
function pick<T = any>(o: Raw | null | undefined, ...keys: string[]): T | undefined {
  if (!o) return undefined;
  for (const k of keys) {
    for (const key of [k, k.charAt(0).toUpperCase() + k.slice(1)]) {
      const v = o[key];
      if (v !== undefined && v !== null && v !== "") return v as T;
    }
  }
  return undefined;
}
const str = (o: Raw | null | undefined, ...keys: string[]) => {
  const v = pick(o, ...keys);
  return v === undefined ? "" : String(v);
};
const num = (o: Raw | null | undefined, ...keys: string[]) => {
  const v = pick(o, ...keys);
  const n = v === undefined ? NaN : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Accepts [..] or a paged/wrapped body { items | data | results: [..] }.
function toList(body: unknown): Raw[] {
  if (Array.isArray(body)) return body;
  const inner = pick<unknown>(body as Raw, "items", "data", "results", "value");
  return Array.isArray(inner) ? inner : [];
}

// ---------- courses ----------
const INACTIVE = ["cancelled", "canceled", "rejected", "withdrawn", "dropped", "completed", "expired"];
const isActive = (e: EnrollmentDto) => !INACTIVE.includes(String(e.status).toLowerCase());

async function getActiveEnrollments(): Promise<EnrollmentDto[]> {
  const list = await getMyEnrollments();
  return list.filter((e) => isActive(e) && (e.courseTitle ?? e.programTitle));
}

const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function mapProgress(body: unknown): number {
  if (typeof body === "number") return clampPct(body);
  const o = body as Raw;
  const pct = num(o, "progressPercentage", "progressPercent", "percentage", "percent", "progress", "completionRate", "completion");
  if (pct !== undefined) return clampPct(pct <= 1 && pct > 0 ? pct * 100 : pct);
  const done = num(o, "completedItems", "completedSessions", "completed");
  const total = num(o, "totalItems", "totalSessions", "total");
  return done !== undefined && total ? clampPct((done / total) * 100) : 0;
}

// ---------- sessions ----------
// Start = full ISO (`start`, `startAt`, `startsAt`) or `date` + `startTime` ("2026-10-21" + "09:30:00").
const safeIso = (value: string): string => {
  const d = new Date(value);
  return Number.isNaN(+d) ? "" : d.toISOString();
};
function toIso(date?: string, time?: string): string {
  if (!date) return "";
  if (!time || date.includes("T")) return safeIso(date);
  return safeIso(`${date.slice(0, 10)}T${time.length === 5 ? `${time}:00` : time}`) || safeIso(date);
}
function minutesBetween(date: string, from?: string, to?: string): number | undefined {
  if (!from || !to) return undefined;
  const a = new Date(`${date.slice(0, 10)}T${from.length === 5 ? `${from}:00` : from}`);
  const b = new Date(`${date.slice(0, 10)}T${to.length === 5 ? `${to}:00` : to}`);
  const m = Math.round((+b - +a) / 60000);
  return Number.isFinite(m) && m > 0 ? m : undefined;
}

function mapSession(raw: Raw, course: WorkspaceCourse): WorkspaceSession | null {
  const date = str(raw, "date", "sessionDate");
  const startTime = str(raw, "startTime") || undefined;
  const endTime = str(raw, "endTime") || undefined;
  const startRaw = str(raw, "start", "startAt", "startsAt", "startDateTime");
  const start = startRaw ? safeIso(startRaw) : toIso(date, startTime);
  if (!start) return null;
  const endRaw = str(raw, "end", "endAt", "endsAt", "endDateTime");
  const durationMin =
    num(raw, "durationMin", "durationMinutes", "duration") ??
    (endRaw ? Math.round((+new Date(endRaw) - +new Date(start)) / 60000) : undefined) ??
    minutesBetween(date, startTime, endTime) ??
    60;
  return {
    id: str(raw, "id", "sessionId"),
    courseId: course.id,
    courseTitle: str(raw, "courseTitle") || course.title,
    title: str(raw, "title", "name") || course.title,
    group: str(raw, "batchCode", "group", "groupName") || course.group,
    instructor: str(raw, "instructorName", "instructor") || course.instructor,
    students: num(raw, "studentsCount", "students", "enrolledCount") ?? null,
    start,
    durationMin,
    zoomUrl: str(raw, "zoomUrl", "meetingUrl", "joinUrl", "onlineUrl") || null,
    location: str(raw, "roomDetails", "location", "venue") || null,
    attendance: null,
  };
}

// ---------- attendance ----------
function toAttendanceStatus(v: unknown): AttendanceStatus | null {
  const s = String(v ?? "").toLowerCase();
  if (s.startsWith("pres") || s === "attended" || s === "1") return "Present";
  if (s.startsWith("late")) return "Late";
  if (s.startsWith("excus")) return "Excused";
  if (s.startsWith("abs") || s === "0") return "Absent";
  return null;
}
// sessionId -> status. Works for a list of records; a plain summary object gives an empty map.
function mapAttendance(body: unknown): Map<string, AttendanceStatus> {
  const map = new Map<string, AttendanceStatus>();
  for (const r of toList(body)) {
    const id = str(r, "sessionId", "session_id") || str(pick<Raw>(r, "session"), "id");
    const status =
      toAttendanceStatus(pick(r, "status", "attendanceStatus")) ??
      (pick(r, "isPresent", "present") !== undefined ? (pick(r, "isPresent", "present") ? "Present" : "Absent") : null);
    if (id && status) map.set(id, status);
  }
  return map;
}

// ---------- assignments ----------
function mapAssignment(raw: Raw, course: WorkspaceCourse): WorkspaceAssignment {
  const sub = pick<Raw>(raw, "submission", "mySubmission");
  const score = num(raw, "score", "grade") ?? num(sub, "score", "grade");
  const rawStatus = String(pick(raw, "status", "submissionStatus") ?? pick(sub, "status") ?? "").toLowerCase();
  const submissionText = str(sub, "content", "text", "submissionText", "answer") || str(raw, "submissionText", "submission");
  const submitted = !!sub || !!submissionText || !!pick(raw, "submittedAt") || rawStatus.includes("submit");
  const graded = score !== undefined || rawStatus.includes("grade") || !!pick(raw, "gradedAt") || !!pick(sub, "gradedAt");
  const status: AssignmentStatus = graded ? "Graded" : submitted ? "Submitted" : "Pending";
  return {
    id: str(raw, "id", "assignmentId"),
    courseId: course.id,
    courseTitle: str(raw, "courseTitle") || course.title,
    title: str(raw, "title", "name"),
    description: str(raw, "description") || undefined,
    due: str(raw, "dueDate", "due", "deadline"),
    status,
    score,
    maxScore: num(raw, "maxScore", "maxGrade", "totalScore"),
    feedback: str(raw, "feedback") || str(sub, "feedback") || undefined,
    submission: submissionText || undefined,
  };
}

// ---------- materials ----------
function mapMaterial(raw: Raw, course: WorkspaceCourse): WorkspaceMaterial {
  const url = str(raw, "url", "fileUrl", "link", "downloadUrl", "contentUrl") || null;
  const kind = (str(raw, "type", "kind", "materialType", "contentType") || (url?.split(".").pop() ?? "file")).toLowerCase();
  return {
    id: str(raw, "id", "materialId"),
    courseId: course.id,
    courseTitle: str(raw, "courseTitle") || course.title,
    title: str(raw, "title", "name") || "Untitled material",
    description: str(raw, "description") || undefined,
    kind,
    // Relative upload paths ("/uploads/..") are served by the API host, not the web app.
    url: url ? (/^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`) : null,
    addedAt: str(raw, "createdAt", "uploadedAt", "publishedAt", "addedAt") || null,
  };
}

// ---------- public API ----------
type CourseBundle = {
  course: WorkspaceCourse;
  sessions: WorkspaceSession[];
  assignments: WorkspaceAssignment[];
  materials: WorkspaceMaterial[];
  failed: string[]; // names of the endpoints that failed for this course
};

type Settled<T> = PromiseSettledResult<T>;
const ok = <T,>(r: Settled<T>): T | undefined => (r.status === "fulfilled" ? r.value : undefined);

// One course = one enrollment. A failing sub-endpoint degrades only that part of that course.
async function loadCourse(enrollment: EnrollmentDto, signal?: AbortSignal): Promise<CourseBundle> {
  const id = enrollment.id;
  const get = (key: keyof typeof urls.learner) => apiGet<unknown>(withId(urls.learner[key], id), undefined, signal);

  const [progress, sessions, assignments, materials, attendance] = await Promise.allSettled([
    get("progress"),
    get("sessions"),
    get("assignments"),
    get("materials"),
    get("attendance"),
  ]);

  const progressBody = ok(progress);
  const course: WorkspaceCourse = {
    id,
    title: (enrollment.courseTitle ?? enrollment.programTitle) as string,
    group: str(progressBody as Raw, "batchCode", "group", "groupName"),
    instructor: str(progressBody as Raw, "instructorName", "instructor"),
    progress: progressBody === undefined ? 0 : mapProgress(progressBody),
  };

  const attended = mapAttendance(ok(attendance));
  const sessionList = toList(ok(sessions))
    .map((r) => mapSession(r, course))
    .filter((s): s is WorkspaceSession => !!s)
    .map((s) => ({ ...s, attendance: attended.get(s.id) ?? null }));

  const failed = (
    [["progress", progress], ["sessions", sessions], ["assignments", assignments], ["materials", materials], ["attendance", attendance]] as const
  )
    .filter(([, r]) => r.status === "rejected")
    .map(([name]) => name);

  return {
    course,
    sessions: sessionList,
    assignments: toList(ok(assignments)).map((r) => mapAssignment(r, course)),
    materials: toList(ok(materials)).map((r) => mapMaterial(r, course)),
    failed,
  };
}

// POST /api/learner/assignments/{id}/submit
// Body field name is the one thing to confirm in Swagger: SubmitAssignmentDto.
const submitAssignment = (assignmentId: string, content: string) =>
  apiPost<unknown>(withId(urls.learner.submitAssignment, assignmentId), { content });

export { getActiveEnrollments, loadCourse, submitAssignment };
export type { CourseBundle };
