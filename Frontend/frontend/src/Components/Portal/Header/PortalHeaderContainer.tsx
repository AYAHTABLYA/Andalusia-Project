import { useNavigate } from "react-router-dom";
import PortalHeaderComponent from "./PortalHeaderComponent";
import { HEADER_LINKS } from "./constants";
import { clearSession } from "../../../utils/session";
import { logoutRequest } from "../../../apis/portalApi";
import { resolveAssetUrl } from "../../../utils/format";
import useSessionUser from "../../../hooks/portalHooks/useSessionUser";

function PortalHeaderContainer() {
  const navigate = useNavigate();
  const user = useSessionUser();

  // POST /api/auth/logout, then always clear the local session.
  async function logout() {
    try {
      await logoutRequest();
    } catch {
      /* token already invalid / server unreachable: still sign out locally */
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  }

  return (
    <PortalHeaderComponent
      links={HEADER_LINKS}
      name={user?.name || "Learner"}
      role={user?.role ?? "Learner"}
      photoUrl={resolveAssetUrl(user?.photoUrl)}
      onLogout={logout}
    />
  );
}

export default PortalHeaderContainer;
