import { apiGet, apiPut, apiPost, apiDelete } from "./academyApi";
import type { NotificationsDto, SendNotificationInput, SendNotificationResult } from "../Types/Notification";

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

// Admin / Manager only: send to ONE user (userId) or to everybody holding a role (role).
export const sendNotification = (input: SendNotificationInput) =>
  apiPost<SendNotificationResult>("/api/notifications", input);
