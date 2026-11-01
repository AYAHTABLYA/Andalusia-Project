import { apiGet, apiPut, apiDelete } from "./academyApi";
import type { NotificationsDto } from "../Types/Notification";

export const getNotifications = (
  params?: { unreadOnly?: boolean; take?: number },
  signal?: AbortSignal,
) => apiGet<NotificationsDto>("/api/notifications", params, signal);

export const getUnreadNotificationCount = (signal?: AbortSignal) =>
  apiGet<{ unreadCount: number }>("/api/notifications/unread-count", undefined, signal);

export const markNotificationRead = (id: number) =>
  apiPut<void>(`/api/notifications/${id}/read`, {});

export const markAllNotificationsRead = () => apiPut<void>("/api/notifications/read-all", {});

export const deleteNotification = (id: number) => apiDelete(`/api/notifications/${id}`);
