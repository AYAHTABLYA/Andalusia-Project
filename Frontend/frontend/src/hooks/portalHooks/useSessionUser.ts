import { useEffect, useState } from "react";
import { getMe } from "../../apis/portalApi";
import { getStoredUser, toSessionUser, updateStoredUser } from "../../utils/session";
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
        updateStoredUser(fresh);
        setUser(fresh);
      })
      .catch(() => {
        /* keep the stored user */
      });
    return () => controller.abort();
  }, []);

  return user;
}

export default useSessionUser;
