const ROLES = [
  {
    key: "student",
    label: "Student",
    heading: "Student sign in",
    desc: "Use your student credentials to open your courses and schedule.",
    button: "Sign in to student workspace",
  },
  {
    key: "instructor",
    label: "Instructor",
    heading: "Instructor sign in",
    desc: "View your cohorts, gradebooks, hall schedules, and lab bookings.",
    button: "Sign in to faculty hall",
  },
  {
    key: "coordinator",
    label: "Coordinator",
    heading: "Coordinator sign in",
    desc: "Manage campus logistics, student rosters, and attendance.",
    button: "Sign in to operations",
  },
  {
    key: "admin",
    label: "Admin",
    heading: "Administrator sign in",
    desc: "Access accreditation records, campus settings, and system controls.",
    button: "Sign in to admin console",
  },
] as const;

export { ROLES };
