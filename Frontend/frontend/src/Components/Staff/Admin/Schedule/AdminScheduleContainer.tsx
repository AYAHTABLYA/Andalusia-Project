import { useEffect, useState } from "react";
import { getStaffDashboard, getStaffSchedule } from "../../../../apis/staffApi";
import type { StaffSessionDto } from "../../../../apis/staffApi";
import { getAdminSchedules } from "../../../../apis/staffAdminApi";
import type { AdminScheduleDto } from "../../../../apis/staffAdminApi";
import useStaffData from "../../../../hooks/staffHooks/useStaffData";
import ScheduleCalendar from "../../../Shared/ScheduleCalendar/ScheduleCalendar";
import {
  buildScheduleStats,
  fromStaffSession,
  todayIso,
  type CalendarEvent,
} from "../../../Shared/ScheduleCalendar/calendarUtils";
import { ScheduleSessionDialog } from "../../Shared/StaffActionDialogs";

type Overview = { schedules: AdminScheduleDto[]; today: StaffSessionDto[] | null; upcoming: number | null };
const EMPTY: Overview = { schedules: [], today: null, upcoming: null };

// /admin/schedule and /coordinator/schedule: month calendar of every session + today's figures.
// The batch list feeds the "Schedule session" dialog; the calendar loads only the date range on screen.
function AdminScheduleContainer() {
  const [notice, setNotice] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [rangeLoading, setRangeLoading] = useState(true);
  const [rangeError, setRangeError] = useState("");

  const { data, loading, error, reload } = useStaffData<Overview>(
    async (signal) => {
      const batches = await getAdminSchedules({ page: 1, pageSize: 100 }, signal);
      const t = todayIso();
      const [today, dash] = await Promise.allSettled([getStaffSchedule({ from: t, to: t }, signal), getStaffDashboard(signal)]);
      return {
        schedules: batches.data,
        today: today.status === "fulfilled" ? today.value : null,
        upcoming: dash.status === "fulfilled" ? dash.value.upcomingSessions : null,
      };
    },
    EMPTY,
    "Could not load schedules.",
  );

  useEffect(() => {
    if (!range) return;
    const controller = new AbortController();
    setRangeLoading(true);
    setRangeError("");
    getStaffSchedule({ from: range.from, to: range.to }, controller.signal)
      .then((list) => !controller.signal.aborted && setEvents(list.map((s) => fromStaffSession(s))))
      .catch((e: unknown) => !controller.signal.aborted && setRangeError(e instanceof Error && e.message ? e.message : "Could not load schedules."))
      .finally(() => !controller.signal.aborted && setRangeLoading(false));
    return () => controller.abort();
  }, [range?.from, range?.to, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = buildScheduleStats((data.today ?? []).map((s) => fromStaffSession(s)), {
    upcoming: data.upcoming,
    unavailable: data.today === null,
  });

  return (
    <ScheduleCalendar
      eyebrow="CLASSES & MEETINGS"
      title="Schedule"
      subtitle="Everything you need for the academy's learning sessions and academic calendar."
      stats={stats}
      events={events}
      loading={loading || rangeLoading}
      error={error || rangeError}
      notice={notice}
      exportFileName="schedule.csv"
      primaryAction={{ label: "Schedule session", icon: "add", onClick: () => { setNotice(""); setScheduling(true); } }}
      onRangeChange={setRange}
    >
      {scheduling && (
        <ScheduleSessionDialog
          schedules={data.schedules}
          onClose={() => setScheduling(false)}
          onDone={(message) => { setScheduling(false); setNotice(message); reload(); setReloadKey((k) => k + 1); }}
        />
      )}
    </ScheduleCalendar>
  );
}

export default AdminScheduleContainer;
