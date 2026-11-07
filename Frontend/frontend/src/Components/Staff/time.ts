// Cairo-time helpers shared by every staff dashboard.
// The academy works in Cairo time, so "today" and "now" must not depend on the browser's timezone
// (and never on toISOString(), which is UTC and flips the date around midnight).
const TZ = "Africa/Cairo";

const cairoDate = (d: Date = new Date()) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // 2026-10-28
const cairoHm = (d: Date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(d); // 09:30
const cairoHms = (d: Date = new Date()) => d.toLocaleTimeString("en-GB", { hour12: false, timeZone: TZ }); // 09:30:15

// Monday..Sunday of the current week in Cairo time, as ["2026-10-26", ... , "2026-11-01"].
const cairoWeek = (): string[] => {
  const today = new Date(`${cairoDate()}T12:00:00Z`); // noon UTC: no DST edge cases
  const monday = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * 864e5);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 864e5).toISOString().slice(0, 10));
};

// Enums can arrive as strings ("Pending") or numbers (0) depending on the serializer: compare by name.
const PAYOUT_STATUS = ["pending", "paid", "cancelled"];
const statusName = (value: string | number | null | undefined): string =>
  typeof value === "number" ? (PAYOUT_STATUS[value] ?? String(value)) : String(value ?? "").toLowerCase();
const isStatus = (value: string | number | null | undefined, name: string) => statusName(value) === name.toLowerCase();

const statusLabel = (value: string | number | null | undefined): string => {
  const n = statusName(value);
  return n.charAt(0).toUpperCase() + n.slice(1);
};

export { TZ, cairoWeek, cairoDate, cairoHm, cairoHms, statusName, statusLabel, isStatus };
