const ROLES = [
  {
    key: "learner",
    label: "User",
    heading: "User sign in",
    desc: "Open your courses, schedule, and progress.",
    button: "Sign in as user",
  },
  {
    key: "instructor",
    label: "Instructor",
    heading: "Instructor sign in",
    desc: "Review your learners' work, assign tasks, and track progress.",
    button: "Sign in as instructor",
  },
  {
    key: "manager",
    label: "Manager",
    heading: "Manager sign in",
    desc: "Manage applications, placements, and attendance.",
    button: "Sign in as manager",
  },
  {
    key: "admin",
    label: "Admin",
    heading: "Administrator sign in",
    desc: "Manage programs, users, and system settings.",
    button: "Sign in as admin",
  },
] as const;

export { ROLES };
