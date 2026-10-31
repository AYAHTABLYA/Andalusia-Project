import { Navigate, Outlet, useLocation } from "react-router-dom";
import PortalHeaderContainer from "./Header/PortalHeaderContainer";
import WorkspaceNavContainer from "./WorkspaceNav/WorkspaceNavContainer";
import AcademyFooterComponent from "../Academy/Footer/AcademyFooterComponent";
import Toast from "./Shared/Toast";
import useToast from "../../hooks/portalHooks/useToast";
import usePayments from "../../hooks/portalHooks/usePayments";
import { isLoggedIn } from "../../apis/academyApi";
import type { PortalOutletContext } from "../../Types/PortalContext";
import "../Academy/theme.css";
import "./theme.css";

function PortalShell() {
  const { toast, showToast, closeToast } = useToast();
  const payments = usePayments();

  const dueCount = payments.transactions.filter((t) => t.status === "pending").length;
  const context: PortalOutletContext = { showToast, payments };

  return (
    <div className="portal">
      <PortalHeaderContainer />
      <WorkspaceNavContainer dueCount={dueCount} />
      <main className="portal_main">
        <Outlet context={context} />
      </main>
      <AcademyFooterComponent />
      <Toast visible={toast.visible} message={toast.message} onClose={closeToast} />
    </div>
  );
}

// Both portal pages need a logged-in learner; everyone else goes to /login.
function PortalLayout() {
  const location = useLocation();
  return isLoggedIn() ? (
    <PortalShell />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}

export default PortalLayout;
