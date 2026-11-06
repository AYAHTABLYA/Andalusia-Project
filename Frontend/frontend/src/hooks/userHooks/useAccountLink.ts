import { useEffect, useReducer } from "react";
import { isLoggedIn } from "../../apis/academyApi";
import { USER_UPDATED_EVENT, getStoredUser, homeRouteForRole } from "../../utils/session";

type AccountLink = {
  signedIn: boolean;
  role?: string;
  // Where "my account" is: the signed-in user's own workspace, or /login when signed out.
  accountPath: string;
};

// Lets public pages (landing, programs, courses...) send a signed-in user back to their account.
function useAccountLink(): AccountLink {
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    window.addEventListener(USER_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(USER_UPDATED_EVENT, refresh);
  }, []);

  const signedIn = isLoggedIn();
  const role = getStoredUser()?.role;
  return { signedIn, role, accountPath: signedIn ? homeRouteForRole(role) : "/login" };
}

export default useAccountLink;
