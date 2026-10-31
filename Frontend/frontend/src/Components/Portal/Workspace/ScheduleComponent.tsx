import { memo } from "react";
import ScheduleCalendar from "../../Shared/ScheduleCalendar/ScheduleCalendar";
import type { CalendarEvent, ScheduleStat } from "../../Shared/ScheduleCalendar/calendarUtils";

type Props = {
  events: CalendarEvent[];
  stats: ScheduleStat[];
  initialDate?: string;
  initialEventId?: string | null;
  onEventOpen: (id: string | null) => void;
};

function ScheduleComponent({ events, stats, initialDate, initialEventId, onEventOpen }: Props) {
  return (
    <ScheduleCalendar
      eyebrow="CLASSES & MEETINGS"
      title="My schedule"
      subtitle="Everything you need for your learning sessions and academic calendar."
      stats={stats}
      events={events}
      initialDate={initialDate}
      initialEventId={initialEventId}
      onEventOpen={onEventOpen}
    />
  );
}

export default memo(ScheduleComponent);
