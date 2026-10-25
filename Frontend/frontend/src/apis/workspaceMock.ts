// Sample data for the student workspace until the backend exposes
// /api/workspace/* (sessions, assignments, messages). The course list itself is
// real: it is built from the learner's ACTIVE enrollments, so the dashboard only
// ever shows data related to courses the learner is enrolled in.
// Only apis/workspaceApi.ts reads this file; replace its builders with real requests.
import { SUPPORT_CONVERSATION_ID } from "../Components/Portal/Workspace/constants";
import type {
  Conversation,
  WorkspaceAssignment,
  WorkspaceCourse,
  WorkspaceSession,
} from "../Types/Workspace";

const INSTRUCTORS = ["Nora Haddad", "Omar Farouk", "Laila Mansour", "Karim Saad"];
const GROUPS = ["FR-A1 · Group", "B2 · Group", "C1 · Group", "D1 · Group"];

const DEMO_ENROLLMENT_TITLES = ["French Foundations"];

const at = (base: Date, dayOffset: number, hour: number, minute = 0) => {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

function buildCourses(titles: string[]): WorkspaceCourse[] {
  return titles.map((title, i) => ({
    id: i + 1,
    title,
    group: GROUPS[i % GROUPS.length],
    instructor: INSTRUCTORS[i % INSTRUCTORS.length],
    progress: [68, 42, 85, 30][i % 4],
    nextSessionId: `s-${i + 1}-0`,
  }));
}

function buildSessions(courses: WorkspaceCourse[], studentName: string): WorkspaceSession[] {
  const now = new Date();
  const sessions: WorkspaceSession[] = [];
  courses.forEach((c, i) => {
    // [dayOffset, hour] — one session today, one yesterday, two later this week.
    const slots: Array<[number, number]> = [[0, 9 + i * 2], [-1, 9 + i * 2], [1, 11], [3, 10]];
    slots.forEach(([day, hour], k) => {
      sessions.push({
        id: `s-${c.id}-${k}`,
        courseId: c.id,
        courseTitle: c.title,
        group: c.group,
        instructor: c.instructor,
        students: 6,
        start: at(now, day, hour),
        durationMin: 60,
        zoomUrl: "https://zoom.us/j/0000000000",
        comments:
          k === 0
            ? [
                {
                  id: `c-${c.id}-1`,
                  author: c.instructor,
                  role: "Instructor",
                  text: "Please review pages 12–18 before our next class.",
                  at: at(now, -1, 16, 40),
                },
                {
                  id: `c-${c.id}-2`,
                  author: studentName,
                  role: "Student",
                  text: "Done, thank you! I have one question about exercise 4.",
                  at: at(now, 0, 8, 15),
                },
              ]
            : [],
      });
    });
  });
  return sessions.sort((a, b) => +new Date(a.start) - +new Date(b.start));
}

function buildAssignments(courses: WorkspaceCourse[]): WorkspaceAssignment[] {
  const now = new Date();
  const list: WorkspaceAssignment[] = [];
  courses.forEach((c) => {
    list.push(
      { id: `a-${c.id}-1`, courseId: c.id, courseTitle: c.title, title: "Introduce yourself", due: at(now, 4, 23, 59), status: "Pending" },
      { id: `a-${c.id}-2`, courseId: c.id, courseTitle: c.title, title: "Vocabulary practice · Unit 3", due: at(now, 2, 23, 59), status: "Submitted", submission: "Completed all 40 words." },
      { id: `a-${c.id}-3`, courseId: c.id, courseTitle: c.title, title: "Listening comprehension", due: at(now, -3, 23, 59), status: "Graded", score: 18, maxScore: 20, feedback: "Great listening accuracy. Watch the endings." },
    );
  });
  return list;
}

function buildConversations(courses: WorkspaceCourse[], studentName: string): Conversation[] {
  const now = new Date();
  const convs: Conversation[] = courses.slice(0, 3).map((c) => ({
    id: `m-${c.id}`,
    name: c.instructor,
    subtitle: c.title,
    unread: 2,
    messages: [
      { id: `${c.id}-1`, from: "them", author: c.instructor, text: `Hi ${studentName.split(" ")[0] || "there"}, your pronunciation is improving. Keep practicing lesson 3.`, at: at(now, 0, 9, 2) },
      { id: `${c.id}-2`, from: "me", author: studentName, text: "Thank you! Should I submit the audio with the assignment?", at: at(now, 0, 9, 30) },
    ],
  }));
  convs.push({
    id: SUPPORT_CONVERSATION_ID,
    name: "Academy Support",
    subtitle: "Student services",
    unread: 0,
    messages: [
      { id: "sup-1", from: "them", author: "Academy Support", text: "Welcome! Message us any time about payments, schedules or access.", at: at(now, -2, 10) },
    ],
  });
  return convs;
}

export {
  DEMO_ENROLLMENT_TITLES,
  buildCourses,
  buildSessions,
  buildAssignments,
  buildConversations,
};
