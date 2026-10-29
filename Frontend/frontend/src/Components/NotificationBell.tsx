import { useEffect, useRef, useState } from "react";
import "./notification-bell.css";

export type NotificationItem = {
  id: string;
  title: string;
  text?: string;
  time?: string;
  read?: boolean;
};

type Props = {
  /** Notifications to show. Empty by default until a notifications API exists. */
  items?: NotificationItem[];
};

/** Bell button + dropdown, drawn like the LanguageSwitcher next to it. */
export function NotificationBell({ items = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isRead = (n: NotificationItem) => n.read || readIds.includes(n.id);
  const unread = items.filter((n) => !isRead(n)).length;

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        type="button"
        className="notification-bell_trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="notification-bell_icon">
          <path
            d="M6 9.5a6 6 0 1 1 12 0c0 3.2.9 4.9 1.7 5.9.3.4 0 1.1-.6 1.1H4.9c-.6 0-.9-.7-.6-1.1C5.1 14.4 6 12.7 6 9.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M9.8 19.2a2.4 2.4 0 0 0 4.4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {unread > 0 && (
          <span className="notification-bell_badge" data-no-translate>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell_menu" role="dialog" aria-label="Notifications">
          <div className="notification-bell_head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" onClick={() => setReadIds(items.map((n) => n.id))}>
                Mark all as read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="notification-bell_empty">
              <span className="notification-bell_empty-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 9.5a6 6 0 1 1 12 0c0 3.2.9 4.9 1.7 5.9.3.4 0 1.1-.6 1.1H4.9c-.6 0-.9-.7-.6-1.1C5.1 14.4 6 12.7 6 9.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M9.8 19.2a2.4 2.4 0 0 0 4.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <strong>You're all caught up</strong>
              <span>No new notifications right now.</span>
            </div>
          ) : (
            <ul className="notification-bell_list">
              {items.map((n) => (
                <li key={n.id} className={isRead(n) ? "" : "is-unread"}>
                  <button type="button" onClick={() => setReadIds((ids) => [...ids, n.id])}>
                    <span className="notification-bell_dot" />
                    <span className="notification-bell_body">
                      <strong>{n.title}</strong>
                      {n.text && <span>{n.text}</span>}
                      {n.time && <small>{n.time}</small>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
