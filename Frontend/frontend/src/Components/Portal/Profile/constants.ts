type NotificationOption = { id: string; title: string; text: string };

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  { id: "announcements", title: "Course Announcements", text: "Direct notices from faculty mentors" },
  { id: "sms", title: "SMS Session Reminders", text: "Campus lab gate updates" },
  { id: "grades", title: "Grade Release Digests", text: "Instant notification on rubric approval" },
];

export type { NotificationOption };
export { NOTIFICATION_OPTIONS };
