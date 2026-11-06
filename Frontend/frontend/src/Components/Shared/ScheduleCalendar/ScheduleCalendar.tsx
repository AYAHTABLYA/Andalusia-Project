import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Select from "../Select/Select";
import {
  addDays,
  addMonths,
  dayOfMonth,
  exportEventsCsv,
  fmtDate,
  fmtTime,
  gmtLabel,
  isDone,
  isLive,
  kindOf,
  minutesBetween,
  monthEnd,
  monthGrid,
  monthStart,
  nowHm,
  todayIso,
  weekStart,
  type CalendarEvent,
  type EventKind,
  type ScheduleStat,
} from "./calendarUtils";
import "./schedule-calendar.css";

type View = "month" | "week" | "day" | "list";
const VIEWS: { id: View; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "list", label: "List" },
];
const LEGEND: { kind: EventKind; label: string }[] = [
  { kind: "live", label: "Live Streaming" },
  { kind: "inperson", label: "In-Person Studio" },
  { kind: "hybrid", label: "Hybrid / Webinar" },
  { kind: "milestone", label: "Cohort Milestone" },
];
const MAX_PER_CELL = 3;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: ScheduleStat[];
  events: CalendarEvent[];
  loading?: boolean;
  error?: string;
  notice?: string;
  primaryAction?: { label: string; icon?: string; onClick: () => void };
  exportFileName?: string;
  /** Called whenever the visible date range changes, so a page can load just that range. */
  onRangeChange?: (range: { from: string; to: string }) => void;
  initialDate?: string;
  initialEventId?: string | null;
  onEventOpen?: (id: string | null) => void;
  children?: ReactNode; // dialogs owned by the page
};

const currentLang = () => (typeof document === "undefined" ? "en" : document.documentElement.lang || "en");

