// Role names must match the ROLES table / AppRoles.cs on the API.
const ROLES = {
  learner: "Learner",
  instructor: "Instructor",
  coordinator: "Coordinator",
  manager: "Manager",
  admin: "Admin",
  contentManager: "Content_Manager",
} as const;

type RoleName = (typeof ROLES)[keyof typeof ROLES];

// First screen of each role after login.
const ROLE_HOME: Record<RoleName, string> = {
  [ROLES.learner]: "/profile",
  [ROLES.instructor]: "/instructor",
  [ROLES.coordinator]: "/coordinator",
  [ROLES.manager]: "/admin",
  [ROLES.admin]: "/admin",
  [ROLES.contentManager]: "/admin/courses",
};

// URL prefixes each role may open inside the signed-in area.
// Learner pages live at the root (/profile, /payments, ...), so they are listed explicitly.
const LEARNER_PATHS = ["/profile", "/payments", "/checkout", "/applications", "/enrollments", "/workspace", "/learn"];
const ROLE_PATHS: Record<RoleName, string[]> = {
  [ROLES.learner]: LEARNER_PATHS,
  [ROLES.instructor]: ["/instructor", "/profile"],
  [ROLES.coordinator]: ["/coordinator", "/profile"],
  [ROLES.manager]: ["/admin", "/profile"],
  [ROLES.admin]: ["/admin", "/profile"],
  [ROLES.contentManager]: ["/admin/courses", "/profile"],
};

function isKnownRole(role?: string | null): role is RoleName {
  return !!role && role in ROLE_HOME;
}

function homeForRole(role?: string | null): string {
  return isKnownRole(role) ? ROLE_HOME[role] : "/profile";
}

function canOpenPath(role: string | null | undefined, pathname: string): boolean {
  if (!isKnownRole(role)) return false;
  return ROLE_PATHS[role].some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

export type { RoleName };
export { ROLES, ROLE_HOME, homeForRole, canOpenPath, isKnownRole };
