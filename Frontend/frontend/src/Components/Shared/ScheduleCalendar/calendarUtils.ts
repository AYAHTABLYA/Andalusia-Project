import type { StaffSessionDto } from "../../../apis/staffApi";
import type { WorkspaceSession } from "../../../Types/Workspace";
import { downloadCsv } from "../../../utils/csv";

// Shared types + Cairo-time date helpers for the Schedule calendar used by every dashboard.
// All dates are plain "YYYY-MM-DD" strings handled at noon UTC, so the browser timezone never shifts a day.

export const TZ = "Africa/Cairo";

export type EventKind = "live" | "inperson" | "hybrid" | "milestone";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (Cairo)
  start: string; // HH:MM
  end: string; // HH:MM
  course?: string;
  group?: string; // batch / cohort code
  location?: string; // "Zoom", "Hall B"...
  url?: string | null; // meeting link
  instructor?: string;
  kind: EventKind; // "live" is computed at render time from the clock
  details?: { label: string; value: string }[];
};

export type ScheduleStat = {
  label: string;
  value?: number | string;
  icon: string;
  badge: string;
  tone: "ok" | "warn" | "live";
  note?: string;
  link?: { label: string; href: string };
};

const DAY = 864e5;
const parse = (iso: string) => new Date(`${iso}T12:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);

export const todayIso = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ });
export const nowHm = () =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date());

export const addDays = (iso: string, n: number) => toIso(new Date(parse(iso).getTime() + n * DAY));
export const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;
export const addMonths = (iso: string, n: number) => {
  const d = parse(monthStart(iso));
  d.setUTCMonth(d.getUTCMonth() + n);
  return toIso(d);
};
export const monthEnd = (iso: string) => addDays(addMonths(iso, 1), -1);
export const weekStart = (iso: string) => addDays(iso, -parse(iso).getUTCDay()); // weeks start on Sunday
export const dayOfMonth = (iso: string) => Number(iso.slice(8, 10));

// The 5-6 week grid that covers a month (including the grey days of the neighbouring months).
export function monthGrid(iso: string) {
  const from = weekStart(monthStart(iso));
  const to = addDays(weekStart(monthEnd(iso)), 6);
  const count = Math.round((parse(to).getTime() - parse(from).getTime()) / DAY) + 1;
  return { from, to, days: Array.from({ length: count }, (_, i) => addDays(from, i)) };
}

export const localeFor = (lang: string) => (lang === "ar" ? "ar-EG-u-nu-latn" : "en-US");

export const fmtDate = (iso: string, options: Intl.DateTimeFormatOptions, lang: string) =>
  new Intl.DateTimeFormat(localeFor(lang), { ...options, timeZone: "UTC" }).format(parse(iso));

export const hm5 = (t: string) => t.slice(0, 5);

export const fmtTime = (hm: string, lang: string) =>
  new Intl.DateTimeFormat(localeFor(lang), { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(
    new Date(`1970-01-01T${hm5(hm)}:00Z`),
  );

export const minutesBetween = (a: string, b: string) => {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
};

// "GMT+2" / "GMT+3": Egypt changes with daylight saving, so read it instead of hard-coding it.
export function gmtLabel(): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      timeZoneName: "shortOffset",
    } as unknown as Intl.DateTimeFormatOptions).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+2";
  } catch {
    return "GMT+2";
  }
}

export const isLive = (e: CalendarEvent, today = todayIso(), now = nowHm()) =>
  e.date === today && e.start <= now && now < e.end;
export const isDone = (e: CalendarEvent, today = todayIso(), now = nowHm()) =>
  e.date < today || (e.date === today && e.end <= now);
export const kindOf = (e: CalendarEvent, today?: string, now?: string): EventKind => (isLive(e, today, now) ? "live" : e.kind);

const isUrl = (v?: string | null) => /^https?:\/\//i.test(v ?? "");
function providerLabel(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("zoom")) return "Zoom";
  if (u.includes("meet.google")) return "Google Meet";
  if (u.includes("teams")) return "Teams";
  return "Online";
}

const MILESTONE = /(milestone|capstone|demo day|graduation|orientation|kick-?off|showcase|defen[cs]e)/i;
function classify(title: string, url: string | null): EventKind {
  if (MILESTONE.test(title)) return "milestone";
  return url ? "hybrid" : "inperson";
}

export function fromStaffSession(s: StaffSessionDto, extra: Partial<CalendarEvent> = {}): CalendarEvent {
  const url = isUrl(s.roomDetails) ? s.roomDetails : null;
  const title = s.title || s.courseTitle || "Session";
  return {
    id: `s-${s.id}`,
    title,
    date: s.date.slice(0, 10),
    start: hm5(s.startTime),
    end: hm5(s.endTime),
    course: s.courseTitle || undefined,
    group: s.batchCode || undefined,
    location: url ? providerLabel(url) : s.roomDetails?.trim() || undefined,
    url,
    kind: classify(title, url),
    ...extra,
  };
}

export function fromWorkspaceSession(s: WorkspaceSession): CalendarEvent {
  const startDate = new Date(s.start);
  const start = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(startDate);
  const date = startDate.toLocaleDateString("en-CA", { timeZone: TZ });
  const endTotal = Math.min(23 * 60 + 59, Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5)) + s.durationMin);
  const end = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;
  const url = isUrl(s.zoomUrl) ? s.zoomUrl : null;
  const title = s.title || s.courseTitle;
  const details: { label: string; value: string }[] = [];
  if (s.students != null) details.push({ label: "Students", value: String(s.students) });
  if (s.attendance) details.push({ label: "Attendance", value: String(s.attendance) });
  return {
    id: s.id,
    title,
    date,
    start,
    end,
    course: s.courseTitle,
    group: s.group || undefined,
    location: url ? providerLabel(url) : s.location || undefined,
    url,
    instructor: s.instructor || undefined,
    kind: classify(title, url),
    details,
  };
}

// The three cards on top of the page. `events` should cover today and the coming week.
export function buildScheduleStats(
  events: CalendarEvent[],
  opts: { upcoming?: number | null; unavailable?: boolean; lang?: string } = {},
): ScheduleStat[] {
  const today = todayIso();
  const now = nowHm();
  const lang = opts.lang ?? "en";
  const sorted = [...events].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const todays = sorted.filter((e) => e.date === today);
  const next = todays.find((e) => e.start > now);
  const live = todays.filter((e) => isLive(e, today, now));
  const weekEnd = addDays(today, 7);
  const upcoming = opts.upcoming ?? sorted.filter((e) => e.date > today && e.date <= weekEnd).length;
  const off = opts.unavailable;

  return [
    {
      label: "Sessions today",
      value: off ? undefined : todays.length,
      icon: "event",
      badge: "Live data",
      tone: "ok",
      note: next
        ? `Next starts at ${fmtTime(next.start, lang)}${next.location ? ` in ${next.location}` : ""}`
        : todays.length
          ? "All sessions are done for today"
          : "No sessions today",
    },
    {
      label: "Upcoming",
      value: off ? undefined : upcoming,
      icon: "event_upcoming",
      badge: "Upcoming week",
      tone: "warn",
      note: "Sessions in the next 7 days",
    },
    {
      label: "Live now",
      value: off ? undefined : live.length,
      icon: "videocam",
      badge: live.length ? "Broadcasting" : "Off air",
      tone: "live",
      note: live[0] ? `${live[0].title}${live[0].location ? ` (${live[0].location})` : ""}` : "Nothing on air right now",
      link: live[0]?.url ? { label: "Join room", href: live[0].url } : undefined,
    },
  ];
}

export function exportEventsCsv(events: CalendarEvent[], fileName: string): boolean {
  if (!events.length) return false;
  const sorted = [...events].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  downloadCsv(fileName, [
    ["Session", "Course", "Batch", "Date", "Start", "End", "Location"],
    ...sorted.map((e) => [e.title, e.course ?? "", e.group ?? "", e.date, e.start, e.end, e.location ?? ""]),
  ]);
  return true;
}
