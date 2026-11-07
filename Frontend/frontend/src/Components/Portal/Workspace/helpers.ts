import type { SessionStatus, WorkspaceSession } from "../../../Types/Workspace";

const TZ = "Africa/Cairo";

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date(iso));

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso)); // 2026-07-28

const fmtDayLong = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));

const fmtRelative = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const time = fmtTime(iso);
  if (sameDay(d, now)) return `Today, ${time}`;
  if (sameDay(d, y)) return `Yesterday, ${time}`;
  return `${fmtDate(iso)}, ${time}`;
};

function sessionStatus(s: WorkspaceSession, now = Date.now()): SessionStatus {
  const start = +new Date(s.start);
  const end = start + s.durationMin * 60000;
  if (now >= end) return "Completed";
  if (now >= start) return "Live";
  return "Upcoming";
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "ST";

const greeting = (hour: number) => (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");

export { TZ, fmtTime, fmtDate, fmtDayLong, fmtRelative, sessionStatus, initials, greeting };
