import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "../../apis/academyApi";
import { getStoredUser } from "../../utils/session";
import { homeForRole } from "../../utils/roles";

type RequireRoleProps = {
  // Roles allowed to see the nested routes.
  allow: string[];
};

// Route guard. Not signed in -> /login (and come back after).
// Signed in with the wrong role -> that user's own workspace.
// This only improves the UX: the API rejects the same calls with 403 regardless.
function RequireRole({ allow }: RequireRoleProps) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = getStoredUser()?.role;
  if (!role || !allow.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <Outlet />;
}

export default RequireRole;
