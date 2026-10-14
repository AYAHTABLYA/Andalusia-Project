import { ACCESS_TOKEN_KEY } from "../apis/academyApi";

const USER_KEY = "user";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
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
  };
}

function updateStoredUser(user: SessionUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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

// Where a signed-in user lands. Only the learner portal exists today.
function homeRouteForRole(_role?: string): string {
  return "/profile";
}

export type { SessionUser };
export {
  getStoredUser,
  saveSession,
  updateStoredUser,
  toSessionUser,
  clearSession,
  homeRouteForRole,
};
