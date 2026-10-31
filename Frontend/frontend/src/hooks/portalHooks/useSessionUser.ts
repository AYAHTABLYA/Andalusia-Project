import { useEffect, useState } from "react";
import { getMe } from "../../apis/portalApi";
import { USER_UPDATED_EVENT, getStoredUser, toSessionUser, updateStoredUser } from "../../utils/session";
import type { SessionUser } from "../../utils/session";

// Shows the stored user immediately, then refreshes it from GET /api/auth/me.
// (A 401 is handled globally in apiClient: the session is cleared -> /login.)
function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(getStoredUser);

  useEffect(() => {
    const controller = new AbortController();
    getMe(controller.signal)
      .then((raw) => {
        const fresh = toSessionUser(raw);
        if (controller.signal.aborted || !fresh.email) return;
        // /auth/me may not include the photo: keep the one we already have.
        const merged = { ...fresh, photoUrl: fresh.photoUrl ?? getStoredUser()?.photoUrl ?? null };
        updateStoredUser(merged);
        setUser(merged);
      })
      .catch(() => {
        /* keep the stored user */
      });
    const onUpdated = () => setUser(getStoredUser());
    window.addEventListener(USER_UPDATED_EVENT, onUpdated);
    return () => {
      controller.abort();
      window.removeEventListener(USER_UPDATED_EVENT, onUpdated);
    };
  }, []);

  return user;
}

export default useSessionUser;
