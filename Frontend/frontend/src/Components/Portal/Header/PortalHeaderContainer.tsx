import { useNavigate } from "react-router-dom";
import PortalHeaderComponent from "./PortalHeaderComponent";
import { HEADER_LINKS } from "./constants";
import { clearSession, getStoredUser } from "../../../utils/session";

function PortalHeaderContainer() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <PortalHeaderComponent
      links={HEADER_LINKS}
      name={user?.name ?? "Learner"}
      role={user?.role ?? "Learner"}
      onLogout={logout}
    />
  );
}

export default PortalHeaderContainer;