function useLang() {
  const [lang, setLang] = useState(currentLang);
  useEffect(() => {
    const observer = new MutationObserver(() => setLang(currentLang()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);
  return lang;
}

function ScheduleCalendar({
  eyebrow, title, subtitle, stats, events, loading, error, notice, primaryAction, exportFileName,
  onRangeChange, initialDate, initialEventId, onEventOpen, children,
}: Props) {
  const lang = useLang();
  const [, setTick] = useState(0);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => (initialDate && ISO.test(initialDate) ? initialDate : todayIso()));
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("");
  const [openId, setOpenId] = useState<string | null>(initialEventId ?? null);
  const [localNotice, setLocalNotice] = useState("");

  // Re-render every 30 s so "Live now" and "Today" stay correct without a reload.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const today = todayIso();
  const now = nowHm();

  const range = useMemo(() => {
    if (view === "month") {
      const g = monthGrid(cursor);
      return { from: g.from, to: g.to };
    }
    if (view === "list") return { from: monthStart(cursor), to: monthEnd(cursor) };
    if (view === "week") {
      const from = weekStart(cursor);
      return { from, to: addDays(from, 6) };
    }
    return { from: cursor, to: cursor };
  }, [view, cursor]);

  const rangeCb = useRef(onRangeChange);
  rangeCb.current = onRangeChange;
  useEffect(() => {
    rangeCb.current?.(range);
  }, [range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps

  const courses = useMemo(
    () => Array.from(new Set(events.map((e) => e.course).filter((c): c is string => !!c))).sort(),
    [events],
  );

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events
      .filter((e) => e.date >= range.from && e.date <= range.to)
      .filter((e) => !course || e.course === course)
      .filter(
        (e) =>
          !needle ||
          [e.title, e.course, e.group, e.location, e.instructor].join(" ").toLowerCase().includes(needle),
      )
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }, [events, range.from, range.to, query, course]);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    shown.forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    return map;
  }, [shown]);

  const cohorts = new Set(shown.map((e) => e.group || e.course).filter(Boolean)).size;
  const filtersOn = Boolean(query || course);
  const opened = openId ? events.find((e) => e.id === openId) ?? null : null;

  const setOpen = (id: string | null) => {
    setOpenId(id);
    onEventOpen?.(id);
  };
  const step = (dir: 1 | -1) => {
    if (view === "month" || view === "list") setCursor(addMonths(cursor, dir));
    else if (view === "week") setCursor(addDays(cursor, 7 * dir));
    else setCursor(addDays(cursor, dir));
  };
  const goDay = (iso: string) => {
    setCursor(iso);
    setView("day");
  };
  const reset = () => {
    setQuery("");
    setCourse("");
    setLocalNotice("");
  };

  const heading =
    view === "month" || view === "list"
      ? fmtDate(cursor, { month: "long", year: "numeric" }, lang)
      : view === "week"
        ? `${fmtDate(range.from, { month: "short", day: "numeric" }, lang)} – ${fmtDate(range.to, { month: "short", day: "numeric", year: "numeric" }, lang)}`
        : fmtDate(cursor, { weekday: "long", month: "long", day: "numeric", year: "numeric" }, lang);

  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    fmtDate(addDays(weekStart(cursor), i), { weekday: "short" }, lang),
  );

  const chip = (e: CalendarEvent) => {
    const kind = kindOf(e, today, now);
    return (
      <button
        key={e.id}
        type="button"
        className={`sc-chip sc-chip--${kind}`}
        onClick={() => setOpen(e.id)}
        title={`${e.title} · ${fmtTime(e.start, lang)}`}
      >
        {kind === "live" && (
          <span className="sc-chip_live"><i /> Live now{e.group ? <em>{e.group}</em> : null}</span>
        )}
        <strong>{e.title}</strong>
        <small>{fmtTime(e.start, lang)}{e.location ? ` • ${e.location}` : ""}</small>
      </button>
    );
  };

  const row = (e: CalendarEvent) => {
    const kind = kindOf(e, today, now);
    const status = isLive(e, today, now) ? "Live" : isDone(e, today, now) ? "Completed" : "Upcoming";
    return (
      <button key={e.id} type="button" className={`sc-row sc-row--${kind}`} onClick={() => setOpen(e.id)}>
        <span className="sc-row_time">
          <strong>{fmtTime(e.start, lang)}</strong>
          <small>{minutesBetween(e.start, e.end)} min</small>
        </span>
        <span className="sc-row_main">
          {(e.group || e.course) && <small>{e.group || e.course}</small>}
          <strong>{e.title}</strong>
          <small>{[e.course && e.group ? e.course : "", e.location, e.instructor].filter(Boolean).join(" · ")}</small>
        </span>
        <span className={`sc-tag${status === "Live" ? " sc-tag--live" : status === "Completed" ? " sc-tag--done" : ""}`}>{status}</span>
        <span className="material-symbols-outlined sc-row_go">chevron_right</span>
      </button>
    );
  };

  const empty = (
    <div className="sc-empty">
      <span className="material-symbols-outlined">event_busy</span>
      <strong>{loading ? "Loading your schedule…" : filtersOn ? "No matching sessions" : "No sessions in this period"}</strong>
      <p>{filtersOn ? "Try another search term or reset the filters." : "Pick another date range to see more sessions."}</p>
    </div>
  );

  return (
    <div className="sc">
      <header className="sc-head">
        <div>
          <div className="sc-eyebrow">{eyebrow}</div>
          <h1 className="sc-title">{title}</h1>
          <p className="sc-sub">{subtitle}</p>
        </div>
        <div className="sc-head_actions">
          {exportFileName && (
            <button
              type="button"
              className="sc-btn"
              onClick={() => setLocalNotice(exportEventsCsv(shown, exportFileName) ? "" : "Nothing to export yet.")}
            >
              <span className="material-symbols-outlined">download</span> Export
            </button>
          )}
          {primaryAction && (
            <button type="button" className="sc-btn sc-btn--primary" onClick={primaryAction.onClick}>
              {primaryAction.icon && <span className="material-symbols-outlined">{primaryAction.icon}</span>}
              {primaryAction.label}
            </button>
          )}
        </div>
      </header>

      <section className="sc-stats">
        {stats.map((s) => (
          <article className="sc-stat" key={s.label}>
            <div className="sc-stat_top">
              <span className="sc-stat_icon"><span className="material-symbols-outlined">{s.icon}</span></span>
              <span className={`sc-badge sc-badge--${s.tone}`}>{s.badge}</span>
            </div>
            <small>{s.label}</small>
            <strong>{s.value ?? (loading ? "…" : "—")}</strong>
            <p>
              <span>{s.note}</span>
              {s.link && (
                <a href={s.link.href} target="_blank" rel="noreferrer">{s.link.label} →</a>
              )}
            </p>
          </article>
        ))}
      </section>

      {(notice || localNotice) && <p className="sc-notice" role="status">{notice || localNotice}</p>}
      {error && <p className="sc-notice" role="alert">Could not load live data: {error}</p>}

      <section className="sc-card">
        <div className="sc-bar">
          <div className="sc-bar_title">
            <span className="sc-bar_icon"><span className="material-symbols-outlined">calendar_month</span></span>
            <div>
              <h2>{heading}</h2>
              <p>{`${cohorts} academy cohort${cohorts === 1 ? "" : "s"} in this view`}</p>
            </div>
          </div>

          <div className="sc-nav">
            <button type="button" aria-label="Previous" onClick={() => step(-1)}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button type="button" className="sc-nav_today" onClick={() => setCursor(todayIso())}>Today</button>
            <button type="button" aria-label="Next" onClick={() => step(1)}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <label className="sc-search">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search schedule..."
              aria-label="Search schedule"
            />
          </label>

          <Select className="sc-select" aria-label="Filter by course" value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>

          <div className="sc-views" role="group" aria-label="Calendar view">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                className={view === v.id ? "is-on" : ""}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button type="button" className="sc-btn sc-btn--sm" onClick={reset}>Reset filters</button>
        </div>

        {view === "month" && (
          <div className="sc-month">
            <div className="sc-dow">
              {weekdayNames.map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="sc-grid">
              {monthGrid(cursor).days.map((iso) => {
                const list = byDate.get(iso) ?? [];
                const outside = iso.slice(0, 7) !== cursor.slice(0, 7);
                const isToday = iso === today;
                return (
                  <div key={iso} className={`sc-cell${outside ? " is-out" : ""}${isToday ? " is-today" : ""}`}>
                    <div className="sc-cell_head">
                      <span className="sc-cell_num">{dayOfMonth(iso)}</span>
                      {isToday && <span className="sc-cell_today">Today</span>}
                    </div>
                    <div className="sc-cell_events">
                      {list.slice(0, MAX_PER_CELL).map(chip)}
                      {list.length > MAX_PER_CELL && (
                        <button type="button" className="sc-more" onClick={() => goDay(iso)}>
                          +{list.length - MAX_PER_CELL} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="sc-week">
            {Array.from({ length: 7 }, (_, i) => addDays(range.from, i)).map((iso) => {
              const list = byDate.get(iso) ?? [];
              return (
                <div key={iso} className={`sc-weekcol${iso === today ? " is-today" : ""}`}>
                  <button type="button" className="sc-weekcol_head" onClick={() => goDay(iso)}>
                    <small>{fmtDate(iso, { weekday: "short" }, lang)}</small>
                    <strong>{dayOfMonth(iso)}</strong>
                  </button>
                  <div className="sc-cell_events">
                    {list.length ? list.map(chip) : <span className="sc-weekcol_none">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "day" && <div className="sc-rows">{shown.length ? shown.map(row) : empty}</div>}

        {view === "list" && (
          <div className="sc-rows">
            {shown.length
              ? Array.from(byDate.entries()).map(([iso, list]) => (
                  <div key={iso} className="sc-listday">
                    <h3>{fmtDate(iso, { weekday: "long", day: "numeric", month: "long" }, lang)}</h3>
                    {list.map(row)}
                  </div>
                ))
              : empty}
          </div>
        )}

        <footer className="sc-legend">
          <div>
            <span className="sc-legend_label">Legend:</span>
            {LEGEND.map((l) => (
              <span key={l.kind} className="sc-legend_item"><i className={`sc-dot sc-dot--${l.kind}`} /> {l.label}</span>
            ))}
          </div>
          <span className="sc-legend_sync">Synced with Cairo Academic Campus Clock ({gmtLabel()})</span>
        </footer>
      </section>

      {children}

      {opened && (
        <EventDialog
          event={opened}
          lang={lang}
          status={isLive(opened, today, now) ? "Live" : isDone(opened, today, now) ? "Completed" : "Upcoming"}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function EventDialog({
  event: e, status, lang, onClose,
}: { event: CalendarEvent; status: string; lang: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const facts: { label: string; value: string }[] = [
    { label: "Date", value: fmtDate(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }, lang) },
    { label: "Time", value: `${fmtTime(e.start, lang)} – ${fmtTime(e.end, lang)} · Cairo time` },
    ...(e.course ? [{ label: "Course", value: e.course }] : []),
    ...(e.group ? [{ label: "Batch", value: e.group }] : []),
    ...(e.location ? [{ label: "Location", value: e.location }] : []),
    ...(e.instructor ? [{ label: "Instructor", value: e.instructor }] : []),
    ...(e.details ?? []),
  ];

  return createPortal(
    <div className="sc-overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div className="sc-modal" role="dialog" aria-modal="true" aria-label={e.title}>
        <div className="sc-modal_head">
          <div>
            <span className="sc-eyebrow">SESSION DETAILS</span>
            <h2>{e.title}</h2>
          </div>
          <button type="button" className="sc-modal_close" aria-label="Close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <span className={`sc-tag${status === "Live" ? " sc-tag--live" : status === "Completed" ? " sc-tag--done" : ""}`}>{status}</span>
        <dl className="sc-facts">
          {facts.map((f) => (
            <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
          ))}
        </dl>
        <div className="sc-modal_foot">
          {e.url ? (
            status === "Completed" ? (
              <span className="sc-btn sc-btn--off">Session ended</span>
            ) : (
              <a className="sc-btn sc-btn--primary" href={e.url} target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">videocam</span> Join now
              </a>
            )
          ) : (
            <span className="sc-btn sc-btn--off">No meeting link</span>
          )}
          <button type="button" className="sc-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ScheduleCalendar;
