import { ACCESS_TOKEN_KEY } from "../apis/academyApi";
import { homeForRole } from "./roles";

const USER_KEY = "user";
const USER_UPDATED_EVENT = "andalusia-user-updated";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  photoUrl?: string | null;
};

function getStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

// Accepts the AuthResponseDto (login) or the /api/auth/me payload, in camelCase or PascalCase.
function toSessionUser(raw: any): SessionUser {
  return {
    id: raw.userId ?? raw.UserId ?? raw.id ?? raw.Id,
    name: raw.fullName ?? raw.FullName ?? raw.name ?? raw.Name ?? "",
    email: raw.email ?? raw.Email ?? "",
    role: raw.role ?? raw.Role ?? "Learner",
    permissions: raw.permissions ?? raw.Permissions ?? [],
    photoUrl:
      raw.profileImageUrl ?? raw.ProfileImageUrl ?? raw.photoUrl ?? raw.PhotoUrl ?? raw.avatarUrl ?? null,
  };
}

function updateStoredUser(user: SessionUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // lets the header (and anything else showing the user) refresh immediately
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
}

// Called after a successful login / verify-login-otp.
function saveSession(response: any): void {
  const token = response.token ?? response.Token;
  if (!token) throw new Error("The API did not return an access token.");
  updateStoredUser(toSessionUser(response));
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function clearSession(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Where a signed-in user lands: each role has its own workspace (see utils/roles.ts).
function homeRouteForRole(role?: string): string {
  return homeForRole(role);
}

// UI-only convenience (hide buttons/links). The API still enforces every permission.
function hasPermission(permission: string): boolean {
  return (getStoredUser()?.permissions ?? []).includes(permission);
}

export type { SessionUser };
export {
  USER_UPDATED_EVENT,
  getStoredUser,
  saveSession,
  updateStoredUser,
  toSessionUser,
  clearSession,
  homeRouteForRole,
  hasPermission,
};
