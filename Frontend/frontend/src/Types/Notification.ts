// Same shape for every dashboard (learner portal, instructor, coordinator, admin):
// the backend scopes /api/notifications to the user in the JWT.
type NotificationDto = {
  id: number;
  title: string;
  message: string;
  type: string; // Info | Success | Warning | Alert
  isRead: boolean;
  createdAt: string; // ISO (UTC)
};

type NotificationsDto = {
  items: NotificationDto[];
  unreadCount: number;
};

export type { NotificationDto, NotificationsDto };
