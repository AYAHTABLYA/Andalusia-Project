import { type FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import ScheduleComponent, { type DayTab, type SlotItem } from "./ScheduleComponent";
import { sessionStatus } from "./helpers";

const DAY = 864e5;

// Monday-to-Friday strip of the current week.
function weekDays(): Date[] {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const monday = new Date(d.getTime() - ((d.getDay() + 6) % 7) * DAY);
  return Array.from({ length: 5 }, (_, i) => new Date(monday.getTime() + i * DAY));
}

function ScheduleContainer() {
  const { workspace, userName } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const week = useMemo(weekDays, []);
  const [day, setDay] = useState(() => {
    const q = workspace.sessions.find((s) => s.id === params.get("s"));
    return (q ? new Date(q.start) : new Date()).toDateString();
  });
  const [draft, setDraft] = useState("");

  const tabs: DayTab[] = week.map((d) => {
    const key = d.toDateString();
    return {
      key,
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: d.getDate(),
      hasSessions: workspace.sessions.some((s) => new Date(s.start).toDateString() === key),
    };
  });

  const slots: SlotItem[] = workspace.sessions
    .filter((s) => new Date(s.start).toDateString() === day)
    .map((session) => ({ session, status: sessionStatus(session) }));

  const selected = workspace.sessions.find((s) => s.id === params.get("s")) ?? slots[0]?.session ?? null;

  function post(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!selected || !text) return;
    workspace.postComment(selected.id, text, userName);
    setDraft("");
  }

  return (
    <ScheduleComponent
      dayLabel={new Date(day).toISOString()}
      tabs={tabs}
      activeDay={day}
      slots={slots}
      selected={selected}
      selectedStatus={selected ? sessionStatus(selected) : null}
      draft={draft}
      onDayChange={setDay}
      onSelect={(id) => setParams({ s: id }, { replace: true })}
      onDraftChange={setDraft}
      onPost={post}
      onJoin={(url) => window.open(url, "_blank", "noopener,noreferrer")}
    />
  );
}

export default ScheduleContainer;
