import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../hooks/portalHooks/useNotifications";
import "./notification-bell.css";

// "5 min ago", "2 h ago", "3 d ago", then a plain date.
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Bell button + dropdown, drawn like the LanguageSwitcher next to it.
 * Self-contained: it loads the signed-in user's notifications from /api/notifications,
 * so the same component works in the learner portal and in every staff dashboard.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, unreadCount: unread, markRead, markAllRead, reload } = useNotifications();
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

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        type="button"
        className="notification-bell_trigger"
        onClick={() => {
          if (!open) reload();
          setOpen((o) => !o);
        }}
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
              <button type="button" onClick={() => void markAllRead()}>
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
                <li key={n.id} className={n.isRead ? "" : "is-unread"}>
                  <button type="button" onClick={() => void markRead(n.id)}>
                    <span className="notification-bell_dot" />
                    <span className="notification-bell_body">
                      <strong>{n.title}</strong>
                      {n.message && <span>{n.message}</span>}
                      <small data-no-translate>{timeAgo(n.createdAt)}</small>
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
