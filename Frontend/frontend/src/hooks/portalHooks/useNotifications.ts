import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../apis/notificationApi";
import type { NotificationDto } from "../../Types/Notification";
import { isLoggedIn } from "../../apis/academyApi";

const POLL_MS = 60_000;

// Loads the signed-in user's notifications, refreshes them every minute (and when the tab regains focus),
// and marks items read optimistically.
export function useNotifications(take = 20) {
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    try {
      const data = await getNotifications({ take });
      if (!alive.current) return;
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      setError(false);
    } catch {
      if (alive.current) setError(true);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [take]);

  useEffect(() => {
    alive.current = true;
    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive.current = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const markRead = useCallback(
    async (id: number) => {
      const target = items.find((n) => n.id === id);
      if (!target || target.isRead) return;
      setItems((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await markNotificationRead(id);
      } catch {
        void load(); // roll back to the server's truth
      }
    },
    [items, load],
  );

  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      void load();
    }
  }, [load]);

  return { items, unreadCount, loading, error, reload: load, markRead, markAllRead };
}
