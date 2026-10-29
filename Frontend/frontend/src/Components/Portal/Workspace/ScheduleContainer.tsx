import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import ScheduleComponent from "./ScheduleComponent";
import { buildScheduleStats, fromWorkspaceSession } from "../../Shared/ScheduleCalendar/calendarUtils";

// Learner schedule: every session of the learner's courses on the shared month calendar.
// "?s=<sessionId>" (links from the overview) opens that session's details straight away.
function ScheduleContainer() {
  const { workspace } = useWorkspace();
  const [params, setParams] = useSearchParams();

  const events = useMemo(() => workspace.sessions.map(fromWorkspaceSession), [workspace.sessions]);
  const stats = buildScheduleStats(events);

  const selectedId = params.get("s");
  const selected = events.find((e) => e.id === selectedId);

  return (
    <ScheduleComponent
      events={events}
      stats={stats}
      initialDate={selected?.date}
      initialEventId={selected ? selectedId : null}
      onEventOpen={(id) => setParams(id ? { s: id } : {}, { replace: true })}
    />
  );
}

export default ScheduleContainer;
