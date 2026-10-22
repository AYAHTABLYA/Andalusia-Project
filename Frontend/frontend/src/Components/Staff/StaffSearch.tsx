import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { StaffTab } from "./constants";

// Extra words that should also find a page (the sidebar label alone is too narrow).
const KEYWORDS: Record<string, string> = {
  "/admin": "home dashboard overview summary",
  "/admin/instructors": "teachers mentors trainers staff",
  "/admin/students": "learners trainees enrolled",
  "/admin/courses": "programs classes catalog curriculum",
  "/admin/schedule": "calendar timetable sessions",
  "/admin/compensation": "pay salary payroll payments earnings",
  "/admin/reports": "analytics statistics export",
  "/admin/permissions": "roles access security",
  "/admin/users": "accounts people roles status",
  "/instructor": "home dashboard overview summary",
  "/instructor/courses": "classes batches teaching subjects",
  "/instructor/students": "learners enrolled assigned roster",
  "/instructor/attendance": "present absent register roll call",
  "/instructor/schedule": "calendar timetable sessions classes",
  "/instructor/assignments": "grading homework submissions feedback",
  "/instructor/messages": "chat inbox students",
  "/instructor/earnings": "pay salary payments income",
  "/instructor/availability": "time slots free hours",
};

const normalize = (value: string) => value.toLowerCase().trim();

type Props = { tabs: StaffTab[] };

// Search box in the staff top bar: finds the workspace pages the signed-in role can open.
// Arrow keys + Enter to jump, Esc to close, Ctrl/⌘ + K to focus from anywhere.
function StaffSearch({ tabs }: Props) {
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return tabs;
    const terms = q.split(/\s+/);
    return tabs.filter((tab) => {
      const haystack = normalize(`${tab.label} ${KEYWORDS[tab.to] ?? ""}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [query, tabs]);

  // Ctrl/⌘ + K focuses the search.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside closes the list.
  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  useEffect(() => setActive(0), [query]);

  function go(tab: StaffTab) {
    navigate(tab.to);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) go(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="staff-search" ref={boxRef}>
      <span className="material-symbols-outlined" aria-hidden="true">search</span>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search your workspace..."
        aria-label="Search your workspace"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <kbd aria-hidden="true">⌘ K</kbd>

      {open && (
        <ul id={listId} className="staff-search_results" role="listbox">
          {results.length === 0 ? (
            <li className="staff-search_empty">No matching pages</li>
          ) : (
            results.map((tab, index) => (
              <li key={tab.to} role="option" aria-selected={index === active}>
                <Link
                  to={tab.to}
                  className={`staff-search_item${index === active ? " staff-search_item--active" : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={(event) => {
                    event.preventDefault();
                    go(tab);
                  }}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default StaffSearch;
