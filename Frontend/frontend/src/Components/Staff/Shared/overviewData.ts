import type { StaffAssignmentDto, StaffPayoutDto, StaffSessionDto } from "../../../apis/staffApi";
import { cairoDate, cairoHm, cairoWeek, statusName } from "../time";
import type { BarDatum, Segment } from "../../Charts/Charts";
import type { ActivityRow, SessionRow } from "./OverviewView";

const ago = (value: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (mins < 60) return `${mins || 1} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
};

// Today's sessions -> rows for the overview card (live / done flags use Cairo time).
export function toSessionRows(list: StaffSessionDto[]): SessionRow[] {
  const hm = cairoHm();
  return [...list]
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s) => {
      const start = s.startTime.slice(0, 5);
      const end = s.endTime.slice(0, 5);
      return {
        id: s.id,
        time: start,
        date: s.date,
        title: s.courseTitle || s.title,
        meta: [s.batchCode, s.roomDetails].filter(Boolean).join(" · ") || undefined,
        live: start <= hm && hm < end,
        done: end <= hm,
        joinUrl: /^https?:\/\//i.test(s.roomDetails ?? "") ? s.roomDetails : null,
      };
    });
}

// Recent activity built from real data only: latest assignment submissions (+ paid payouts when the role may see them).
export function toActivityRows(assignments: StaffAssignmentDto[], payouts: StaffPayoutDto[] = []): ActivityRow[] {
  const items = [
    ...assignments
      .filter((a) => a.latestSubmissionAt)
      .map((a) => ({
        id: `a${a.id}`,
        at: a.latestSubmissionAt as string,
        who: a.courseTitle,
        text: `${a.submissions} ${a.submissions === 1 ? "submission" : "submissions"} on “${a.title}”`,
      })),
    ...payouts
      .filter((p) => p.paidAt)
      .map((p) => ({
        id: `p${p.id}`,
        at: p.paidAt as string,
        who: p.instructorName,
        text: `Payout of ${p.amount.toLocaleString("en-US")} ${p.currency} marked paid`,
      })),
  ];
  return items
    .sort((x, y) => +new Date(y.at) - +new Date(x.at))
    .slice(0, 5)
    .map((i) => ({ id: i.id, who: i.who, text: i.text, when: ago(i.at) }));
}

// Promise.allSettled helper: value when fulfilled, null when rejected (and remember what failed).
export function settle<T>(r: PromiseSettledResult<T>, label: string, failed: string[]): T | null {
  if (r.status === "fulfilled") return r.value;
  const reason = r.reason as { name?: string } | undefined;
  if (reason?.name !== "CanceledError") failed.push(label);
  return null;
}

const DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Sessions per weekday of the current week (today highlighted).
export function weekBars(sessions: StaffSessionDto[]): BarDatum[] {
  const today = cairoDate();
  return cairoWeek().map((day, i) => ({
    label: DAY[i],
    value: sessions.filter((s) => s.date.slice(0, 10) === day).length,
    highlight: day === today,
  }));
}

// Submissions per assignment, the busiest six.
export function submissionBars(assignments: StaffAssignmentDto[]): BarDatum[] {
  return [...assignments]
    .filter((a) => a.submissions > 0)
    .sort((a, b) => b.submissions - a.submissions)
    .slice(0, 6)
    .map((a) => ({ label: a.title, value: a.submissions }));
}

// Payout counts by status.
export function payoutSegments(payouts: StaffPayoutDto[]): Segment[] {
  return ["pending", "paid", "cancelled"].map((name) => ({
    label: name.charAt(0).toUpperCase() + name.slice(1),
    value: payouts.filter((p) => statusName(p.status) === name).length,
  }));
}
