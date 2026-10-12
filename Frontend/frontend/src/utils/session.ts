import { ACCESS_TOKEN_KEY } from "../apis/academyApi";
import type { AuthResponse } from "../Types/Auth";

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

// Called after a successful /api/auth/login
function saveSession(auth: AuthResponse): void {
  const user: SessionUser = {
    id: auth.userId,
    name: auth.fullName,
    email: auth.email,
    role: auth.role,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.token);
}

function clearSession(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export type { SessionUser };
export { getStoredUser, saveSession, clearSession };
