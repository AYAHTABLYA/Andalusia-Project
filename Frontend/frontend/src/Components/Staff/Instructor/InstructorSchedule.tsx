import { useEffect, useMemo, useState } from "react";
import { getStaffSchedule, getStaffStudents } from "../../../apis/staffApi";
import type { StaffSessionDto, StaffStudentDto } from "../../../apis/staffApi";
import { getStoredUser } from "../../../utils/session";
import ScheduleCalendar from "../../Shared/ScheduleCalendar/ScheduleCalendar";
import {
  addDays,
  buildScheduleStats,
  fromStaffSession,
  todayIso,
} from "../../Shared/ScheduleCalendar/calendarUtils";

// Instructor schedule: the same month calendar as the other dashboards, limited to the sessions assigned to this instructor.
export default function InstructorSchedule() {
  const user = getStoredUser();
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [sessions, setSessions] = useState<StaffSessionDto[]>([]);
  const [soon, setSoon] = useState<StaffSessionDto[] | null>(null);
  const [students, setStudents] = useState<StaffStudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Figures on the cards: today + the next 7 days, independent of the month being browsed.
  useEffect(() => {
    const controller = new AbortController();
    const t = todayIso();
    getStaffSchedule({ from: t, to: addDays(t, 7) }, controller.signal)
      .then((list) => !controller.signal.aborted && setSoon(list))
      .catch(() => undefined);
    getStaffStudents(undefined, controller.signal)
      .then((list) => !controller.signal.aborted && setStudents(list))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!range) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getStaffSchedule({ from: range.from, to: range.to }, controller.signal)
      .then((list) => !controller.signal.aborted && setSessions(list))
      .catch((e: unknown) => !controller.signal.aborted && setError(e instanceof Error ? e.message : "Could not load your schedule."))
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [range?.from, range?.to]); // eslint-disable-line react-hooks/exhaustive-deps

  const toEvent = useMemo(() => {
    const count = (scheduleId: number) => new Set(students.filter((x) => x.scheduleId === scheduleId).map((x) => x.id)).size;
    return (s: StaffSessionDto) =>
      fromStaffSession(s, {
        instructor: user?.name,
        details: students.length ? [{ label: "Students", value: String(count(s.scheduleId)) }] : [],
      });
  }, [students, user?.name]);

  const events = useMemo(() => sessions.map(toEvent), [sessions, toEvent]);
  const stats = buildScheduleStats((soon ?? []).map(toEvent), { unavailable: soon === null });

  return (
    <ScheduleCalendar
      eyebrow="CLASSES & MEETINGS"
      title="My schedule"
      subtitle="Everything you need for your teaching sessions and academic calendar."
      stats={stats}
      events={events}
      loading={loading}
      error={error}
      onRangeChange={setRange}
    />
  );
}
