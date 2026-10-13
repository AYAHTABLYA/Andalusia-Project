import type { EnrollmentSummary, ProfileMetric } from "../../../Types/Profile";

// Sample learning overview (replace with real data once the API exists).
const PROFILE_METRICS: ProfileMetric[] = [
  {
    id: "enrolment",
    label: "Active Enrolment",
    icon: "menu_book",
    value: "2 Programs",
    caption: "5 Concurrent Active Modules",
    footerLeft: "Next milestone: Nov 15",
    footerRight: "→",
  },
  {
    id: "progress",
    label: "Progression Index",
    icon: "trending_up",
    value: "78%",
    valueNote: "+6.4% this month",
    caption: "Average Academic Mastery",
    progress: 78,
    footerLeft: "On track for graduation",
  },
  {
    id: "labs",
    label: "Hands-on Labs",
    icon: "science",
    value: "18",
    valueNote: "/ 24",
    caption: "Verified lab terminals",
    footerLeft: "6 labs remaining this term",
  },
  {
    id: "attendance",
    label: "Campus Attendance",
    icon: "co_present",
    value: "94.2%",
    caption: "Board standard: >85% met",
    footerLeft: "Exemplary record",
    footerRight: "0 unexcused",
  },
];

const CURRENT_ENROLLMENT: EnrollmentSummary = {
  status: "Cohort 03 • In Progress",
  degree: "Certified Digital Banking Architect & Open Finance Program",
  accreditation: "Accredited by the Institutional Excellence Board & Pearson Assured standards.",
  module: "Enterprise Generative AI & Regulatory Compliance in Banking",
  progress: 72,
  mentor: "Dr. Tarek Mansour",
  nextSession: "Saturday, Nov 08 • 10:00 AM - 02:00 PM",
  deliverable: "Vector Embeddings Sandbox Defense",
  deliverableDue: "Due in 4 Days",
};

type NotificationOption = { id: string; title: string; text: string };

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  { id: "announcements", title: "Course Announcements", text: "Direct notices from faculty mentors" },
  { id: "sms", title: "SMS Session Reminders", text: "Campus lab gate updates" },
  { id: "grades", title: "Grade Release Digests", text: "Instant notification on rubric approval" },
];

// Same campuses the backend returns from GET /api/campuses
const CAMPUS_OPTIONS = [
  "Alexandria: Gleem Campus",
  "Alexandria: Smouha Campus",
  "Online / Virtual Campus",
];

export type { NotificationOption };
export { PROFILE_METRICS, CURRENT_ENROLLMENT, NOTIFICATION_OPTIONS, CAMPUS_OPTIONS };
